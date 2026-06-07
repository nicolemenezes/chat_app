import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import InviteBanner from "../ui/InviteBanner";
import { useMessages } from "../../hooks/useMessages";
import { useTyping } from "../../hooks/useTyping";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

function getDmDisplayName(room, currentUserId) {
  if (room?.type !== "dm") return room?.name || "";
  const otherMember = room.members?.find((member) => member?._id !== currentUserId);
  return otherMember?.username || room.name || "Direct Message";
}

export default function ChatWindow({ room, token }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { messages } = useMessages(room, token, socket);
  const { typingUsers, startTyping, stopTyping } = useTyping(room, socket, user);
  const roomDisplayName = getDmDisplayName(room, user?.id);

  const send = (content) => {
    if (!content.trim() || !socket) return;
    socket.emit("message:send", { roomId: room._id, content });
    stopTyping();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 flex-shrink-0">
        <span className="text-xl text-[#80848e]">{room.type === "dm" ? "@" : "#"}</span>
        <h1 className="font-semibold text-[15px] text-white">
          {room.type === "dm" ? roomDisplayName : (room.name || "Channel")}
        </h1>
        {room.type === "dm" && (
          <span className={`ml-2 w-2 h-2 rounded-full ${
            room.members?.some(m => m.isOnline) ? "bg-[#23a55a]" : "bg-[#80848e]"
          }`} />
        )}
        <div className="ml-auto flex gap-1">
          {["👥","🔔","📌","🔍"].map((ic, i) => (
            <button key={i} className="w-8 h-8 flex items-center justify-center rounded
                                       text-[#80848e] hover:text-[#b5bac1] hover:bg-[#35373c] text-sm transition-colors">
              {ic}
            </button>
          ))}
        </div>
      </div>

      {(room.inviteCode) && <InviteBanner room={room} />}

      <MessageList messages={messages} currentUserId={user?.id} />
      <TypingIndicator typingUsers={typingUsers} />
      <ChatInput
        onSend={send}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        roomName={room.type === "dm" ? roomDisplayName : room.name}
      />
    </div>
  );
}