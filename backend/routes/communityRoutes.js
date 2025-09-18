// In your communityRoutes.js file, add this before your PATCH route:
const express = require("express");
const router = express.Router();

// Import controllers
const communityController = require("../controllers/communityController");
const messageController = require("../controllers/messageController");
const { protect } = require("../middlewares/auth");

// Protect all routes
router.use(protect);

// Handle preflight requests for PATCH
router.options("/:id/join-requests/:requestId", (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Community routes
router.post("/", communityController.createCommunity);
router.get("/", communityController.getCommunities);
router.get("/:id", communityController.getCommunity);
router.post("/:id/join", communityController.joinCommunity);
router.post("/:id/leave", communityController.leaveCommunity);

// Join request routes
router.post("/:id/join-request", communityController.createJoinRequest);
router.get("/:id/join-requests", communityController.getJoinRequests);
router.post("/:id/join-requests/:requestId/process", communityController.processJoinRequest);

// Message routes
router.post("/:communityId/messages", messageController.sendMessage);
router.get("/:communityId/messages", messageController.getMessages);
    
module.exports = router;