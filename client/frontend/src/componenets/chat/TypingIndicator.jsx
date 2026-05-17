export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers.length) return <div className="h-6 flex-shrink-0" />;
  const names = typingUsers.join(", ");
  const verb = typingUsers.length === 1 ? "is" : "are";
  return (
    <div className="flex items-center gap-1.5 px-4 pb-1 text-xs text-[#80848e] flex-shrink-0">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-[#80848e] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span><strong className="text-[#b5bac1]">{names}</strong> {verb} typing...</span>
    </div>
  );
}