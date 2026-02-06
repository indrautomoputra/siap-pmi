import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, CurrentUser, UnauthorizedError } from './auth.service';

type RequestWithUser = Request & {
  user?: CurrentUser;
  supabaseJwt?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    try {
      const token = this.authService.extractBearerToken(
        request.headers.authorization ??
          request.headers.Authorization ??
          request.headers.AUTHORIZATION,
      );
      if (!token) {
        throw new UnauthorizedError('Missing bearer token');
      }
      request.supabaseJwt = token;
      const user = await this.authService.getCurrentUserFromHeaders(
        request.headers,
      );
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
