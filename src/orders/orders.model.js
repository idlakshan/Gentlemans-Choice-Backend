const { Schema, model } = require("mongoose");


const orderSchema = new Schema({
    orderId: String,
    products: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true }
        }

    ],
    amount: Number,
    address:{type:Object,required:true},
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "completed"],
        default: "pending"
    }

},{timestamps:true});

const Order=model("Order",orderSchema);
module.exports=Order;