const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT tokens from cookies
 * Verifies the token from the httpOnly cookie and attaches the user to the request
 */
module.exports = async function(req, res, next) {
  // Get token from cookies
  const token = req.cookies?.auth_token;

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No authentication token found' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vimo-secret-key');
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      // Clear invalid token
      res.clearCookie('auth_token');
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Clear invalid token
    res.clearCookie('auth_token');
    res.status(401).json({ message: 'Authentication token is not valid' });
  }
};
