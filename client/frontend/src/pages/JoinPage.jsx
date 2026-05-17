import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function JoinPage() {
  const { code } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.post(`/api/rooms/join/${code}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => navigate("/")).catch(() => navigate("/"));
  }, []);

  return <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">Joining...</div>;
}