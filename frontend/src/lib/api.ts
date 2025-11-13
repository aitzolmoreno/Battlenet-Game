// Small API wrapper for frontend to call backend APIs using relative /api paths.
// Uses the Vite dev server proxy (configured in vite.config.ts) during development.

export async function apiFetch<T = any>(path: string, opts?: RequestInit): Promise<T> {
  const url = path.startsWith('/') ? path : `/${path}`;
  const init: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opts && (opts as any).headers),
    },
    ...opts,
  };

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  // try parse json; if empty, return null
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : (null as unknown as T);
  } catch (e) {
    // fallback: return raw text
    return (text as unknown) as T;
  }
}
