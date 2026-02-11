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
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('work-order')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @ApiOperation({ summary: 'Create a new work order' })
  @ApiResponse({ status: 201, description: 'Work order created successfully.' })
  @Post()
  create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    return this.workOrderService.create(createWorkOrderDto);
  }

  @ApiOperation({ summary: 'Get all work orders' })
  @Get()
  findAll() {
    return this.workOrderService.findAll();
  }

  // ✅ Create multiple work orders (Bulk Insert)
  @ApiOperation({ summary: 'Create multiple work orders in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Work orders created successfully.',
    type: [CreateWorkOrderDto],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @Post('bulk')
  async createBulk(@Body() createBulkWorkOrderDto: any) {
    const result = await this.workOrderService.createBulkOrderService(
      createBulkWorkOrderDto,
    );
    console.log('Bulk insert result:', result);
    return result;
  }

  @ApiOperation({ summary: 'Get work order by ID' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  @ApiOperation({ summary: 'Update work order by ID' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
  ) {
    return await this.workOrderService.update(id, updateWorkOrderDto);
  }

  @ApiOperation({ summary: 'Delete work order by ID' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrderService.remove(id);
  }
}
