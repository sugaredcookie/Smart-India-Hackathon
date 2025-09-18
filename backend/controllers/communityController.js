// controllers/communityController.js
const Community = require("../models/communityModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new community
exports.createCommunity = catchAsync(async (req, res, next) => {
  const { name, description, isPublic, allowedRoles } = req.body;
  
  const community = await Community.create({
    name,
    description,
    createdBy: req.user.id,
    members: [{
      user: req.user.id,
      role: "admin"
    }],
    allowedRoles: allowedRoles || ["company", "transporter", "freight-forwarder"],
    isPublic: isPublic !== undefined ? isPublic : true
  });

  res.status(201).json({
    status: "success",
    data: {
      community
    }
  });
});

// Get all communities user can access
exports.getCommunities = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  const communities = await Community.find({
    $or: [
      { isPublic: true },
      { "members.user": req.user.id },
      { allowedRoles: user.role }
    ]
  })
  .populate("createdBy", "companyName email")
  .populate("joinRequests.user", "companyName email");

  res.status(200).json({
    status: "success",
    results: communities.length,
    data: {
      communities
    }
  });
});

// Get a specific community
exports.getCommunity = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id)
    .populate("createdBy", "companyName email")
    .populate("members.user", "companyName role")
    .populate("joinRequests.user", "companyName email")
    .populate("joinRequests.reviewedBy", "companyName");

  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // Check if user has access
  const user = await User.findById(req.user.id);
  const isMember = community.members.some(member => 
    member.user._id.toString() === req.user.id
  );
  
  if (!community.isPublic && !isMember && !community.allowedRoles.includes(user.role)) {
    return next(new AppError("You don't have access to this community", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      community
    }
  });
});

// Join a community
exports.joinCommunity = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id);
  
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // Check if user is already a member
  const isMember = community.members.some(member => 
    member.user.toString() === req.user.id
  );

  if (isMember) {
    return next(new AppError("You are already a member of this community", 400));
  }

  // Check if user's role is allowed
  const user = await User.findById(req.user.id);
  if (!community.allowedRoles.includes(user.role)) {
    return next(new AppError("Your role is not allowed in this community", 403));
  }

  community.members.push({
    user: req.user.id,
    role: "member"
  });

  await community.save();

  res.status(200).json({
    status: "success",
    message: "Successfully joined the community",
    data: {
      community
    }
  });
});

// Create a join request
exports.createJoinRequest = catchAsync(async (req, res, next) => {
  const { name, role, reason } = req.body;
  const community = await Community.findById(req.params.id);
  
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // Check if user already has a pending request
  const existingRequest = community.joinRequests.find(
    request => request.user.toString() === req.user.id && request.status === "pending"
  );
  
  if (existingRequest) {
    return next(new AppError("You already have a pending join request", 400));
  }

  // Check if user is already a member
  const isMember = community.members.some(member => 
    member.user.toString() === req.user.id
  );
  
  if (isMember) {
    return next(new AppError("You are already a member of this community", 400));
  }

  // Add join request
  community.joinRequests.push({
    user: req.user.id,
    name,
    role,
    reason,
    status: "pending"
  });

  await community.save();
  
  // Populate the newly added request for response
  await community.populate("joinRequests.user", "companyName email");

  res.status(201).json({
    status: "success",
    message: "Join request submitted successfully",
    data: {
      joinRequest: community.joinRequests[community.joinRequests.length - 1]
    }
  });
});

// Get join requests for a community
exports.getJoinRequests = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id)
    .populate("joinRequests.user", "companyName email role")
    .populate("joinRequests.reviewedBy", "companyName");
  
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // Check if user is admin of the community
  const isAdmin = community.members.some(
    member => member.user.toString() === req.user.id && member.role === "admin"
  );
  
  if (!isAdmin) {
    return next(new AppError("Only admins can view join requests", 403));
  }

  res.status(200).json({
    status: "success",
    results: community.joinRequests.length,
    data: {
      joinRequests: community.joinRequests
    }
  });
});

// Process a join request
// Process a join request - FIXED VERSION
exports.processJoinRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { action } = req.body; // "approve" or "reject"
  
  const community = await Community.findById(req.params.id);
  
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // Check if user is admin of the community
  const isAdmin = community.members.some(
    member => member.user.toString() === req.user.id && member.role === "admin"
  );
  
  if (!isAdmin) {
    return next(new AppError("Only admins can process join requests", 403));
  }

  const joinRequest = community.joinRequests.id(requestId);
  
  if (!joinRequest) {
    return next(new AppError("Join request not found", 404));
  }

  if (joinRequest.status !== "pending") {
    return next(new AppError("This request has already been processed", 400));
  }

  if (action === "approve") {
    joinRequest.status = "approved";
    
    // Add user to members if not already a member
    const isAlreadyMember = community.members.some(
      member => member.user.toString() === joinRequest.user.toString()
    );
    
    if (!isAlreadyMember) {
      community.members.push({
        user: joinRequest.user,
        role: "member"
      });
    }
  } else if (action === "reject") {
    joinRequest.status = "rejected";
  } else {
    return next(new AppError("Invalid action. Use 'approve' or 'reject'", 400));
  }

  joinRequest.reviewedBy = req.user.id;
  joinRequest.reviewedAt = new Date();

  await community.save();

  res.status(200).json({
    status: "success",
    message: `Join request ${action === "approve" ? "approved" : "rejected"}`,
    data: {
      joinRequest
    }
  });
});

// Leave a community
exports.leaveCommunity = catchAsync(async (req, res, next) => {
  const community = await Community.findById(req.params.id);
  
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // Check if user is a member
  const memberIndex = community.members.findIndex(member => 
    member.user.toString() === req.user.id
  );

  if (memberIndex === -1) {
    return next(new AppError("You are not a member of this community", 400));
  }

  // Prevent admin from leaving (should transfer ownership first)
  if (community.members[memberIndex].role === "admin") {
    return next(new AppError("Admins cannot leave the community. Transfer ownership first.", 400));
  }

  community.members.splice(memberIndex, 1);
  await community.save();

  res.status(200).json({
    status: "success",
    message: "Successfully left the community"
  });
});