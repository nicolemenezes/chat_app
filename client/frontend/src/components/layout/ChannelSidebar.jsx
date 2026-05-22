import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import UserBar from "./UserBar";
import Avatar from "../ui/Avatar";

export default function ChannelSidebar({ rooms, activeRoom, onSelectRoom, onRoomCreated, token }) {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("group"); // group | channel | dm
  const [roomName, setRoomName] = useState("");
  const [dmUsername, setDmUsername] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const channels = rooms.filter((r) => r.type === "channel");
  const groups   = rooms.filter((r) => r.type === "group");
  const dms      = rooms.filter((r) => r.type === "dm");

  const filtered = (list) =>
    search.trim()
      ? list.filter((r) =>
          (r.name || r.members?.find((m) => m._id !== user?.id)?.username || "")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : list;

  const openModal = (type) => {
    setModalType(type);
    setRoomName("");
    setDmUsername("");
    setError("");
    setShowModal(true);
  };

  const createRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let data;
      if (modalType === "dm") {
        // Find user by username first
        const { data: foundUser } = await axios.get(
          `/api/auth/user?username=${dmUsername.trim()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const res = await axios.post(
          "/api/rooms",
          { type: "dm", members: [foundUser._id], name: "" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = res.data;
      } else {
        const res = await axios.post(
          "/api/rooms",
          { type: modalType, members: [], name: roomName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = res.data;
      }
      onRoomCreated(data);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinByCode = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    try {
      const { data } = await axios.post(
        `/api/rooms/join/${inviteCode.trim()}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRoomCreated(data);
      setInviteCode("");
      alert(`Joined "${data.name}" successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid invite code");
    }
  };

  const RoomItem = ({ room }) => {
    const otherMember = room.type === "dm"
      ? room.members?.find((m) => m._id !== user?.id)
      : null;
    const displayName = room.type === "dm"
      ? (otherMember?.username || "Direct Message")
      : room.name;

    return (
      <div
        onClick={() => onSelectRoom(room)}
        className={`flex items-center gap-2 mx-2 px-3 py-1.5 rounded cursor-pointer text-sm transition-colors
          ${activeRoom?._id === room._id
            ? "bg-[#404249] text-white"
            : "text-[#80848e] hover:bg-[#35373c] hover:text-[#b5bac1]"}`}
      >
        {room.type === "dm"
          ? <Avatar name={displayName} size={22} />
          : <span className="text-base opacity-60">#</span>
        }
        <span className="truncate flex-1">{displayName}</span>
        {room.inviteCode && (
          <span className="text-[10px] text-[#5865f2] bg-[#5865f2]/10 px-1.5 py-0.5 rounded">
            invite
          </span>
        )}
      </div>
    );
  };

  const Section = ({ label, items, type }) => (
    <div className="mb-1">
      <div className="flex items-center justify-between px-4 py-1 group">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#80848e]">
          {label}
        </span>
        <button
          onClick={() => openModal(type)}
          className="text-[#80848e] hover:text-white text-lg leading-none transition-colors"
          title={`New ${label}`}
        >+</button>
      </div>
      {filtered(items).length === 0 && (
        <p className="text-[11px] text-[#4e5058] px-5 py-1 italic">
          No {label.toLowerCase()} yet
        </p>
      )}
      {filtered(items).map((room) => <RoomItem key={room._id} room={room} />)}
    </div>
  );

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5
                      cursor-pointer hover:bg-[#35373c] transition-colors">
        <span className="font-semibold text-[15px] text-white truncate">DevSpace</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="text-[#b5bac1] flex-shrink-0">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="bg-[#1e1f22] rounded flex items-center gap-2 px-3 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="text-[#80848e] flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-white placeholder-[#80848e] w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#80848e] hover:text-white text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto py-2">
        <Section label="Text Channels" items={channels} type="channel" />
        <Section label="Groups"        items={groups}   type="group" />
        <Section label="Direct Messages" items={dms}   type="dm" />

        {/* Join by invite */}
        <div className="px-3 py-2 mt-2 border-t border-white/5">
          <p className="text-[10px] text-[#80848e] mb-1.5 uppercase tracking-wide font-semibold">
            Join via invite
          </p>
          <form onSubmit={joinByCode} className="flex gap-2">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code..."
              className="flex-1 bg-[#1e1f22] text-white text-xs rounded px-2 py-1.5 outline-none
                         border border-transparent focus:border-[#5865f2] min-w-0"
            />
            <button type="submit"
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs px-2.5 rounded transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-[#2b2d31] rounded-xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              {modalType === "dm" ? "New Direct Message" :
               modalType === "group" ? "Create a Group" : "Create a Channel"}
            </h2>
            <p className="text-xs text-[#80848e] mb-4">
              {modalType === "dm"
                ? "Start a private conversation"
                : modalType === "group"
                ? "Groups have invite links — share them to add members"
                : "Channels are visible to everyone in the server"}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs
                              px-3 py-2 rounded mb-3">
                {error}
              </div>
            )}

            <form onSubmit={createRoom} className="space-y-3">
              {modalType === "dm" ? (
                <div>
                  <label className="block text-xs text-[#b5bac1] uppercase tracking-wide mb-1">
                    Username
                  </label>
                  <input
                    value={dmUsername}
                    onChange={(e) => setDmUsername(e.target.value)}
                    placeholder="Enter their username"
                    required
                    className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 text-sm outline-none
                               border border-transparent focus:border-[#5865f2]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-[#b5bac1] uppercase tracking-wide mb-1">
                    Name
                  </label>
                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder={modalType === "group" ? "my-group" : "general"}
                    required
                    className="w-full bg-[#1e1f22] text-white rounded px-3 py-2 text-sm outline-none
                               border border-transparent focus:border-[#5865f2]"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-white/10 text-[#b5bac1] py-2 rounded text-sm
                             hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50
                             text-white py-2 rounded text-sm transition-colors">
                  {loading ? "Creating..." : modalType === "dm" ? "Open DM" : "Create"}
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