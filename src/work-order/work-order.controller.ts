import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Controller('work-order')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    return this.workOrderService.create(createWorkOrderDto);
  }

  @Get()
  findAll() {
    return this.workOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkOrderDto: UpdateWorkOrderDto) {
    return this.workOrderService.update(+id, updateWorkOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrderService.remove(+id);
  }
}
