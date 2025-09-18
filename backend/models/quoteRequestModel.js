const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  // Reference to the company creating the quote request
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A quote request must belong to a company']
  },
  // Shipment details
  pickupLocation: {
    type: String,
    required: [true, 'Please provide pickup location']
  },
  deliveryLocation: {
    type: String,
    required: [true, 'Please provide delivery location']
  },
  goodsCategory: {
    type: String,
    required: [true, 'Please select goods category'],
    enum: [
      'Electronics', 
      'Clothing', 
      'Food', 
      'Machinery', 
      'Chemicals', 
      'Construction Materials',
      'Automotive',
      'Pharmaceuticals',
      'Furniture',
      'Other'
    ]
  },
  goodsType: {
    type: String,
    required: [true, 'Please select goods type'],
    enum: [
      'Perishable',
      'Non-Perishable',
      'Fragile',
      'Hazardous',
      'Temperature Controlled',
      'Oversized',
      'General'
    ]
  },
  packagingType: {
    type: String,
    required: [true, 'Please select packaging type'],
    enum: [
      'Cartons',
      'Pallets',
      'Crates',
      'Drums',
      'Bags',
      'Loose',
      'Container'
    ]
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Please enter total quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  isStackable: {
    type: Boolean,
    required: [true, 'Please specify if goods are stackable']
  },
  productDimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { 
      type: String, 
      enum: ['cm', 'inch', 'm'], 
      default: 'cm' 
    }
  },
  volumetricWeight: {
    type: Number,
    required: [true, 'Please enter volumetric weight']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Please select pickup date']
  },
  shipmentType: {
    type: String,
    required: [true, 'Please select shipment type'],
    enum: [
      'Road',
      'Rail',
      'Air',
      'Sea',
      'Multimodal'
    ]
  },
  // Contact information
  contact: {
    mobileNumber: {
      type: String,
      required: [true, 'Please provide mobile number']
    },
    email: {
      type: String,
      required: [true, 'Please provide email address']
    }
  },
  // Status of the quote request
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  // Additional notes
  notes: {
    type: String,
    default: ''
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
quoteRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
quoteRequestSchema.index({ company: 1, status: 1 });
quoteRequestSchema.index({ createdAt: -1 });
quoteRequestSchema.index({ pickupLocation: 'text', deliveryLocation: 'text' });

// Virtual for calculating volume
quoteRequestSchema.virtual('volume').get(function() {
  return this.productDimensions.length * this.productDimensions.width * this.productDimensions.height;
});

// Virtual for responses
quoteRequestSchema.virtual('responses', {
  ref: 'QuoteResponse',
  localField: '_id',
  foreignField: 'quoteRequest'
});

// Ensure virtual fields are serialized
quoteRequestSchema.set('toJSON', { virtuals: true });
quoteRequestSchema.set('toObject', { virtuals: true });

const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);

module.exports = QuoteRequest;