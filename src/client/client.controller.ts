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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@ApiTags('Clients')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created', type: Client })
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'List of clients', type: [Client] })
  findAll() {
    return this.clientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client found', type: Client })
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client updated', type: Client })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return await this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client deleted' })
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
