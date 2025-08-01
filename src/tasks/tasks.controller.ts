import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './task.dto';
import { TaskStatus } from './schemas/task.schema';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '../guard/roles-guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @SetMetadata('roles', ['ADMIN'])
  @Patch(':id/status')
  update(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasksService.updateTaskStatus(id, dto.status);
  }
}
