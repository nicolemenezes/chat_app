import { useState, useEffect } from "react";
import axios from "axios";

function normalizeMessages(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.messages)) return value.messages;
  return [];
}

export function useMessages(room, token, socket) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!room?._id || !socket) return;

    setMessages([]);
    socket.emit("room:join", room._id);
    axios.get(`/api/rooms/${room._id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      console.log("[useMessages] fetched messages", {
        roomId: room._id,
        value: data,
        type: Object.prototype.toString.call(data),
        isArray: Array.isArray(data),
      });
      setMessages(normalizeMessages(data));
    }).catch((err) => {
      console.error("[useMessages] failed to load messages", {
        roomId: room._id,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setMessages([]);
    });

    const onNew = (msg) => setMessages((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [...safePrev, msg];
    });
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [room?._id, socket, token]);

  return { messages };
}