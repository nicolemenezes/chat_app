import { useState, useRef } from "react";

export default function ChatInput({ onSend, onTyping, onStopTyping, roomName }) {
  const [value, setValue] = useState("");
  const timer = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping();
    clearTimeout(timer.current);
    timer.current = setTimeout(onStopTyping, 1500);
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
    clearTimeout(timer.current);
  };

  return (
    <div className="px-4 pb-4 flex-shrink-0">
      <div className="flex items-center gap-3 bg-[#383a40] rounded-xl px-4 py-2.5">
        <button className="text-[#80848e] hover:text-[#b5bac1] transition-colors text-lg flex-shrink-0" aria-label="Attach file">
          +
        </button>
        <input
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Message #${roomName || "chat"}`}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-[#80848e]"
        />
        <div className="flex items-center gap-2">
          <button className="text-[#80848e] hover:text-[#b5bac1] transition-colors text-sm" aria-label="Emoji">😊</button>
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="text-[#5865f2] hover:text-[#4752c4] disabled:text-[#4e5058] transition-colors font-semibold text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}