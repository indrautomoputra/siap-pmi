import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../../infrastructure/auth/auth.service';
import {
  CurrentUserContext,
  getCurrentUser,
} from '../../infrastructure/auth/current-user';

type RequestWithAuthContext = Request & {
  currentUser?: CurrentUserContext;
};

@Injectable({ scope: Scope.REQUEST })
export class AuthContextService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly authService: AuthService,
  ) {}

  async getCurrentUser(): Promise<CurrentUserContext> {
    const request = this.request as RequestWithAuthContext;
    if (request.currentUser) {
      return request.currentUser;
    }
    const currentUser = await getCurrentUser(request, this.authService);
    request.currentUser = currentUser;
    return currentUser;
  }
}
