import { fetchApi } from './client';
import { AuthResponse, User } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => fetchApi<{ user: User }>('/auth/me'),

  updateMe: (payload: Partial<Pick<User, 'photoUrl'>>) =>
    fetchApi<{ success: boolean }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
