export interface CreateReviewInput {
   mealId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
}