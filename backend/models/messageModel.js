const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Message content is required"],
    maxLength: [2000, "Message cannot exceed 2000 characters"]
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  community: {   // 🔹 replaced channel
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  attachments: [{
    type: String // URLs to files
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  edited: {
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date }
  },
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

messageSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Message", messageSchema);