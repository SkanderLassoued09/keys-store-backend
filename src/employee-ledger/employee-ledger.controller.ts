import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EmployeeLedgerService } from './employee-ledger.service';
import { CreateEmployeeLedgerDto } from './dto/create-employee-ledger.dto';

@ApiTags('Employee Ledger')
@Controller('employee-ledger')
export class EmployeeLedgerController {
  constructor(private readonly employeeLedgerService: EmployeeLedgerService) {}

  @Post()
  @ApiOperation({ summary: 'Create an employee ledger movement' })
  @ApiResponse({ status: 201, description: 'Ledger entry created' })
  create(@Body() createEmployeeLedgerDto: CreateEmployeeLedgerDto) {
    return this.employeeLedgerService.create(createEmployeeLedgerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employee ledger movements' })
  findAll() {
    return this.employeeLedgerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ledger entry by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.employeeLedgerService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ledger entry by ID' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.employeeLedgerService.remove(id);
  }
}
