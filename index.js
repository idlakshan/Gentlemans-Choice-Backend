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

app.use('/api/auth',authRoutes);

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
