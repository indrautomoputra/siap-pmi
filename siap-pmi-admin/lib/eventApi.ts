export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem('siap_jwt');
  } catch {
    return null;
  }
};

export async function eventFetch(
  eventId: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      'x-event-id': eventId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    throw new Error('Unauthorized');
  }
  if (res.status === 403) {
    throw new ForbiddenError(`Forbidden ${path}`);
  }
  return res;
}

export async function eventGet<T>(
  eventId: string,
  path: string,
): Promise<T> {
  const res = await eventFetch(eventId, path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function eventPost<T>(
  eventId: string,
  path: string,
  body?: unknown,
): Promise<T | undefined> {
  const res = await eventFetch(eventId, path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return undefined;
}
