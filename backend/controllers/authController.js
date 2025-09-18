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
  const { role, licenseNumber, networkId, businessType } = req.body;

  if (!role) return next(new AppError("Role is required", 400));

  // Conditional checks
  if (role === "transporter" && !licenseNumber) {
    return next(new AppError("License Number is required for Transporters", 400));
  }
  if (role === "freight-forwarder" && !networkId) {
    return next(new AppError("Network ID is required for Freight Forwarders", 400));
  }
  if (role === "company" && !businessType) {
    return next(new AppError("Business Type is required for Companies", 400));
  }

  const newUser = await User.create({
    role,
    companyName: req.body.companyName,
    gstNumber: req.body.gstNumber,
    email: req.body.email,
    password: req.body.password,
    contactPerson: req.body.contactPerson,
    phoneNumber: req.body.phoneNumber,
    address: {
      street: req.body.address.street,
      city: req.body.address.city,
      state: req.body.address.state,
      pincode: req.body.address.pincode
    },
    licenseNumber,
    networkId,
    businessType
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
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