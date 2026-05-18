import { useState } from "react";

export default function InviteBanner({ room }) {
  const [copied, setCopied] = useState(false);
  if (!room?.inviteCode) return null;
  const url = `${window.location.origin}/join/${room.inviteCode}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-4 mt-2 bg-[#2e3035] rounded-lg px-3 py-2 flex items-center gap-3 flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#80848e] flex-shrink-0">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#80848e] mb-0.5">Invite link</p>
        <p className="text-xs text-[#5865f2] font-mono truncate cursor-pointer" onClick={copy}>
          {url}
        </p>
      </div>
      <button
        onClick={copy}
        className={`text-xs font-medium px-2 py-1 rounded transition-colors flex-shrink-0
          ${copied ? "text-[#23a55a]" : "text-[#5865f2] hover:text-[#4752c4]"}`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}