const { z } = require("zod");


const CreateReviewValidator = z.object({
  comment: z
    .string()
    .min(1, "Comment is required") 
    .max(500, "Comment cannot exceed 500 characters"), 
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"), 
  userId: z
    .string()
    .length(24, "User ID must be 24 characters long"), 
  productId: z
    .string()
    .length(24, "Product ID must be 24 characters long"), 
});



// Exporting the validators
module.exports = {
  CreateReviewValidator,
};
