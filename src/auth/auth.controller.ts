import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  createToken(@Payload('user') user: unknown) {
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

  @MessagePattern({ cmd: 'logoutEverywhere' })
  revokeUserTokens(@Payload('user') user: unknown) {
    return this.authService.revokeUserTokens(user);
  }
}
