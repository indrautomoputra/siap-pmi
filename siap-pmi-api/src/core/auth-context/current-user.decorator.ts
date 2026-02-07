import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { CurrentUser as AuthCurrentUser } from '../../infrastructure/auth/auth.service';
import type { CurrentUserContext } from '../../infrastructure/auth/current-user';

type RequestWithAuthContext = Request & {
  user?: AuthCurrentUser;
  currentUser?: CurrentUserContext;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithAuthContext>();
    return request.currentUser ?? request.user;
  },
);
