import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsString,
//   IsOptional,
//   IsDate,
//   IsNumber,
//   IsBoolean,
//   IsArray,
// } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'First name of the employee' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the employee' })
  lastName: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Hire date', required: false })
  hireDate?: Date;

  @ApiProperty({ description: 'Salary of the employee', required: false })
  salary?: number;

  @ApiProperty({
    description: 'Array of WorkOrder IDs assigned to employee',
    type: [String],
    required: false,
  })
  services?: string[];

  @ApiProperty({
    description: 'Is the employee active?',
    default: true,
    required: false,
  })
  isActive?: boolean;
}
