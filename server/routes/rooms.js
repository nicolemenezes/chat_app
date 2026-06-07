import express from "express";
import { v4 as uuidv4 } from "uuid";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

function normalizeInviteCode(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^.*\/join\//, "").replace(/\/$/, "");
}

// Get all rooms for current user
router.get("/", protect, async (req, res) => {
  const rooms = await Room.find({ members: req.user.id }).populate("members", "username avatar isOnline");
  res.json(rooms);
});

// Create DM or group
router.post("/", protect, async (req, res) => {
  const { type, members, name } = req.body;

  console.log("req.user.id =", req.user.id);
  console.log("members from frontend =", members);

  if (type === "dm") {
    const requestMembers = Array.isArray(members) ? members : [];
    const targetMemberId = requestMembers[0] || null;

    console.log("[rooms:dm] incoming request", {
      reqUserId: req.user?.id,
      reqBodyMembers: requestMembers,
      reqBody: req.body,
      type,
    });

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!targetMemberId) {
      return res.status(400).json({ message: "DM target is required" });
    }

    const targetUser = await User.findById(targetMemberId).select("username avatar isOnline");
    console.log("[rooms:dm] searched username", {
      targetMemberId,
      targetUsername: targetUser?.username || null,
      requestedBy: req.user.id,
    });

    if (!targetUser) {
      console.log("[rooms:dm] user lookup result", {
        targetMemberId,
        found: false,
      });
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[rooms:dm] user lookup result", {
      targetMemberId,
      targetUsername: targetUser.username,
      found: true,
    });

    const existingRoom = await Room.findOne({
      type: "dm",
      members: { $all: [req.user.id, targetUser._id], $size: 2 },
    }).populate("members", "username avatar isOnline");

    if (existingRoom) {
      console.log("[rooms:dm] existing DM room found", {
        roomId: existingRoom._id,
        members: existingRoom.members?.map((member) => member.username),
      });
      return res.json(existingRoom);
    }

    console.log("[rooms:dm] allMembers before Room.create()", {
      allMembers: [req.user.id, targetUser._id],
    });

    const room = await Room.create({
      type: "dm",
      members: [req.user.id, targetUser._id],
      name: "",
    });

    const populatedRoom = await room.populate("members", "username avatar isOnline");
    console.log("allMembers =", [req.user.id, targetUser._id]);
    console.log("[rooms:dm] created room document", {
      room: populatedRoom,
      memberCount: Array.isArray(populatedRoom.members) ? populatedRoom.members.length : null,
    });
    console.log("created room =", populatedRoom);

    if (!Array.isArray(populatedRoom.members) || populatedRoom.members.length !== 2) {
      console.warn("[rooms:dm] invalid member count after create", {
        roomId: populatedRoom._id,
        members: populatedRoom.members,
      });
      return res.status(500).json({ message: "DM room must contain exactly two members" });
    }

    console.log("[rooms:dm] new DM room created", {
      roomId: populatedRoom._id,
      members: populatedRoom.members?.map((member) => member.username),
    });

    return res.status(201).json(populatedRoom);
  }

  const allMembers = [...new Set([req.user.id, ...members])];

  console.log("allMembers =", allMembers);

  const inviteCode = type === "group" ? uuidv4().slice(0, 8) : undefined;
  console.log("[rooms:create] invite code generated", {
    type,
    roomName: name,
    inviteCode,
    members: allMembers,
  });
  const room = await Room.create({ type, members: allMembers, name, inviteCode });
  console.log("created room =", room);
  res.status(201).json(room);
});

// Join via invite code
router.post("/join/:code", protect, async (req, res) => {
  const routeCode = normalizeInviteCode(req.params.code);
  const bodyCode = normalizeInviteCode(req.body?.inviteCode || req.body?.code);
  const inviteCode = routeCode || bodyCode;

  console.log("[rooms:join] request received", {
    params: req.params,
    body: req.body,
    normalizedRouteCode: routeCode,
    normalizedBodyCode: bodyCode,
    finalInviteCode: inviteCode,
  });

  const room = await Room.findOne({ inviteCode });
  if (!room) return res.status(404).json({ message: "Invalid invite code" });
  if (!room.members.includes(req.user.id)) {
    room.members.push(req.user.id);
    await room.save();
  }
  res.json(room);
});

// Get room members
router.get("/:roomId/members", protect, async (req, res) => {
  const room = await Room.findById(req.params.roomId).populate("members", "username avatar isOnline");

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  const isMember = room.members.some((member) => member._id.toString() === req.user.id);
  if (!isMember) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(Array.isArray(room.members) ? room.members : []);
});

// Get message history
router.get("/:roomId/messages", protect, async (req, res) => {
  console.log("[rooms:messages] request received", {
    roomId: req.params.roomId,
    userId: req.user.id,
    params: req.params,
    body: req.body,
  });

  const messages = await Message.find({ room: req.params.roomId })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 })
    .limit(50);

  console.log("[rooms:messages] response", {
    roomId: req.params.roomId,
    count: Array.isArray(messages) ? messages.length : null,
  });

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