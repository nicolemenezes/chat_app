import { useState, useEffect } from "react";

export function useTyping(room, socket, user) {
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = ({ userId, username, isTyping }) => {
      if (userId === user?.id) return;
      setTypingUsers((prev) =>
        isTyping ? [...new Set([...prev, username])] : prev.filter((u) => u !== username)
      );
    };
    socket.on("typing:update", onUpdate);
    return () => socket.off("typing:update", onUpdate);
  }, [socket, user?.id]);

  // Note: update your socketHandler to also send `username` in typing events

  const startTyping = () => socket?.emit("typing:start", { roomId: room?._id });
  const stopTyping = () => socket?.emit("typing:stop", { roomId: room?._id });

  return { typingUsers, startTyping, stopTyping };
}