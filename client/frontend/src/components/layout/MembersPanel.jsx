import { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "../ui/Avatar";

export default function MembersPanel({ room, token }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!room) return;
    axios
      .get(`/api/rooms/${room._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setMembers(data))
      .catch(() => setMembers(room.members || []));
  }, [room]);

  const online = members.filter((m) => m.isOnline);
  const offline = members.filter((m) => !m.isOnline);

  const MemberRow = ({ m }) => (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#35373c] group">
      <div className="relative flex-shrink-0">
        <Avatar name={m.username} size={28} />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#2b2d31]
          ${m.isOnline ? "bg-[#23a55a]" : "bg-[#80848e]"}`}
        />
      </div>
      <span className={`text-sm truncate ${
        m.isOnline ? "text-[#b5bac1] group-hover:text-white" : "text-[#4e5058]"
      }`}>
        {m.username}
      </span>
    </div>
  );

  return (
    <div className="w-48 bg-[#2b2d31] flex-shrink-0 overflow-y-auto p-3 border-l border-white/5">
      {online.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#80848e] mb-2 px-2">
            Online — {online.length}
          </p>
          {online.map((m) => <MemberRow key={m._id} m={m} />)}
        </>
      )}
      {offline.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#80848e] mb-2 px-2 mt-4">
            Offline — {offline.length}
          </p>
          {offline.map((m) => <MemberRow key={m._id} m={m} />)}
        </>
      )}
      {members.length === 0 && (
        <p className="text-xs text-[#4e5058] px-2 mt-2">No members</p>
      )}
    </div>
  );
}