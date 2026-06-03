export type PlaceType = 'отель' | 'ресторан';

export interface Review {
  id: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
}

export interface Table {
  id: string;
  number: string;
  seats: number;
  x: number;
  y: number;
  shape: 'circle' | 'rect';
  isAvailable: boolean;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  images?: string[];
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  averagePrice: number;
}

export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  uid: string;
  photoUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Booking {
  id: number;
  placeId: string;
  placeName: string;
  placeType: string;
  placeAddress: string;
  resourceId: string;
  resourceName: string;
  date: string;
  guests: number;
  status: string;
  contactName: string;
  contactPhone: string;
  createdAt: number;
}

export interface PlaceResources {
  rooms: Room[];
  tables: Table[];
}
