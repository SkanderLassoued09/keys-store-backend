import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  AppService;
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    this.logger.log({
      message: 'User created successfully',
      context: 'UserService',
      module: 'AuthModule',
      status: 'SUCCESS',
      data: { userId: 123, email: 'test@example.com' },
    });

    this.logger.error({
      message: 'Failed to create user',
      context: 'UserService',
      module: 'AuthModule',
      status: 'FAIL',
      data: { email: 'test@example.com' },
      trace: 'Stack trace here...',
    });

    return 'Hello World!';
  }
}
