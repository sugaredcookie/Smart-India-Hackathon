const mongoose = require('mongoose');

const quoteResponseSchema = new mongoose.Schema({
  // Reference to the quote request
  quoteRequest: {
    type: mongoose.Schema.ObjectId,
    ref: 'QuoteRequest',
    required: [true, 'A quote response must belong to a quote request']
  },
  // Reference to the freight forwarder/transporter creating the response
  responder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A quote response must belong to a responder']
  },
  // Quotation details
  quoteAmount: {
    type: Number,
    required: [true, 'Please provide quote amount']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  validity: {
    type: Date,
    required: [true, 'Please provide quote validity date']
  },
  termsAndConditions: {
    type: String,
    default: ''
  },
  // Status of the response
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // Additional notes
  notes: {
    type: String,
    default: ''
  },
  // Estimated delivery time
  estimatedDeliveryDays: {
    type: Number,
    min: 1
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
quoteResponseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
quoteResponseSchema.index({ quoteRequest: 1, status: 1 });
quoteResponseSchema.index({ responder: 1 });
quoteResponseSchema.index({ createdAt: -1 });

const QuoteResponse = mongoose.model('QuoteResponse', quoteResponseSchema);

module.exports = QuoteResponse;