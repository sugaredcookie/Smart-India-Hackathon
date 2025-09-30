const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxLength: [50, "First name cannot exceed 50 characters"]
  },
  
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxLength: [50, "Last name cannot exceed 50 characters"]
  },

  role: {
    type: String,
    enum: ["shipper", "carrier", "driver", "admin"],
    required: [true, "Role is required"]
  },

  companyName: { 
    type: String, 
    trim: true,
    maxLength: [100, "Company name cannot exceed 100 characters"]
  },
  
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email"
    }
  },

  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[0-9]{10}$/.test(v);
      },
      message: "Please enter a valid 10-digit phone number"
    }
  },

  password: { 
    type: String, 
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters"],
    select: false
  },

  address: {
    street: { 
      type: String, 
      trim: true 
    },
    city: { 
      type: String, 
      trim: true 
    },
    state: { 
      type: String, 
      trim: true 
    },
    zipCode: { 
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^[0-9]{5,6}$/.test(v);
        },
        message: "Please enter a valid ZIP code"
      }
    },
    country: { 
      type: String, 
      trim: true,
      default: "India"
    }
  },

  // Optional fields
  gstNumber: { 
    type: String,
    uppercase: true,
    trim: true,
    sparse: true, // Allows multiple null values
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: "Please enter a valid GST number"
    }
  },

  licenseNumber: { 
    type: String,
    trim: true 
  },   // for carrier/driver

  isVerified: {
    type: Boolean,
    default: false
  },
  
  termsAccepted: {
    type: Boolean,
    required: [true, "Terms and conditions must be accepted"],
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: "Terms and conditions must be accepted"
    }
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  lastLogin: {
    type: Date,
    default: null
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before save
userSchema.pre("save", async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Compare passwords (alternative method)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide password when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create and export the model
const User = mongoose.model("User", userSchema);

module.exports = User;