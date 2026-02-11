import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { Machine } from './entities/machine.entity';

@Injectable()
export class MachineService {
  constructor(
    @InjectModel(Machine.name) private readonly machineModel: Model<Machine>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const createdMachine = new this.machineModel(createMachineDto);
    return await createdMachine.save();
  }

  async findAll(): Promise<Machine[]> {
    return this.machineModel.find().populate('fournisseur').exec();
  }

  async findOne(id: string): Promise<Machine> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Machine with id ${id} not found`);
    }
    const machine = await this.machineModel
      .findById(id)
      .populate('fournisseur')
      .exec();
    if (!machine) {
      throw new NotFoundException(`Machine with id ${id} not found`);
    }
    return machine;
  }

  async update(
    id: string,
    updateMachineDto: UpdateMachineDto,
  ): Promise<Machine> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Machine with id ${id} not found`);
    }
    const updatedMachine = await this.machineModel
      .findByIdAndUpdate(id, updateMachineDto, { new: true })
      .populate('fournisseur')
      .exec();
    if (!updatedMachine) {
      throw new NotFoundException(`Machine with id ${id} not found`);
    }
    return updatedMachine;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Machine with id ${id} not found`);
    }
    const deleted = await this.machineModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Machine with id ${id} not found`);
    }
    return { message: 'Machine deleted successfully' };
  }
}
