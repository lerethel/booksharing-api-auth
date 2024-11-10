import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import Keyv from 'keyv';
import { User } from './interfaces/user.interface';

const maxAge = 1000 * 60 * 60 * 24 * 180;

@Injectable()
export class AuthService {
  constructor(
    @Inject('TOKEN_CACHE') private readonly tokenCache: Keyv<User>,
    @Inject('USER_CACHE') private readonly userCache: Keyv<string[]>,
  ) {}

  async createToken(user: User) {
    const token = randomBytes(24).toString('hex');
    const userTokens = (await this.userCache.get(String(user.id))) ?? [];

    await Promise.all([
      this.tokenCache.set(token, user, maxAge),
      this.userCache.set(String(user.id), [...userTokens, token], maxAge),
    ]);

    return { token, maxAge };
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    const user = await this.tokenCache.get(token);
    const userTokens = user ? await this.userCache.get(String(user.id)) : null;

    if (!user || !userTokens) {
      throw new ForbiddenException();
    }

    // Extend the session lifetime if the user is active.
    await Promise.all([
      this.tokenCache.set(token, user, maxAge),
      this.userCache.set(String(user.id), userTokens, maxAge),
    ]);

    return user;
  }

  async updateUserRole(user: User) {
    const userTokens = await this.userCache.get(String(user.id));

    // If there are no tokens, it's unclear if the user doesn't
    // exist or is logged out everywhere, so do nothing in that case.
    if (userTokens) {
      userTokens.forEach(
        async (token) => await this.tokenCache.set(token, user, maxAge),
      );
    }

    return null;
  }

  async revokeToken(token: string) {
    await this.tokenCache.delete(token);
    return null;
  }

  async revokeUserTokens(id: unknown) {
    // Records in tokenCache aren't deleted because they won't pass
    // the validity check above anyway and eventially will expire.
    await this.userCache.delete(String(id));
    return null;
  }
}
