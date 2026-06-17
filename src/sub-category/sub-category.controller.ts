import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategory } from './entities/sub-category.entity';

@ApiTags('SubCategories')
@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sub-category' })
  @ApiResponse({
    status: 201,
    description: 'SubCategory created',
    type: SubCategory,
  })
  create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoryService.create(createSubCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub-categories (optionally by category)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of sub-categories',
    type: [SubCategory],
  })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.subCategoryService.findAll(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sub-category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SubCategory ID' })
  @ApiResponse({
    status: 200,
    description: 'SubCategory found',
    type: SubCategory,
  })
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sub-category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SubCategory ID' })
  @ApiResponse({
    status: 200,
    description: 'SubCategory updated',
    type: SubCategory,
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return await this.subCategoryService.update(id, updateSubCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sub-category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'SubCategory ID' })
  @ApiResponse({ status: 200, description: 'SubCategory deleted' })
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(id);
  }
}
