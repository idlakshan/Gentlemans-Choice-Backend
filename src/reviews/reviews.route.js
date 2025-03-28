const express=require("express");
const { CreateReviewValidator } = require("../validators/reviewValidator");
const Reviews = require("./reviews.model");
const Products = require("../products/products.model");
const router=express.Router();

//post a new review
router.post("/post-review", async (req, res) => {
    try {
        const result = CreateReviewValidator.safeParse(req.body);

        if (!result.success) {
            return res.status(400).send({ errors: result.error.errors });
        
        }

        const { comment, rating, productId, userId } = result.data;

        let review = await Reviews.findOne({ productId, userId });

        if (review) {
            review.comment = comment;
            review.rating = rating;
            await review.save();
        } else {
            review = new Reviews({ comment, rating, productId, userId });
            await review.save();
        }

        const reviews = await Reviews.find({ productId });

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / reviews.length;

            const product = await Products.findById(productId);
            if (product) {
                product.rating = avgRating;
                await product.save({ validateBeforeSave: false });
            } else {
                return res.status(404).send({ message: "Product not found" });
            }
        }

        res.status(201).send({ message: "Review created successfully", review });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error", error: error.message });
    }
});

//get total reviews count
router.get("/total-reviews",async (req,res)=>{
   try {
     const totalReviews=await Reviews.countDocuments({});
     res.status(200).send({totalReviews})
   } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error", error: error.message });
   }
});

// Get reviews by user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).send({ message: "User ID is required" });
        }
        const reviews = await Reviews.find({ userId }).sort({ createdAt: -1 });

        if (reviews.length === 0) {
            return res.status(404).send({ message: "No reviews found" });
        }
        res.status(200).send(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error", error: error.message });
    }
});



module.exports=router