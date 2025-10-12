import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';

@ApiTags('Providers')
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({ status: 201, description: 'Provider created', type: Provider })
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(createProviderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({
    status: 200,
    description: 'List of providers',
    type: [Provider],
  })
  findAll() {
    return this.providerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Provider found', type: Provider })
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update provider by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Provider updated', type: Provider })
  update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete provider by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Provider deleted' })
  remove(@Param('id') id: string) {
    return this.providerService.remove(id);
  }
}
