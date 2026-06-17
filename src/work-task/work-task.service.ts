import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWorkTaskDto } from './dto/create-work-task.dto';
import { UpdateWorkTaskDto } from './dto/update-work-task.dto';
import { WorkTask } from './entities/work-task.entity';

@Injectable()
export class WorkTaskService {
  constructor(
    @InjectModel(WorkTask.name)
    private readonly workTaskModel: Model<WorkTask>,
  ) {}

  async create(createWorkTaskDto: CreateWorkTaskDto): Promise<WorkTask> {
    const created = new this.workTaskModel(createWorkTaskDto);
    return created.save();
  }

  // Optional status filter so the Kanban can also query a single column.
  async findAll(status?: string): Promise<WorkTask[]> {
    const filter: Record<string, any> = {};
    if (status) {
      if (!['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(status)) {
        throw new BadRequestException(`Invalid status ${status}`);
      }
      filter.status = status;
    }
    return this.workTaskModel
      .find(filter)
      .populate('employee', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<WorkTask> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const task = await this.workTaskModel
      .findById(id)
      .populate('employee', 'firstName lastName')
      .exec();
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(
    id: string,
    updateWorkTaskDto: UpdateWorkTaskDto,
  ): Promise<WorkTask> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const updated = await this.workTaskModel
      .findByIdAndUpdate(id, updateWorkTaskDto, { new: true })
      .populate('employee', 'firstName lastName')
      .exec();
    if (!updated) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const deleted = await this.workTaskModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return { message: 'Task deleted successfully' };
  }
}
