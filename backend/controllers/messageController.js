const Message = require("../models/messageModel");
const Community = require("../models/communityModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Send a message in a community
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { content, replyTo, attachments } = req.body;
  const { communityId } = req.params;

  const community = await Community.findById(communityId);
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // check membership
  const isMember = community.members.some(
    m => m.user.toString() === req.user.id
  );
  if (!isMember) {
    return next(new AppError("You are not a member of this community", 403));
  }

  const message = await Message.create({
    content,
    sender: req.user.id,
    community: communityId,
    replyTo,
    attachments
  });

  await message.populate("sender", "companyName role");

  res.status(201).json({
    status: "success",
    data: { message }
  });
});

// Get messages in a community
exports.getMessages = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const community = await Community.findById(communityId);
  if (!community) {
    return next(new AppError("Community not found", 404));
  }

  // check membership
  const isMember = community.members.some(
    m => m.user.toString() === req.user.id
  );
  if (!isMember) {
    return next(new AppError("You are not a member of this community", 403));
  }

  const messages = await Message.find({ community: communityId })
    .populate("sender", "companyName role")
    .populate("replyTo", "content sender")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: { messages }
  });
});