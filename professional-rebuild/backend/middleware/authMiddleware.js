const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

  try {
    // Remove 'Bearer ' prefix if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    const verified = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};