const { z } = require('zod');

const CreateProductValidator = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  oldPrice: z.number().min(0, "Old price must be a positive number").optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  rating: z.number().min(0, "Rating must be between 0 and 5").max(5, "Rating must be between 0 and 5").optional(),
  author: z.string().length(24, "Author ID must be 24 characters long"),
});


const UpdateProductValidator = CreateProductValidator.partial();


module.exports = {
  CreateProductValidator,
  UpdateProductValidator,
};
