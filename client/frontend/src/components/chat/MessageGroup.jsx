import Avatar from "../ui/Avatar";

export default function MessageGroup({ group, isOwn }) {
  const { sender, messages } = group;
  const firstMsg = messages[0];

  return (
    <div className="flex gap-3.5 mt-4 group hover:bg-white/[0.02] rounded px-1 -mx-1 py-0.5">
      <div className="flex-shrink-0 mt-0.5">
        <Avatar name={sender?.username || "?"} size={36} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className={`text-sm font-medium ${isOwn ? "text-[#5865f2]" : "text-white"}`}>
            {sender?.username || "Unknown"}
          </span>
          <span className="text-[11px] text-[#80848e]">
            {new Date(firstMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        {messages.map((msg) => (
          <p key={msg._id} className="text-sm text-[#b5bac1] leading-relaxed">
            {msg.content}
          </p>
        ))}
      </div>
    </div>
  );
}