const QuoteRequest = require('../models/quoteRequestModel');
const QuoteResponse = require('../models/quoteResponseModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create a new quote response
exports.createQuoteResponse = catchAsync(async (req, res, next) => {
  // Check if quote request exists
  const quoteRequest = await QuoteRequest.findById(req.params.id);
  
  if (!quoteRequest) {
    return next(new AppError('No quote request found with that ID', 404));
  }
  
  // Check if quote request is still open
  if (quoteRequest.status !== 'open') {
    return next(new AppError('This quote request is no longer accepting responses', 400));
  }
  
  // Add responder ID and quote request ID
  req.body.responder = req.user.id;
  req.body.quoteRequest = req.params.id;
  
  const quoteResponse = await QuoteResponse.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      quoteResponse
    }
  });
});

// Get all responses for a quote request
exports.getQuoteResponses = catchAsync(async (req, res, next) => {
  // Check if quote request exists and belongs to the company
  const quoteRequest = await QuoteRequest.findOne({
    _id: req.params.id,
    company: req.user.id
  });
  
  if (!quoteRequest) {
    return next(new AppError('No quote request found with that ID', 404));
  }
  
  const quoteResponses = await QuoteResponse.find({ quoteRequest: req.params.id })
    .populate('responder', 'companyName email phoneNumber address')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: quoteResponses.length,
    data: {
      quoteResponses
    }
  });
});

// Accept a quote response
// Accept a quote response (alternative approach)
exports.acceptQuoteResponse = catchAsync(async (req, res, next) => {
  const quoteResponse = await QuoteResponse.findById(req.params.id)
    .populate('quoteRequest');
  
  if (!quoteResponse) {
    return next(new AppError('No quote response found with that ID', 404));
  }
  
  // Check if user is the owner of the quote request
  if (quoteResponse.quoteRequest.company.toString() !== req.user.id) {
    return next(new AppError('You can only accept responses to your own quote requests', 403));
  }
  
  // Check if response is still pending
  if (quoteResponse.status !== 'pending') {
    return next(new AppError('This response has already been processed', 400));
  }
  
  // Use a single bulk operation instead of transactions
  const bulkOps = [
    {
      updateOne: {
        filter: { _id: quoteResponse._id },
        update: { status: 'accepted' }
      }
    },
    {
      updateMany: {
        filter: {
          quoteRequest: quoteResponse.quoteRequest._id,
          _id: { $ne: quoteResponse._id },
          status: 'pending'
        },
        update: { status: 'rejected' }
      }
    },
    {
      updateOne: {
        filter: { _id: quoteResponse.quoteRequest._id },
        update: { status: 'closed' }
      }
    }
  ];
  
  await QuoteResponse.bulkWrite(bulkOps);
  
  // Populate the updated response
  const updatedResponse = await QuoteResponse.findById(req.params.id)
    .populate('responder', 'companyName email phoneNumber address')
    .populate('quoteRequest');
  
  res.status(200).json({
    status: 'success',
    message: 'Quote response accepted successfully',
    data: {
      quoteResponse: updatedResponse
    }
  });
});

// Get quote responses for a freight forwarder/transporter
exports.getMyQuoteResponses = catchAsync(async (req, res, next) => {
  const quoteResponses = await QuoteResponse.find({ responder: req.user.id })
    .populate({
      path: 'quoteRequest',
      populate: {
        path: 'company',
        select: 'companyName email'
      }
    })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: quoteResponses.length,
    data: {
      quoteResponses
    }
  });
});