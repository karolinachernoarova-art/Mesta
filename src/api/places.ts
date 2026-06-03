import { fetchApi } from './client';
import { Place, PlaceResources, Review } from './types';

export const placesApi = {
  list: () => fetchApi<Place[]>('/places'),
  get: (placeId: string) => fetchApi<Place>(`/places/${placeId}`),
  resources: (placeId: string) => fetchApi<PlaceResources>(`/places/${placeId}/resources`),
  reviews: (placeId: string) => fetchApi<Review[]>(`/places/${placeId}/reviews`),
};
