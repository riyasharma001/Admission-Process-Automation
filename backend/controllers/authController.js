const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const AVAILABLE_PROGRAMS = [
  { id: 'btech-cse', name: 'B.Tech - Computer Science & Engineering', department: 'School of Computing', duration: '4 Years', fee: '$4,200/yr', seats: 120 },
  { id: 'btech-ai', name: 'B.Tech - Artificial Intelligence & Data Science', department: 'School of Computing', duration: '4 Years', fee: '$4,500/yr', seats: 60 },
  { id: 'btech-ece', name: 'B.Tech - Electronics & Communication', department: 'School of Electrical', duration: '4 Years', fee: '$3,800/yr', seats: 90 },
  { id: 'bba', name: 'BBA - Business Analytics & Marketing', department: 'School of Management', duration: '3 Years', fee: '$3,200/yr', seats: 100 },
  { id: 'mtech-cs', name: 'M.Tech - Cloud & Cyber Security', department: 'Postgraduate Studies', duration: '2 Years', fee: '$5,000/yr', seats: 45 }
];

// Helper: generate unique Application Number
const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ADM-${year}-${randomSuffix}`;
};

// Helper: sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register new applicant
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, dob, course, qualifyingScore, password } = req.body;

    if (!name || !email || !phone || !course || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields (Name, Email, Phone, Course, and Password).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if applicant already registered
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An application is already registered with this email address. Please log in.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const applicationNumber = generateApplicationNumber();
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob: dob || '',
      course,
      qualifyingScore: qualifyingScore || 'N/A',
      applicationNumber,
      password: hashedPassword,
      role: 'student',
      admissionStatus: 'Application Submitted',
      applicationFeeStatus: 'Pending'
    });

    const token = generateToken(newUser._id || newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Admission registration successful! Your application reference number is generated.',
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        dob: newUser.dob,
        course: newUser.course,
        qualifyingScore: newUser.qualifyingScore,
        applicationNumber: newUser.applicationNumber,
        admissionStatus: newUser.admissionStatus,
        applicationFeeStatus: newUser.applicationFeeStatus,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message
    });
  }
};

// @desc    Authenticate applicant
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered Email or Application Number, and Password.'
      });
    }

    const user = await User.findByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No application found matching the provided details.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    const token = generateToken(user._id || user.id);

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome to the Admission Portal.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        course: user.course,
        qualifyingScore: user.qualifyingScore,
        applicationNumber: user.applicationNumber,
        admissionStatus: user.admissionStatus,
        applicationFeeStatus: user.applicationFeeStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message
    });
  }
};

// @desc    Get current applicant session
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        course: user.course,
        qualifyingScore: user.qualifyingScore,
        applicationNumber: user.applicationNumber,
        admissionStatus: user.admissionStatus,
        applicationFeeStatus: user.applicationFeeStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get courses/programs list
// @route   GET /api/auth/programs
exports.getPrograms = (req, res) => {
  return res.status(200).json({
    success: true,
    programs: AVAILABLE_PROGRAMS
  });
};
