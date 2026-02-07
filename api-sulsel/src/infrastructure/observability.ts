import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UnauthorizedError } from './auth/auth.service';
import {
  EnrollmentAccessDenied,
  EnrollmentAlreadyExists,
  EnrollmentNotFound,
  EnrollmentNotPendingReview,
} from '../modules/enrollments/enrollments.errors';
import {
  AssessmentAlreadyScored,
  AssessmentEnrollmentNotApproved,
  AssessmentInstrumentNotFound,
} from '../modules/assessment/assessment.errors';
import {
  KapAlreadySubmitted,
  KapInstrumentInactive,
  KapInstrumentNotFound,
  EnrollmentNotApproved as KapEnrollmentNotApproved,
} from '../modules/kap/kap.errors';
import {
  GraduationDecisionAlreadyExists,
  GraduationDecisionNotAllowed,
  GraduationEnrollmentNotApproved,
  GraduationEventNotOngoingOrCompleted,
} from '../modules/graduations/graduations.errors';
import {
  EventAlreadyCompleted,
  EventCancelled,
  EventEnrollmentClosed,
  EventNotActive,
  EventNotFound,
  EventNotPublished,
} from '../modules/events/events.errors';
import {
  MultiRoleInSameEventNotAllowed,
  PermissionDeniedForEvent,
  RoleAssignmentAlreadyExists,
  UserNotAssignedToEvent,
} from '../modules/event-roles/event-roles.errors';
import {
  InvalidIdempotencyKey,
  RateLimitExceeded,
} from './traffic/traffic.module';
import * as Sentry from '@sentry/node';

type ErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
};

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();
      const normalized =
        typeof responseBody === 'string'
          ? { message: responseBody }
          : (responseBody as Record<string, unknown>);
      const message = Array.isArray(normalized.message)
        ? normalized.message.join(', ')
        : ((normalized.message as string | undefined) ?? exception.message);
      const error = (normalized.error as string | undefined) ?? exception.name;
      response.status(status).json({
        statusCode: status,
        error,
        message,
      });
      if (process.env.SENTRY_DSN) {
        if (status >= 400) {
          Sentry.captureException(exception);
        }
      }
      return;
    }

    if (exception instanceof RateLimitExceeded) {
      response
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .setHeader('Retry-After', exception.retryAfterSeconds.toString())
        .json(this.buildResponse(exception, HttpStatus.TOO_MANY_REQUESTS));
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(exception);
      }
      return;
    }

    if (exception instanceof UnauthorizedError) {
      response
        .status(HttpStatus.UNAUTHORIZED)
        .json(this.buildResponse(exception, HttpStatus.UNAUTHORIZED));
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(exception);
      }
      return;
    }

    const mapped = this.mapDomainException(exception);
    if (mapped) {
      response.status(mapped.status).json(mapped.body);
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(exception);
      }
      return;
    }

    const body: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: 'Internal server error',
    };
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(exception);
    }
    this.logger.error(
      JSON.stringify({
        action: `${request.method} ${request.path}`,
        error: exception instanceof Error ? exception.name : 'UnknownError',
      }),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }

  private buildResponse(exception: Error, status: number): ErrorResponse {
    return {
      statusCode: status,
      error: exception.name,
      message: exception.message,
    };
  }

  private mapDomainException(
    exception: unknown,
  ): { status: number; body: ErrorResponse } | null {
    const conflict = [
      EnrollmentAlreadyExists,
      AssessmentAlreadyScored,
      KapAlreadySubmitted,
      GraduationDecisionAlreadyExists,
      RoleAssignmentAlreadyExists,
      MultiRoleInSameEventNotAllowed,
    ];
    if (conflict.some((err) => exception instanceof err)) {
      return {
        status: HttpStatus.CONFLICT,
        body: this.buildResponse(exception as Error, HttpStatus.CONFLICT),
      };
    }

    const notFound = [
      EventNotFound,
      EnrollmentNotFound,
      AssessmentInstrumentNotFound,
      KapInstrumentNotFound,
    ];
    if (notFound.some((err) => exception instanceof err)) {
      return {
        status: HttpStatus.NOT_FOUND,
        body: this.buildResponse(exception as Error, HttpStatus.NOT_FOUND),
      };
    }

    const forbidden = [
      PermissionDeniedForEvent,
      UserNotAssignedToEvent,
      EnrollmentAccessDenied,
      GraduationDecisionNotAllowed,
    ];
    if (forbidden.some((err) => exception instanceof err)) {
      return {
        status: HttpStatus.FORBIDDEN,
        body: this.buildResponse(exception as Error, HttpStatus.FORBIDDEN),
      };
    }

    const badRequest = [
      EventNotActive,
      EventNotPublished,
      EventEnrollmentClosed,
      EventAlreadyCompleted,
      EventCancelled,
      GraduationEnrollmentNotApproved,
      GraduationEventNotOngoingOrCompleted,
      EnrollmentNotPendingReview,
      AssessmentEnrollmentNotApproved,
      KapInstrumentInactive,
      KapEnrollmentNotApproved,
      InvalidIdempotencyKey,
    ];
    if (badRequest.some((err) => exception instanceof err)) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: this.buildResponse(exception as Error, HttpStatus.BAD_REQUEST),
      };
    }

    return null;
  }
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as Request & { user?: { id?: string } }).user?.id;
    const body = request.body as Record<string, unknown> | undefined;
    const query = request.query as Record<string, unknown> | undefined;
    const eventIdFromParams =
      typeof request.params?.eventId === 'string'
        ? request.params.eventId
        : undefined;
    const eventIdFromBody =
      typeof body?.eventId === 'string' ? body.eventId : undefined;
    const eventIdFromQuery =
      typeof query?.eventId === 'string' ? query.eventId : undefined;
    const eventId = eventIdFromParams ?? eventIdFromBody ?? eventIdFromQuery;
    const action = `${request.method} ${request.path}`;
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            event_id: eventId ?? null,
            user_id: userId ?? null,
            action,
            status: 'ok',
            duration_ms: Date.now() - start,
          }),
        );
      }),
      catchError((error: unknown) => {
        this.logger.warn(
          JSON.stringify({
            event_id: eventId ?? null,
            user_id: userId ?? null,
            action,
            status: 'error',
            duration_ms: Date.now() - start,
          }),
        );
        const err =
          error instanceof Error ? error : new Error('Unhandled error');
        return throwError(() => err);
      }),
    );
  }
}
