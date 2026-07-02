import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Root health check stays open (the global auth guard would otherwise 401 it).
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
