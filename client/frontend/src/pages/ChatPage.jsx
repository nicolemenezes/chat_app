import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ServerRail from "../components/layout/ServerRail";
import ChannelSidebar from "../components/layout/ChannelSidebar";
import MembersPanel from "../components/layout/MembersPanel";
import ChatWindow from "../components/chat/ChatWindow";

export default function ChatPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [showMembers, setShowMembers] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get("/api/rooms", authHeader).then(({ data }) => {
      const safeRooms = Array.isArray(data) ? data : [];
      setRooms(safeRooms);
      if (safeRooms.length) setActiveRoom(safeRooms[0]);
    });
    axios.get("/api/communities", authHeader)
      .then(({ data }) => setCommunities(Array.isArray(data) ? data : []))
      .catch(() => setCommunities([]));
  }, [token]);

  const handleRoomCreated = (room) => {
    setRooms((prev) => [...prev, room]);
    setActiveRoom(room);
  };

  return (
    <div className="flex h-screen bg-[#313338] text-white overflow-hidden">
      <ServerRail
        communities={communities}
        activeCommunity={activeCommunity}
        onSelectCommunity={setActiveCommunity}
      />
      <ChannelSidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onRoomCreated={handleRoomCreated}
        community={activeCommunity}
        token={token}
      />
      <main className="flex-1 flex overflow-hidden">
        {activeRoom ? (
          <>
            <ChatWindow room={activeRoom} token={token} />
            {showMembers && <MembersPanel room={activeRoom} token={token} />}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#4e5058] gap-3">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="35" stroke="currentColor" strokeWidth="2"/>
              <path d="M24 36h24M36 24v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-lg font-medium text-[#80848e]">No conversation selected</p>
            <p className="text-sm text-[#4e5058]">Pick a channel or DM from the sidebar</p>
          </div>
        )}
      </main>
    </div>
  );
}
