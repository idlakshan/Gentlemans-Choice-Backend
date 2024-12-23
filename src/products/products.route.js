const express = require('express');
const Products = require('./products.model');
const  {CreateProductValidator, UpdateProductValidator} = require('../validators/productValidator');
const { z } = require('zod');
const Reviews = require('../reviews/reviews.model');
const verifyToken =require("../middleware/verifyToken");
const verifyAdmin = require('../middleware/verifyAdmin');

const router = express.Router();

// Create a product
router.post("/create-product", async (req, res) => {
    console.log("Awaa");
    try {
        const result = CreateProductValidator.safeParse(req.body);
        console.log(result);
        

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
                filter.price ={$gte:min,$lte:max};
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
});

//get single product
router.get("/:id",async (req,res)=>{
    try {
        const productId=req.params.id;
        //console.log(productId);
        
        const product=await Products.findById(productId).populate("author","email username");
        

        if(!product){
            return res.status(404).send({message:"Product not found"})
        }

        const reviews=await Reviews.find({productId}).populate("userId","username email");
        res.status(200).send({product,reviews})


    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

//update a  product
router.patch("/update-product/:id", verifyToken, verifyAdmin,  async (req, res) => {
    try {
        const productId = req.params.id;

        const result = UpdateProductValidator.safeParse(req.body);
        if (!result.success) {
            return res.status(400).send({ errors: result.error.errors });
        }

        const validatedData = result.data;

        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            { ...validatedData },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send({ message: "Product not found" });
        }

        
        return res.status(200).send({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({
            message: 'Server error',
            error: error.message,
        });
    }
});

//delete a product
router.delete("/:id", verifyToken, verifyAdmin, async(req,res)=>{
    try {
        const productId=req.params.id;
        const deletedProduct=await Products.findByIdAndDelete(productId);
        if(!deletedProduct){
            return res.status(404).send({ message: "Product not found" });
        }

        await Reviews.deleteMany({productId:productId});

        return res.status(200).send({
            message: "Product deleted successfully",
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({
            message: 'Server error',
            error: error.message,
        });
    }
})


module.exports = router;
