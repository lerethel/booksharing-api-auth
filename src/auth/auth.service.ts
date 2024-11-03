import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import Keyv from 'keyv';

const maxAge = 1000 * 60 * 60 * 24 * 180;

@Injectable()
export class AuthService {
  constructor(
    @Inject('TOKEN_CACHE') private readonly tokenCache: Keyv<unknown>,
    @Inject('USER_CACHE') private readonly userCache: Keyv<string[]>,
  ) {}

  async createToken(user: unknown) {
    const token = randomBytes(24).toString('hex');
    const userTokens = (await this.userCache.get(String(user))) ?? [];

    await Promise.all([
      this.tokenCache.set(token, user, maxAge),
      this.userCache.set(String(user), [...userTokens, token], maxAge),
    ]);

    return { token, maxAge };
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    const user = await this.tokenCache.get(token);
    const userTokens = user ? await this.userCache.get(String(user)) : null;

    if (!user || !userTokens) {
      throw new ForbiddenException();
    }

    // Extend the session lifetime if the user is active.
    await Promise.all([
      this.tokenCache.set(token, user, maxAge),
      this.userCache.set(String(user), userTokens, maxAge),
    ]);

    return user;
  }

  async revokeToken(token: string) {
    await this.tokenCache.delete(token);
    return null;
  }

  async revokeUserTokens(user: unknown) {
    // Records in tokenCache aren't deleted because they won't pass
    // the validity check above anyway and eventially will expire.
    await this.userCache.delete(String(user));
    return null;
  }
}
