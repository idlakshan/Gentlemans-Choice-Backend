const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
       
        const token = req.cookies.token;
        console.log("Tokem",token);
    
        if (!token) {
            return res.status(401).send({ message: "Token not found. Unauthorized access." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        req.userId = decoded.userId;
        req.role = decoded.role;
        console.log(decoded.role);
        
        next();
    } catch (error) {
        console.error("Error while verifying token:", error.message);
        res.status(401).send({ message: "Invalid or expired token." });
    }
};

module.exports = verifyToken;
