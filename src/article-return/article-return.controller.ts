import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArticleReturnService } from './article-return.service';
import { CreateArticleReturnDto } from './dto/create-article-return.dto';

@Controller('article-return')
export class ArticleReturnController {
  constructor(private readonly articleReturnService: ArticleReturnService) {}

  @ApiOperation({ summary: 'Create an article return record' })
  @ApiResponse({ status: 201, description: 'Article return created.' })
  @Post()
  create(@Body() dto: CreateArticleReturnDto) {
    return this.articleReturnService.create(dto);
  }

  @ApiOperation({ summary: 'Get all article returns' })
  @Get()
  findAll() {
    return this.articleReturnService.findAll();
  }

  @ApiOperation({ summary: 'Get article return by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleReturnService.findOne(id);
  }
}
