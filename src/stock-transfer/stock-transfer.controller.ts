import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { StockTransferService } from './stock-transfer.service';

@Controller('stock-transfer')
export class StockTransferController {
  constructor(private readonly transferService: StockTransferService) {}

  @ApiOperation({ summary: 'Transfer stock from Maison to Magasin' })
  @ApiResponse({ status: 201, description: 'Transfer applied; updated article returned.' })
  @ApiResponse({ status: 409, description: 'Insufficient stock.' })
  @Post()
  create(@Body() dto: CreateStockTransferDto) {
    return this.transferService.create(dto);
  }

  @ApiOperation({ summary: 'List all stock transfers (most recent first)' })
  @Get()
  findAll() {
    return this.transferService.findAll();
  }
}
