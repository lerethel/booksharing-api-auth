import KeyvRedis from '@keyv/redis';
import { Module } from '@nestjs/common';
import Keyv from 'keyv';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      // This instance maps tokens to users. Each token is created on logging in.
      // If a user has logged in on multiple devices, each device will have its own token.
      provide: 'TOKEN_CACHE',
      useFactory: () =>
        new Keyv({
          store: new KeyvRedis(process.env.REDIS_URI!),
          namespace: 'TOKEN_CACHE',
        }),
    },
    {
      // This instance maps users to tokens. Each user will have an array of tokens.
      // This makes it possible to delete or update all of a user's tokens without iterating
      // through the entire cache, although it does double the cache size.
      provide: 'USER_CACHE',
      useFactory: () =>
        new Keyv({
          store: new KeyvRedis(process.env.REDIS_URI!),
          namespace: 'USER_CACHE',
        }),
    },
  ],
})
export class AuthModule {}
