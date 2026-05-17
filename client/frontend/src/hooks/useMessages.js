import { useState, useEffect } from "react";
import axios from "axios";

export function useMessages(room, token, socket) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!room || !socket) return;
    setMessages([]);
    socket.emit("room:join", room._id);
    axios.get(`/api/rooms/${room._id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => setMessages(data));

    const onNew = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [room?._id, socket]);

  return { messages };
}