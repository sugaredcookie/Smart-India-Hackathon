const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Function to generate a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Admin login
exports.loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const admin = await User.findOne({ email }).select('+password');
  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (admin.role !== 'admin') {
    return next(new AppError('You are not authorized as admin', 403));
  }

  const token = signToken(admin._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

// Signup - Create a new user
exports.signup = catchAsync(async (req, res, next) => {
  const { 
    firstName, 
    lastName, 
    email, 
    password, 
    confirmPassword, 
    role, 
    phone, 
    companyName, 
    address, 
    termsAccepted 
  } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !password || !role) {
    return next(new AppError("Please fill in all required fields", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  if (!termsAccepted) {
    return next(new AppError("Please accept the terms and conditions", 400));
  }

  // Check if User model is working
  if (typeof User.findOne !== 'function') {
    return next(new AppError('Database configuration error', 500));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists with this email", 400));
  }

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    phone: phone || '',
    companyName: companyName || '',
    address: {
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      country: address?.country || 'India'
    },
    termsAccepted
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
        phone: newUser.phone
      },
    },
    message: "Account created successfully"
  });
});

// Login - User login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      }
    }
  });
});

// Get currently logged-in user
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return next(new AppError("The user no longer exists", 401));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});