const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and authenticate user
const protect = async (req, res, next) => {

    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
      try{
        // Extract token from bearer header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token, omitting the password field
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        next();
      } catch (error) {
        console.error('JWT Token Verification Error:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
}

// Middleware to restrict access based on user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user missing' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };