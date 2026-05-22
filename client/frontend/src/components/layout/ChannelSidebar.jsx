import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import UserBar from "./UserBar";
import Avatar from "../ui/Avatar";

export default function ChannelSidebar({ rooms, activeRoom, onSelectRoom, onRoomCreated, token }) {
  const { user, logout } = useAuth();
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("group");
  const [inviteCode, setInviteCode] = useState("");
  const [tab, setTab] = useState("channels"); // channels | dms

  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const dms = safeRooms.filter((r) => r.type === "dm");
  const groups = safeRooms.filter((r) => r.type === "group");
  const channels = safeRooms.filter((r) => r.type === "channel");

  const createRoom = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(
      "/api/rooms",
      { name: newRoomName, type: newRoomType, members: [] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onRoomCreated(data);
    setNewRoomName("");
    setShowNewRoom(false);
  };

  const joinByCode = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(
      `/api/rooms/join/${inviteCode.trim()}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onRoomCreated(data);
    setInviteCode("");
  };

  const Section = ({ label, items, icon = "#" }) => (
    <div className="mb-1">
      <div className="flex items-center justify-between px-4 py-1 cursor-pointer group">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#80848e] group-hover:text-[#b5bac1]">
          {label}
        </span>
        <button
          onClick={() => setShowNewRoom(true)}
          className="text-[#80848e] hover:text-[#b5bac1] text-lg leading-none"
        >+</button>
      </div>
      {items.map((room) => (
        <div
          key={room._id}
          onClick={() => onSelectRoom(room)}
          className={`flex items-center gap-2 mx-2 px-3 py-1.5 rounded cursor-pointer text-sm transition-colors
            ${activeRoom?._id === room._id
              ? "bg-[#404249] text-white"
              : "text-[#80848e] hover:bg-[#35373c] hover:text-[#b5bac1]"}`}
        >
          <span className="text-base opacity-70">{icon}</span>
          <span className="truncate">{room.name || "Direct Message"}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5
                      cursor-pointer hover:bg-[#35373c] transition-colors">
        <span className="font-semibold text-[15px] text-white truncate">DevSpace</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#b5bac1]">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="bg-[#1e1f22] rounded flex items-center gap-2 px-3 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#80848e]">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="text-sm text-[#80848e]">Search</span>
          <span className="ml-auto text-xs text-[#80848e]">⌘K</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <Section label="Text Channels" items={channels} icon="#" />
        <Section label="Groups" items={groups} icon="⊕" />

        {/* DMs */}
        <div className="mb-1">
          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#80848e]">
              Direct Messages
            </span>
            <button onClick={() => setShowNewRoom(true)} className="text-[#80848e] hover:text-[#b5bac1] text-lg leading-none">+</button>
          </div>
          {dms.map((room) => {
            const other = room.members?.find((m) => m._id !== user?.id);
            return (
              <div
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`flex items-center gap-2.5 mx-2 px-2 py-1.5 rounded cursor-pointer transition-colors
                  ${activeRoom?._id === room._id
                    ? "bg-[#404249] text-white"
                    : "text-[#80848e] hover:bg-[#35373c] hover:text-[#b5bac1]"}`}
              >
                <Avatar name={other?.username || "?"} size={28} />
                <div className="min-w-0">
                  <div className="text-sm truncate">{other?.username || "User"}</div>
                  <div className="text-xs text-[#4e5058]">
                    {other?.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Join by invite */}
        <div className="px-3 py-2 mt-2 border-t border-white/5">
          <form onSubmit={joinByCode} className="flex gap-2">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite code..."
              className="flex-1 bg-[#1e1f22] text-white text-xs rounded px-2 py-1.5 outline-none
                         border border-transparent focus:border-[#5865f2] min-w-0"
            />
            <button type="submit" className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs px-2 rounded transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* New Room Modal */}
      {showNewRoom && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#2b2d31] rounded-xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Create a room</h2>
            <form onSubmit={createRoom} className="space-y-3">
              <div>
                <label className="block text-xs text-[#b5bac1] uppercase tracking-wide mb-1">Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 text-sm outline-none"
                >
                  <option value="group">Group</option>
                  <option value="channel">Channel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#b5bac1] uppercase tracking-wide mb-1">Name</label>
                <input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="room-name"
                  required
                  className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 text-sm outline-none
                             border border-transparent focus:border-[#5865f2]"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowNewRoom(false)}
                  className="flex-1 bg-transparent border border-white/10 text-[#b5bac1] py-2 rounded text-sm hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white py-2 rounded text-sm transition-colors">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UserBar onLogout={logout} />
    </div>
  );
}