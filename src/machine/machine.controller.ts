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
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { Machine } from './entities/machine.entity';

@ApiTags('Machines')
@Controller('machine')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new machine' })
  @ApiResponse({ status: 201, description: 'Machine created', type: Machine })
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machineService.create(createMachineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all machines' })
  @ApiResponse({
    status: 200,
    description: 'List of machines',
    type: [Machine],
  })
  findAll() {
    return this.machineService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get machine by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine found', type: Machine })
  findOne(@Param('id') id: string) {
    return this.machineService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update machine by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine updated', type: Machine })
  update(@Param('id') id: string, @Body() updateMachineDto: UpdateMachineDto) {
    return this.machineService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete machine by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine deleted' })
  remove(@Param('id') id: string) {
    return this.machineService.remove(id);
  }
}
