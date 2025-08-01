import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './task.dto';
import { TaskStatus } from './schemas/task.schema';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
  }

  @Get()
  list(
    @Query('status') status?: TaskStatus,
    @Query('dueFrom') dueFrom?: string,
    @Query('dueTo') dueTo?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tasksService.listTasks({
      status,
      dueFrom,
      dueTo,
      search,
      page,
      limit,
    });
  }

  @Patch(':id/status')
  update(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasksService.updateTaskStatus(id, dto.status);
  }
}
