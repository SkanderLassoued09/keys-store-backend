import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@ApiTags('Employees') // Swagger group name
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created', type: Employee })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'List of employees',
    type: [Employee],
  })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee found', type: Employee })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee updated', type: Employee })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return await this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
