const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["company", "transporter", "freight-forwarder", "admin"],
    required: [true, "Role is required"]
  },

  companyName: { 
    type: String, 
    required: [true, "Company name is required"],
    trim: true,
    maxLength: [100, "Company name cannot exceed 100 characters"]
  },
  
  gstNumber: { 
    type: String, 
    required: [true, "GST number is required"], 
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: "Please enter a valid GST number"
    }
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

  password: { 
    type: String, 
    required: [true, "Password is required"],
    minLength: [8, "Password must be at least 8 characters"],
    select: false
  },
  
  contactPerson: {
    type: String,
    required: [true, "Contact person name is required"],
    trim: true
  },

  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: "Please enter a valid 10-digit phone number"
    }
  },

  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: "Please enter a valid 6-digit pincode"
      }
    }
  },

  // Role-specific fields
  licenseNumber: { type: String },   // only for transporter
  networkId: { type: String },       // only for freight-forwarder
  businessType: { type: String },    // only for company

  isVerified: {
    type: Boolean,
    default: false
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
userSchema.index({ gstNumber: 1 });
userSchema.index({ email: 1 });

// Hash password before save
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide password when sending JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);