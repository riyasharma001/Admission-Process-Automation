const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'college_admission_portal_jwt_secret_key_2026';

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Applicant not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired admission session token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }
};

module.exports = { protect, JWT_SECRET };
