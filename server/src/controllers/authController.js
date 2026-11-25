const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(userId) {
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
}

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

async function register(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phone = String(req.body.phone || '').trim();

    if (!name) return res.status(400).json({ message: 'Please enter your full name.' });
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password should be at least 6 characters long.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    // Public sign-up always creates a student account.
    const user = await User.create({ name, email, password, phone, role: 'student' });
    const token = createToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    return res.json({
      message: 'Logged in successfully.',
      token: createToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res) {
  return res.json(publicUser(req.user));
}

module.exports = { register, login, getMe };
