// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mySuperSecretKey123'; // Must match the secret in auth.js

function authenticateToken(req, res, next) {
  // Expect token in the Authorization header as: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded; // decoded contains the user's id and email
    next();
  });
}

module.exports = authenticateToken;
