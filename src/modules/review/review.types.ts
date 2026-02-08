export interface CreateReviewInput {
   mealId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}