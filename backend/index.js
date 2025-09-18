const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Import routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const betaRoutes = require("./routes/betaRoutes");
const communityRoutes = require("./routes/communityRoutes"); 
const quoteRoutes = require("./routes/quoteRoutes");

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/beta', betaRoutes);
app.use('/api/community', communityRoutes);
app.use('/api', quoteRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  next();
});

io.on("connection", (socket) => {
  console.log(`🔗 New client connected: ${socket.id}`);

  // Join channel
  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
    console.log(`👤 User ${socket.id} joined channel ${channelId}`);
  });

  // Leave channel
  socket.on("leave_channel", (channelId) => {
    socket.leave(channelId);
    console.log(`👤 User ${socket.id} left channel ${channelId}`);
  });

  // Send new message
  socket.on("new_message", async (data) => {
    const { channelId, senderId, content } = data;

    const Message = require("./models/messageModel");
    const newMessage = await Message.create({
      channel: channelId,
      sender: senderId,
      content
    });

    io.to(channelId).emit("receive_message", newMessage);
    console.log(`📨 Message sent to channel ${channelId} by ${senderId}`);
  });

  // Typing indicator
  socket.on("typing_start", ({ channelId, userId }) => {
    socket.to(channelId).emit("user_typing", { userId, typing: true });
  });

  socket.on("typing_stop", ({ channelId, userId }) => {
    socket.to(channelId).emit("user_typing", { userId, typing: false });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, server, io };