import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './task.dto';
import { LoggingsService } from '../logging/logging.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private readonly logsService: LoggingsService,
  ) {}

  async createTask(dto: CreateTaskDto, userId: string) {
    const session = await this.taskModel.db.startSession();
    session.startTransaction();
    try {
      const existing = await this.taskModel
        .findOne({ title: dto.title })
        .session(session);
      if (existing) {
        throw new ConflictException(
          `Task with title "${dto.title}" already exists.`,
        );
      }

      const task = await this.taskModel.create([{ ...dto, createdBy: userId }], { session });

      await this.logsService.create('CREATE_TASK', 'SUCCESS', userId);
      await session.commitTransaction();
      session.endSession();

      return task[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      await this.logsService.create('CREATE_TASK', 'FAILED', userId);
      console.error(error);
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async listTasks(query: {
    status?: TaskStatus;
    dueFrom?: string;
    dueTo?: string;
    search?: string;
    page?: number;
    limit?: number;
    userId: string;
  }) {
    const { status, dueFrom, dueTo, search, page = 1, limit = 10, userId } = query;
    const filter: any = { createdBy: userId };

    if (status) {
      filter.status = status;
    }

    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
      if (dueTo) filter.dueDate.$lte = new Date(dueTo);
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const session = await this.taskModel.db.startSession();
    session.startTransaction();

    try {
      const total = await this.taskModel
        .countDocuments(filter)
        .session(session);
      const tasks = await this.taskModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .session(session)
        .exec();

      await this.logsService.create('LIST_TASKS', 'SUCCESS', userId);
      await session.commitTransaction();
      session.endSession();

      return {
        data: tasks,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      await this.logsService.create('LIST_TASKS', 'FAILED', userId);
      console.error(error);
      throw new InternalServerErrorException('Failed to list tasks');
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus, userId: string) {
    const session = await this.taskModel.db.startSession();
    session.startTransaction();

    try {
      const task = await this.taskModel.findById(id).session(session);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      task.status = status;
      const updated = await task.save({ session });

      await this.logsService.create('UPDATE_TASK_STATUS', 'SUCCESS', userId);
      await session.commitTransaction();
      session.endSession();

      return updated;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error instanceof NotFoundException) throw error;

      await this.logsService.create('UPDATE_TASK_STATUS', 'FAILED', userId);
      console.error(error);
      throw new InternalServerErrorException('Failed to update task status');
    }
  }

  async deleteTask(id: string, userId: string) {
    const session = await this.taskModel.db.startSession();
    session.startTransaction();

    try {
      const task = await this.taskModel.findById(id).session(session);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const deleted = await this.taskModel
        .findByIdAndDelete(id, { session })
        .exec();

      await this.logsService.create('DELETE_TASK', 'SUCCESS', userId);
      await session.commitTransaction();
      session.endSession();

      return deleted;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error instanceof NotFoundException) throw error;

      await this.logsService.create('DELETE_TASK', 'FAILED', userId);
      console.error(error);
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
