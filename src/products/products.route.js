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

//get all products
router.get("/", async (req,res)=>{
    try {
        const  {category,color,minPrice,maxPrice,page=1,limit=10} =req.query;

        let filter = {};

        if(category && category !== "all"){
            filter.category=category;
        }

        if(color && color !== "all"){
            filter.color=color;
        }

        if(minPrice && maxPrice){
            const min=parseFloat(minPrice);
            const max=parseFloat(maxPrice);

            if(!isNaN(min) && !isNaN(max)){
                filter.prce ={$gte:min,$lte:max};
            }
        }

        const skip =(parseInt(page)-1)*parseInt(limit);

        const totalProducts= await Products.countDocuments(filter)
        const totalPages=Math.ceil(totalProducts/parseInt(limit))
        const products=await Products.find(filter).skip(skip).limit(parseInt(limit)).populate("author","email").sort({createdAt:-1})

        res.status(200).send({products,totalPages,totalProducts})

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error', error: error.message });
    }
})

module.exports = router;
