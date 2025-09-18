const QuoteRequest = require('../models/quoteRequestModel');
const QuoteResponse = require('../models/quoteResponseModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new quote request
exports.createQuoteRequest = catchAsync(async (req, res, next) => {
  // Add company ID from the authenticated user
  req.body.company = req.user.id;
  
  const quoteRequest = await QuoteRequest.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      quoteRequest
    }
  });
});

// Get all quote requests (for freight forwarders/transporters)
exports.getAllQuoteRequests = catchAsync(async (req, res, next) => {
  // Build query based on filters
  let query = { status: 'open' };
  
  // Filter by goods category if provided
  if (req.query.goodsCategory) {
    query.goodsCategory = req.query.goodsCategory;
  }
  
  // Filter by shipment type if provided
  if (req.query.shipmentType) {
    query.shipmentType = req.query.shipmentType;
  }
  
  // Filter by pickup location if provided
  if (req.query.pickupLocation) {
    query.pickupLocation = { $regex: req.query.pickupLocation, $options: 'i' };
  }
  
  // Filter by delivery location if provided
  if (req.query.deliveryLocation) {
    query.deliveryLocation = { $regex: req.query.deliveryLocation, $options: 'i' };
  }
  
  const quoteRequests = await QuoteRequest.find(query)
    .populate('company', 'companyName email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: quoteRequests.length,
    data: {
      quoteRequests
    }
  });
});

// Get quote requests for a specific company
exports.getMyQuoteRequests = catchAsync(async (req, res, next) => {
  const quoteRequests = await QuoteRequest.find({ company: req.user.id })
    .populate({
      path: 'responses',
      populate: {
        path: 'responder',
        select: 'companyName email'
      }
    })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: quoteRequests.length,
    data: {
      quoteRequests
    }
  });
});

// Get a specific quote request
exports.getQuoteRequest = catchAsync(async (req, res, next) => {
  const quoteRequest = await QuoteRequest.findById(req.params.id)
    .populate('company', 'companyName email phoneNumber address');
  
  if (!quoteRequest) {
    return next(new AppError('No quote request found with that ID', 404));
  }
  
  // Check if user has access to this quote request
  if (quoteRequest.company._id.toString() !== req.user.id && 
      !['freight-forwarder', 'transporter', 'admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view this quote request', 403));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      quoteRequest
    }
  });
});