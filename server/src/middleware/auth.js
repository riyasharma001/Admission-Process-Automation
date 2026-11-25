const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please log in to continue.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Your account could not be found. Please log in again.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'This section is for the admission administrator only.' });
}

function staffOnly(req, res, next) {
  if (req.user && ['admin', 'reviewer'].includes(req.user.role)) return next();
  return res.status(403).json({ message: 'This section is for reviewers and admission staff only.' });
}

module.exports = { protect, adminOnly, staffOnly };
