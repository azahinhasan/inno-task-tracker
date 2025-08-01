import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel(dto);
    return createdTask.save();
  }

  async listTasks(query: {
    status?: TaskStatus;
    dueFrom?: string;
    dueTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, dueFrom, dueTo, search, page = 1, limit = 10 } = query;

    const filter: any = {};

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

    const total = await this.taskModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const tasks = await this.taskModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.status = status;
    return task.save();
  }
}
