export type CreateMealInput = {
  name: string
  price: number
  providerId: string
  description?: string
  imageUrl?: string
  dietaryTags?: string[]
  isAvailable?: boolean
  categoryId?: string
}

export type GetMealFilters = {
  search?: string
  dietaryTags?: string[]
  isAvailable?: boolean
  priceRange?: {
    min?: number
    max?: number
  }
  providerId?: string
  categoryId?: string;
}
