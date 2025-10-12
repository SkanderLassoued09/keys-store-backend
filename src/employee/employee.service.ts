import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const createdEmployee = new this.employeeModel(createEmployeeDto);
    return createdEmployee.save();
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().populate('services').exec();
  }

  async findOne(id: string): Promise<Employee> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    const employee = await this.employeeModel
      .findById(id)
      .populate('services')
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    const updatedEmployee = await this.employeeModel
      .findByIdAndUpdate(id, updateEmployeeDto, { new: true })
      .populate('services')
      .exec();
    if (!updatedEmployee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return updatedEmployee;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    const deleted = await this.employeeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return { message: 'Employee deleted successfully' };
  }
}
