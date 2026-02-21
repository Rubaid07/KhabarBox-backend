export type CreateMealInput = {
  name: string;
  price: number;
  providerId: string;
  description?: string;
  imageUrl?: string;
  dietaryTags?: string[];
  isAvailable?: boolean;
  categoryId?: string;
};

export type GetMealFilters = {
  search?: string;
  dietaryTags?: string[];
  isAvailable?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  providerId?: string;
  categoryId?: string;

  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};
export interface SuggestionResult {
  meals: Array<{
    id: string;
    name: string;
    imageUrl?: string | undefined;       
    restaurantName?: string | undefined;
    price?: number;
  }>;
  tags: string[];
  restaurants: Array<{
    id: string;
    name: string;
    logoUrl?: string | undefined;
  }>;
  categories?: Array<{
    id: string;
    name: string;
  }>;
}