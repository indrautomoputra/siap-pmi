import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { CurrentEventContext } from './event-context.types';

type RequestWithEventContext = Request & {
  currentEvent?: CurrentEventContext;
};

export const CurrentEvent = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithEventContext>();
    return request.currentEvent;
  },
);
