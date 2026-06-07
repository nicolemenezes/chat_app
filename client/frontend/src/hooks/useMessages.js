import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

function normalizeMessages(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.messages)) return value.messages;
  return [];
}

export function useMessages(room, token, socket) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!room?._id || !socket) return;

    let isActive = true;
    const requestUrl = `${API_BASE}/api/rooms/${room._id}/messages`;

    console.log("[useMessages] opening room", {
      roomId: room._id,
      requestUrl,
    });

    setMessages((prev) => {
      console.log("[useMessages] reset messages before fetch", {
        roomId: room._id,
        previousLength: Array.isArray(prev) ? prev.length : null,
      });
      return [];
    });

    socket.emit("room:join", room._id);
    axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      if (!isActive) return;

      const { data, status } = response;
      const normalized = normalizeMessages(data);

      console.log("[useMessages] fetched messages", {
        roomId: room._id,
        requestUrl,
        responseStatus: status,
        responseDataLength: Array.isArray(data)
          ? data.length
          : (Array.isArray(data?.messages) ? data.messages.length : null),
        value: data,
        type: Object.prototype.toString.call(data),
        isArray: Array.isArray(data),
      });
      setMessages((prev) => {
        console.log("[useMessages] setMessages from response", {
          roomId: room._id,
          previousLength: Array.isArray(prev) ? prev.length : null,
          nextLength: normalized.length,
        });
        return normalized;
      });
    }).catch((err) => {
      if (!isActive) return;

      console.error("[useMessages] failed to load messages", {
        roomId: room._id,
        requestUrl,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setMessages((prev) => {
        console.log("[useMessages] setMessages on fetch failure", {
          roomId: room._id,
          previousLength: Array.isArray(prev) ? prev.length : null,
          nextLength: 0,
        });
        return [];
      });
    });

    const onNew = (msg) => setMessages((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [...safePrev, msg];
    });

    socket.on("message:new", onNew);

    return () => {
      isActive = false;
      socket.off("message:new", onNew);
    };
  }, [room?._id, socket, token]);

  useEffect(() => {
    console.log("[useMessages] messages state updated", {
      roomId: room?._id,
      messagesLength: Array.isArray(messages) ? messages.length : null,
      messages,
    });
  }, [messages, room?._id]);

  return { messages };
}