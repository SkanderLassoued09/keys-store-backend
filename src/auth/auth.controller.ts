import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser, Public, Roles } from './auth.decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate and receive a JWT' })
  login(@Body() dto: { username?: string; password?: string }) {
    return this.authService.login(dto?.username, dto?.password);
  }

  @Get('me')
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentUser() user: any) {
    return this.authService.me(user.sub);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change own password' })
  changePassword(
    @CurrentUser() user: any,
    @Body() dto: { oldPassword?: string; newPassword?: string },
  ) {
    return this.authService.changePassword(user.sub, dto?.oldPassword, dto?.newPassword);
  }

  // ===== Owner-only user management =====
  @Roles('admin')
  @Get('users')
  @ApiOperation({ summary: 'List login accounts (owner only)' })
  listUsers() {
    return this.authService.listUsers();
  }

  @Roles('admin')
  @Post('users')
  @ApiOperation({ summary: 'Create a login account (owner only)' })
  createUser(@Body() dto: any) {
    return this.authService.createUser(dto);
  }

  @Roles('admin')
  @Patch('users/:id')
  @ApiOperation({ summary: 'Update / deactivate / reset a login account (owner only)' })
  updateUser(@Param('id') id: string, @Body() dto: any) {
    return this.authService.updateUser(id, dto);
  }
}
