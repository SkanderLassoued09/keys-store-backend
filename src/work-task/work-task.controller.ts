import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkTaskService } from './work-task.service';
import { CreateWorkTaskDto } from './dto/create-work-task.dto';
import { UpdateWorkTaskDto } from './dto/update-work-task.dto';
import { WorkTask } from './entities/work-task.entity';

@ApiTags('Work Tasks')
@Controller('work-task')
export class WorkTaskController {
  constructor(private readonly workTaskService: WorkTaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new work task' })
  @ApiResponse({ status: 201, description: 'Task created', type: WorkTask })
  create(@Body() createWorkTaskDto: CreateWorkTaskDto) {
    return this.workTaskService.create(createWorkTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all work tasks (optionally by status)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(@Query('status') status?: string) {
    return this.workTaskService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work task by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.workTaskService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update work task by ID' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() updateWorkTaskDto: UpdateWorkTaskDto,
  ) {
    return await this.workTaskService.update(id, updateWorkTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete work task by ID' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.workTaskService.remove(id);
  }
}
