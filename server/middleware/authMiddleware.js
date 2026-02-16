const jwt = require("jsonwebtoken");
const { unauthorized } = require("../errors/httpErrors");

const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"] || req.headers["Authorization"]; // handling case sensitivity issues 
    // split "Bearer" "TOKEN" and assign "TOKEN"
    const token = authHeader && authHeader.split(" ")[1]; // [1] second element which is "TOKEN"
    
    //Check is token exists
    if (!token) {
      return next(unauthorized("No authentication token provided"));
    }

    // Verify token and decode into a format we can work with  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request object
    req.user = decoded; 
    
    next(); // Proceed to next middleware/controller
    
  } catch (err) {
    // jwt.verify throws if invalid/expired
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(unauthorized("Invalid or expired authentication token"));
    }
    // Incase of unexpected error
    next(err); 
  }
};

module.exports = authenticateToken;