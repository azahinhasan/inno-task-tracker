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
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guard/roles-guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common/decorators/core';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @SetMetadata('roles', ['ADMIN'])
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.createTask(dto, user.userId);
  }

  @Get()
  @CacheKey('listTasksCache')
  @UseInterceptors(CacheInterceptor)
  list(
    @Query('status') status?: TaskStatus,
    @Query('dueFrom') dueFrom?: string,
    @Query('dueTo') dueTo?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ) {
    return this.tasksService.listTasks({
      status,
      dueFrom,
      dueTo,
      search,
      page,
      limit,
      userId: user.userId,
    });
  }

  @Patch(':id/status')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.updateTaskStatus(id, dto.status, user.userId);
  }
}
