import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { User } from './interfaces/user.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  createToken(@Payload('user') user: User) {
    return this.authService.createToken(user);
  }

  @MessagePattern({ cmd: 'authorize' })
  verifyToken(@Payload('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @MessagePattern({ cmd: 'logout' })
  revokeToken(@Payload('token') token: string) {
    return this.authService.revokeToken(token);
  }

  @MessagePattern({ cmd: 'updateRole' })
  updateUserRole(@Payload('user') user: User) {
    return this.authService.updateUserRole(user);
  }

  @MessagePattern({ cmd: 'logoutEverywhere' })
  revokeUserTokens(@Payload('id') id: unknown) {
    return this.authService.revokeUserTokens(id);
  }
}
