import express from "express";
import { v4 as uuidv4 } from "uuid";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import Community from "../models/Community.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get all rooms for current user
router.get("/", protect, async (req, res) => {
  const rooms = await Room.find({ members: req.user.id }).populate("members", "username avatar isOnline");
  res.json(rooms);
});

// Create DM or group
router.post("/", protect, async (req, res) => {
  const { type, members, name } = req.body;
  const allMembers = [...new Set([req.user.id, ...members])];
  const inviteCode = type === "group" ? uuidv4().slice(0, 8) : undefined;
  const room = await Room.create({ type, members: allMembers, name, inviteCode });
  res.status(201).json(room);
});

// Join via invite code
router.post("/join/:code", protect, async (req, res) => {
  const room = await Room.findOne({ inviteCode: req.params.code });
  if (!room) return res.status(404).json({ message: "Invalid invite code" });
  if (!room.members.includes(req.user.id)) {
    room.members.push(req.user.id);
    await room.save();
  }
  res.json(room);
});

// Get message history
router.get("/:roomId/messages", protect, async (req, res) => {
  const messages = await Message.find({ room: req.params.roomId })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 })
    .limit(50);
  res.json(messages);
});

// Create community
router.post("/community", protect, async (req, res) => {
  const { name, description } = req.body;
  const inviteCode = uuidv4().slice(0, 8);
  const general = await Room.create({ name: "general", type: "channel", members: [req.user.id] });
  const community = await Community.create({
    name, description, owner: req.user.id,
    members: [req.user.id], inviteCode, channels: [general._id],
  });
  general.community = community._id;
  await general.save();
  res.status(201).json(community);
});

// Get all communities for current user
router.get("/communities", protect, async (req, res) => {
  try {
    const communities = await Community.find({ members: req.user.id })
      .populate("members", "username avatar isOnline");
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;