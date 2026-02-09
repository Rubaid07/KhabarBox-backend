// providerProfile.types.ts
export interface CreateProviderProfileInput {
  restaurantName: string;
  description: string;
  address: string;
  logoUrl?: string;
  openingHours?: string;
}

export interface UpdateProviderProfileInput {
  restaurantName?: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  openingHours?: string;
}