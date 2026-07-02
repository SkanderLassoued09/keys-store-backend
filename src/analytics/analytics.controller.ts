import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../auth/auth.decorators';

@ApiTags('Analytics')
@Roles('admin') // Business intelligence is owner-only, enforced server-side.
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('employees')
  @ApiOperation({
    summary: 'Aggregated per-employee performance + financial KPIs',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  employees(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.employees(startDate, endDate);
  }

  @Get('business')
  @ApiOperation({
    summary:
      'Full Business Intelligence dashboard (KPIs, trends, employees, categories, articles, suppliers, returns) for a date range',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  business(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.business(startDate, endDate);
  }
}
