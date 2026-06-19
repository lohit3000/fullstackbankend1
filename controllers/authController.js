const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforemployeemanagementproject', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @desc    Register employee (Only Admin can register new employees/HR)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res) => {
  const { name, email, password, role, department, designation, salary } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      department: department || 'Unassigned',
      designation: designation || 'Junior Staff',
      salary: salary || 0
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        salary: user.salary
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth employee & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // In Mongoose, user password might be selected/unselected. Let's make sure we have password access.
    // If MongoDB is used, password by default is selected: false.
    // So if using Mongoose, we have to find the user with .select('+password') to retrieve it.
    let userWithPassword = user;
    if (process.env.USE_MOCK_DB !== 'true') {
      const MongooseUser = require('../models/User');
      userWithPassword = await MongooseUser.findOne({ email }).select('+password');
    }

    if (!userWithPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, userWithPassword.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
