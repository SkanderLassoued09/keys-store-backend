// src/modules/service/service.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrder } from './entities/work-order.entity';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectModel(WorkOrder.name)
    private readonly workOrderModel: Model<WorkOrder>,
  ) {}

  async create(
    createWorkOrderDto: CreateWorkOrderDto,
  ): Promise<WorkOrder | any> {
    try {
      const createdWorkOrder = new this.workOrderModel(createWorkOrderDto);
      return createdWorkOrder.save();
    } catch (error) {
      console.log('error', error);
    }
  }

  async findAll(): Promise<WorkOrder[] | any> {
    try {
      return this.workOrderModel
        .find()
        .populate('employee client machine')
        .exec();
    } catch (error) {
      console.log('error', error);
    }
  }

  // ✅ Create multiple work orders (Bulk Insert)
  async createBulkOrderService(createBulkWorkOrderDto: any) {
    try {
      const result = await this.workOrderModel.insertMany(
        createBulkWorkOrderDto.orderServices,
        {
          ordered: true, // Stop on first error (default: true)
          // ordered: false, // Continue even if some documents fail
        },
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: string): Promise<WorkOrder | any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      const workOrder = await this.workOrderModel
        .findById(id)
        .populate('employee client machine')
        .exec();
      if (!workOrder) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      return workOrder;
    } catch (error) {
      console.log('error', error);
    }
  }

  async update(
    id: string,
    updateWorkOrderDto: UpdateWorkOrderDto,
  ): Promise<WorkOrder | any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      const updatedWorkOrder = await this.workOrderModel
        .findByIdAndUpdate(id, updateWorkOrderDto, { new: true })
        .populate('employee client machine')
        .exec();
      if (!updatedWorkOrder) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      return updatedWorkOrder;
    } catch (error) {
      console.log('error', error);
    }
  }

  async remove(id: string): Promise<{ message: string } | any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      const deleted = await this.workOrderModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new NotFoundException(`WorkOrder with id ${id} not found`);
      }
      return { message: 'WorkOrder deleted successfully' };
    } catch (error) {
      console.log('error', error);
    }
  }
}
