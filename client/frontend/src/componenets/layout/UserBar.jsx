import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

export default function UserBar({ onLogout }) {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-2 px-2 py-2 bg-[#232428] flex-shrink-0">
      <div className="relative">
        <Avatar name={user?.username || "?"} size={30} />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-[#232428]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{user?.username}</div>
        <div className="text-xs text-[#80848e]">Online</div>
      </div>
      <div className="flex gap-0.5">
        {[
          { icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2", label: "Mute" },
          { icon: "M3 18v-6a9 9 0 0 1 18 0v6", label: "Deafen" },
          { icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", label: "Settings" },
        ].map(({ icon, label }) => (
          <button key={label} aria-label={label}
            className="w-7 h-7 flex items-center justify-center rounded text-[#80848e] hover:text-[#b5bac1] hover:bg-[#35373c] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={icon} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
        <button onClick={onLogout} aria-label="Log out"
          className="w-7 h-7 flex items-center justify-center rounded text-[#80848e] hover:text-red-400 hover:bg-[#35373c] transition-colors text-xs font-bold">
          ✕
        </button>
      </div>
    </div>
  );
}