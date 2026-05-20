const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('pt_token');
}

export async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!(opts.body instanceof FormData) && opts.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (opts.auth !== false) {
    const token = getStoredToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  // 204 has no body
  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message:
        (payload as { error?: string })?.error ??
        (typeof payload === 'string' ? payload : `request failed (${res.status})`),
      details: (payload as { details?: unknown })?.details,
    };
    throw err;
  }
  return payload as T;
}
