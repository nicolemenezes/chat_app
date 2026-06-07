import { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "../ui/Avatar";

const API_BASE = import.meta.env.VITE_API_URL;

function normalizeMembers(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.members)) return value.members;
  return Array.isArray(fallback) ? fallback : [];
}

export default function MembersPanel({ room, token }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!room?._id) return;

    axios
      .get(`${API_BASE}/api/rooms/${room._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        console.log("[MembersPanel] fetched members", {
          roomId: room._id,
          value: data,
          type: Object.prototype.toString.call(data),
          isArray: Array.isArray(data),
        });
        setMembers(normalizeMembers(data, room.members));
      })
      .catch((err) => {
        console.error("[MembersPanel] failed to load members", {
          roomId: room._id,
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setMembers(normalizeMembers(room.members));
      });
  }, [room?._id, token]);

  const safeMembers = Array.isArray(members) ? members : [];
  const online = safeMembers.filter((m) => m.isOnline);
  const offline = safeMembers.filter((m) => !m.isOnline);

  useEffect(() => {
    const ids = safeMembers.map((member) => member?._id).filter(Boolean);
    const idCounts = ids.reduce((counts, id) => {
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {});
    const duplicateIds = Object.entries(idCounts)
      .filter(([, count]) => count > 1)
      .map(([id]) => id);
    const missingIds = safeMembers
      .map((member, index) => ({ member, index }))
      .filter(({ member }) => !member?._id)
      .map(({ index, member }) => ({ index, member }));

    console.log("[MembersPanel] member id audit", {
      roomId: room?._id,
      members: safeMembers,
      missingIds,
      duplicateIds,
    });

    if (missingIds.length > 0 || duplicateIds.length > 0) {
      console.warn("[MembersPanel] non-unique or missing member ids", {
        roomId: room?._id,
        missingIds,
        duplicateIds,
      });
    }
  }, [room?._id, members]);

  const getMemberKey = (member, index, scope) => {
    const id = member?._id;
    if (id) return `${scope}-${id}-${index}`;
    return `${scope}-missing-${index}`;
  };

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
          {online.map((m, index) => (
            <MemberRow key={getMemberKey(m, index, "online")} m={m} />
          ))}
        </>
      )}
      {offline.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#80848e] mb-2 px-2 mt-4">
            Offline — {offline.length}
          </p>
          {offline.map((m, index) => (
            <MemberRow key={getMemberKey(m, index, "offline")} m={m} />
          ))}
        </>
      )}
      {safeMembers.length === 0 && (
        <p className="text-xs text-[#4e5058] px-2 mt-2">No members</p>
      )}
    </div>
  );
}