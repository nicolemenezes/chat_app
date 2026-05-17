import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name:       { type: String, required: true },
  description:{ type: String, default: "" },
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  inviteCode: { type: String, unique: true },
  channels:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
}, { timestamps: true });

export default mongoose.model("Community", communitySchema);