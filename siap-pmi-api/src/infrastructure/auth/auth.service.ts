import { Injectable } from '@nestjs/common';
import { createSupabaseClient } from '../supabase/supabase.client';

export type CurrentUser = {
  id: string;
  email?: string;
};

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

type HeaderValue = string | string[] | undefined;

const normalizeHeaderValue = (value: HeaderValue): string | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
};

@Injectable()
export class AuthService {
  extractBearerToken(authorization?: HeaderValue): string | null {
    const headerValue = normalizeHeaderValue(authorization);
    if (!headerValue) {
      return null;
    }
    const [scheme, token] = headerValue.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return null;
    }
    return token.trim();
  }

  async getCurrentUserFromHeaders(
    headers?: Record<string, HeaderValue>,
  ): Promise<CurrentUser> {
    const authorization =
      headers?.authorization ??
      headers?.Authorization ??
      headers?.AUTHORIZATION;
    const token = this.extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedError('Missing bearer token');
    }
    const client = createSupabaseClient({ jwt: token });
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user?.id) {
      throw new UnauthorizedError('Invalid token');
    }
    return { id: data.user.id, email: data.user.email ?? undefined };
  }
}
