const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Types
export type UserRole = 'user' | 'moderator' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type Emotion = {
  id: string;
  name: string;
  category: 'positive' | 'negative' | 'neutral';
  level: 1 | 2;
  emoji: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type EmotionLog = {
  id: string;
  user_id: string;
  emotion_id: string;
  intensity: number;
  note: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
};

export type EmotionLogWithEmotion = EmotionLog & {
  emotion: Emotion;
};
