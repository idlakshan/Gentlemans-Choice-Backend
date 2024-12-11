const express=require("express");
const User = require("../users/user.model");
const Order = require("../orders/orders.model");
const Reviews = require("../reviews/reviews.model");
const router=express.Router();

router.get('/user-stats/:email',async(req,res)=>{
    const {email}=req.params;
    //console.log(email);
    
    if(!email){
       return res.status(400).send({message:"Email is required"});
    }

    try {
       const user= await User.findOne({email:email});
       //console.log(user);
       if(!user){
        return res.status(404).send({message:"user not found"});
       }

       const totalPyamentsResults=await Order.aggregate([
        {$match:{email:email}},
        {
            $group:{_id:null,totalAmount:{$sum:"$amount"}}
        }
       ])

       const totalPaymentAmount =totalPyamentsResults.length>0?totalPyamentsResults[0].totalAmount:0;
       //console.log(totalPaymentAmount);

       const totalReviews=await Reviews.countDocuments({userId:user._id});

       const purchasedProductIds=await Order.distinct("products.productId",{email:email});
       const totalPurchasedProducts=purchasedProductIds.length;

       res.status(200).send({
        totalPayment:totalPaymentAmount.toFixed(2),
        totalReviews,
        totalPurchasedProducts
       })


       
       
        
    } catch (error) {
        console.error("Error fetch user stats", error);
        res.status(500).send({ message: "Failed to fetch user stats " });
    }
})

module.exports=router;