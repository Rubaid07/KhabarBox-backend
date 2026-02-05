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
