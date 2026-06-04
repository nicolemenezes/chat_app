import { useEffect, useRef } from "react";
import MessageGroup from "./MessageGroup";

function groupMessages(msgs = []) {
  const safeMessages = Array.isArray(msgs) ? msgs : [];
  const groups = [];
  safeMessages.forEach((msg, i) => {
    const prev = safeMessages[i - 1];
    const sameAuthor = prev && prev.sender?._id === msg.sender?._id;
    const close = prev && new Date(msg.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000;
    if (sameAuthor && close) {
      groups[groups.length - 1].messages.push(msg);
    } else {
      groups.push({ sender: msg.sender, messages: [msg] });
    }
  });
  return groups;
}

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages]);

  useEffect(() => {
    console.log("[MessageList] messages prop", {
      value: messages,
      type: Object.prototype.toString.call(messages),
      isArray: Array.isArray(messages),
      length: Array.isArray(messages) ? messages.length : null,
    });
  }, [messages]);

  const groups = groupMessages(safeMessages);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
      {groups.map((group, i) => (
        <MessageGroup key={i} group={group} isOwn={group.sender?._id === currentUserId} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}