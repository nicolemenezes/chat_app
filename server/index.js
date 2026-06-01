import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import { initSocket } from "./socket/socketHandler.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:9000"],
    credentials: true,
  },
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:9000"],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/communities", roomRoutes);

initSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("DB connection failed:", err));