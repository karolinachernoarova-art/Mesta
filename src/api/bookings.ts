import { fetchApi } from './client';
import { Booking } from './types';

export const bookingsApi = {
  list: () => fetchApi<Booking[]>('/bookings'),
  create: (payload: unknown) =>
    fetchApi<{ success: boolean; id: number }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (bookingId: number, payload: Partial<Booking>) =>
    fetchApi<{ success: boolean }>(`/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
