const { Schema, default: mongoose } = require("mongoose");


const ProductSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,

    },
    description:{
        type:String,
    },
    price:{
        type:Number
    },
    oldPrice:{
        type:Number
    },
    image:{
        type:String
    },
    color:{
        type:String
    },
    rating:{
        type:Number,
        default:0
    },
    author:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    }
})

const Products=mongoose.model("Products",ProductSchema)
module.exports=Products;