import { AuthService, CurrentUser } from './auth.service';
import { createSupabaseClient } from '../supabase/supabase.client';
import {
  PermissionDeniedForEvent,
  UserNotAssignedToEvent,
} from '../../modules/event-roles/event-roles.errors';
import { EventRoleType } from '../../modules/event-roles/event-roles.types';

type HeaderValue = string | string[] | undefined;

type RequestLike = {
  headers?: Record<string, HeaderValue>;
  user?: CurrentUser | CurrentUserContext;
};

type ContextLike = {
  req?: RequestLike;
  request?: RequestLike;
};

export type CurrentUserEnrollment = {
  eventId: string;
  role?: EventRoleType;
  enrollmentId?: string;
};

export type CurrentUserContext = {
  userId: string;
  email?: string;
  enrollments: CurrentUserEnrollment[];
};

type EventRoleAssignmentRow = {
  event_id: string;
  role: EventRoleType;
};

type EnrollmentRow = {
  id: string;
  event_id: string;
};

const getHeaders = (
  context: RequestLike | ContextLike,
): Record<string, HeaderValue> => {
  if ('headers' in context && context.headers) {
    return context.headers;
  }
  if ('req' in context && context.req?.headers) {
    return context.req.headers;
  }
  if ('request' in context && context.request?.headers) {
    return context.request.headers;
  }
  return {};
};

const isCurrentUserContext = (
  user?: CurrentUser | CurrentUserContext,
): user is CurrentUserContext =>
  typeof user === 'object' &&
  user !== null &&
  'userId' in user &&
  Array.isArray(user.enrollments);

const createPublicClient = (token: string) => {
  return createSupabaseClient({ jwt: token });
};

const getUserFromContext = async (
  context: RequestLike | ContextLike,
  authService: AuthService,
): Promise<CurrentUser> => {
  if ('user' in context && context.user && 'id' in context.user) {
    return context.user;
  }
  const headers = getHeaders(context);
  return authService.getCurrentUserFromHeaders(headers);
};

const getAccessToken = (
  context: RequestLike | ContextLike,
  authService: AuthService,
): string | null => {
  const headers = getHeaders(context);
  const authorization =
    headers?.authorization ?? headers?.Authorization ?? headers?.AUTHORIZATION;
  return authService.extractBearerToken(authorization);
};

const buildContext = (
  user: CurrentUser,
  roles: EventRoleAssignmentRow[],
  enrollments: EnrollmentRow[],
): CurrentUserContext => {
  const map = new Map<string, CurrentUserEnrollment>();
  roles.forEach((role) => {
    const existing = map.get(role.event_id) ?? { eventId: role.event_id };
    existing.role = role.role;
    map.set(role.event_id, existing);
  });
  enrollments.forEach((enrollment) => {
    const existing = map.get(enrollment.event_id) ?? {
      eventId: enrollment.event_id,
    };
    existing.enrollmentId = enrollment.id;
    map.set(enrollment.event_id, existing);
  });
  return {
    userId: user.id,
    email: user.email,
    enrollments: Array.from(map.values()),
  };
};

export const getCurrentUser = async (
  context: RequestLike | ContextLike,
  authService: AuthService,
): Promise<CurrentUserContext> => {
  if ('user' in context && isCurrentUserContext(context.user)) {
    return context.user;
  }
  const user = await getUserFromContext(context, authService);
  const token = getAccessToken(context, authService);
  if (!token) {
    return { userId: user.id, email: user.email, enrollments: [] };
  }
  const client = createPublicClient(token);
  const { data: roles, error: roleError } = await client
    .from('event_role_assignments')
    .select('event_id, role')
    .eq('user_id', user.id);
  if (roleError) {
    throw new Error(roleError.message);
  }
  const { data: enrollments, error: enrollmentError } = await client
    .from('enrollments')
    .select('id, event_id')
    .eq('user_id', user.id);
  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }
  return buildContext(
    user,
    (roles ?? []) as EventRoleAssignmentRow[],
    (enrollments ?? []) as EnrollmentRow[],
  );
};

export const assertUserHasRole = (
  eventId: string,
  role: EventRoleType,
  currentUser: CurrentUserContext,
): void => {
  const roles = currentUser.enrollments
    .filter((enrollment) => enrollment.eventId === eventId)
    .map((enrollment) => enrollment.role)
    .filter((value): value is EventRoleType => Boolean(value));
  if (roles.length === 0) {
    throw new UserNotAssignedToEvent(currentUser.userId, eventId);
  }
  if (!roles.includes(role)) {
    throw new PermissionDeniedForEvent(currentUser.userId, eventId, role);
  }
};
