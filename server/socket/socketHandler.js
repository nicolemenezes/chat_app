import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const initSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);

    // Mark user online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("user:status", { userId, isOnline: true });

    // Join a room
    socket.on("room:join", (roomId) => {
      socket.join(roomId);
      socket.emit("room:joined", roomId);
    });

    // Send message
    socket.on("message:send", async ({ roomId, content }) => {
      const msg = await Message.create({ room: roomId, sender: userId, content });
      const populated = await msg.populate("sender", "username avatar");
      io.to(roomId).emit("message:new", populated);
    });

    // Typing indicators
   socket.on("typing:start", ({ roomId }) => {
  socket.to(roomId).emit("typing:update", {
    userId,
    username: socket.user.username,  // add this
    isTyping: true
  });
});
socket.on("typing:stop", ({ roomId }) => {
  socket.to(roomId).emit("typing:update", {
    userId,
    username: socket.user.username,  // add this
    isTyping: false
  });
});

    // Disconnect
    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      io.emit("user:status", { userId, isOnline: false });
    });
  });
};