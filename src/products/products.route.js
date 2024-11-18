const express = require('express');
const Products = require('./products.model');
const ProductValidator = require('../validators/productValidator');
const { z } = require('zod');
const Reviews = require('../reviews/reviews.model');
const router = express.Router();

// Create a product
router.post("/create-product", async (req, res) => {
    try {
        const result = ProductValidator.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors });
        }

        const validatedData = result.data;
        const newProduct = new Products(validatedData);
        const savedProduct = await newProduct.save();

    
        const reviews = await Reviews.find({ productId: savedProduct._id });

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((accum, review) => accum + review.rating, 0);
            const avgRating = totalRating / reviews.length;
            savedProduct.rating = avgRating;
            await savedProduct.save();
        } else {
            savedProduct.rating = 0;
            await savedProduct.save();
        }

        res.status(201).send(savedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
