const express = require('express');
const quoteRequestController = require('../controllers/quoteRequestController');
const quoteResponseController = require('../controllers/quoteResponseController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Quote Request Routes
router.post(
  '/quote-requests',
  restrictTo('company'),
  quoteRequestController.createQuoteRequest
);

router.get(
  '/quote-requests/my',
  restrictTo('company'),
  quoteRequestController.getMyQuoteRequests
);

router.get(
  '/quote-requests/:id',
  restrictTo('company', 'freight-forwarder', 'transporter', 'admin'),
  quoteRequestController.getQuoteRequest
);

router.get(
  '/quote-requests',
  restrictTo('freight-forwarder', 'transporter', 'admin'),
  quoteRequestController.getAllQuoteRequests
);

// Quote Response Routes
router.post(
  '/quote-requests/:id/respond',
  restrictTo('freight-forwarder', 'transporter'),
  quoteResponseController.createQuoteResponse
);

router.get(
  '/quote-requests/:id/responses',
  restrictTo('company'),
  quoteResponseController.getQuoteResponses
);

router.post(
  '/quote-responses/:id/accept',
  restrictTo('company'),
  quoteResponseController.acceptQuoteResponse
);

router.get(
  '/quote-responses/my',
  restrictTo('freight-forwarder', 'transporter'),
  quoteResponseController.getMyQuoteResponses
);

module.exports = router;