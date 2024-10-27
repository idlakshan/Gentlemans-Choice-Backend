const { Schema,model } = require("mongoose");


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    profileImage: String,
    bio: {
        type: String,
        maxlength: 200
    },
    profession: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const User = model('User', userSchema);
module.exports=User
