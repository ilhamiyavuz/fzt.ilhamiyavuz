const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export type ApiError = { detail?: string };

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorData: ApiError | null = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new Error(errorData?.detail || `API hatası: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorData: ApiError | null = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new Error(errorData?.detail || `API hatası: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
