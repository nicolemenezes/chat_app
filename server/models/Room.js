import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name:        { type: String },
  type:        { type: String, enum: ["dm", "group", "channel"], required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  community:   { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },
  inviteCode:  { type: String, unique: true, sparse: true },
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);