import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:9000";

function normalizeInviteCode(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^.*\/join\//, "").replace(/\/$/, "");
}

export default function JoinPage() {
  const { code } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedCode = normalizeInviteCode(code);
    if (!normalizedCode) {
      navigate("/");
      return;
    }

    console.log("[JoinPage] join request", {
      rawCode: code,
      normalizedCode,
      apiUrl: `${API_BASE}/api/rooms/join/${normalizedCode}`,
    });

    axios.post(`${API_BASE}/api/rooms/join/${normalizedCode}`, { inviteCode: normalizedCode }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => navigate("/")).catch(() => navigate("/"));
  }, [code, token, navigate]);

  return <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">Joining...</div>;
}