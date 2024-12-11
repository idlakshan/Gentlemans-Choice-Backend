const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

//all routes
const authRoutes=require('./src/users/user.route');
const productsRoute=require('./src/products/products.route');
const reviewsRoute=require('./src/reviews/reviews.route');
const orderRoute=require('./src/orders/orders.route');
const statsRoute=require('./src/stats/stats.route')

app.use('/api/auth',authRoutes);
app.use('/api/products', productsRoute); 
app.use('/api/reviews', reviewsRoute); 
app.use('/api/orders', orderRoute); 
app.use('/api/stats', statsRoute); 

// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("DB connected");
    } catch (err) {
        console.error("DB connection error:", err);
    }
}
main();

app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
