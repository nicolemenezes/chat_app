export default function ServerRail({ communities = [], activeCommunity, onSelectCommunity }) {
  const colors = ["#5865f2", "#ed4245", "#f0b232", "#3ba55d", "#eb459e"];

  return (
    <div className="w-[60px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 overflow-y-auto flex-shrink-0">
      <div
        className="w-12 h-12 rounded-[50%] hover:rounded-[14px] bg-[#5865f2] flex items-center
                   justify-center cursor-pointer transition-all duration-150 relative"
        title="Home"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>

      <div className="w-8 h-px bg-white/10 my-1" />

      {communities.map((c, i) => (
        <div
          key={c._id}
          onClick={() => onSelectCommunity(activeCommunity?._id === c._id ? null : c)}
          title={c.name}
          className={`w-12 h-12 transition-all duration-150 flex items-center justify-center
                      cursor-pointer text-white text-sm font-semibold relative
                      ${activeCommunity?._id === c._id
                        ? "rounded-[14px]"
                        : "rounded-[50%] hover:rounded-[14px]"}`}
          style={{ background: colors[i % colors.length] }}
        >
          {activeCommunity?._id === c._id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
          )}
          {c.name.slice(0, 2).toUpperCase()}
        </div>
      ))}

      <div className="w-8 h-px bg-white/10 my-1" />

      <div
        className="w-12 h-12 rounded-[50%] hover:rounded-[14px] bg-[#2b2d31] hover:bg-[#23a55a]
                   flex items-center justify-center cursor-pointer transition-all duration-150
                   text-[#23a55a] hover:text-white text-2xl font-light"
        title="Add a server"
      >
        +
      </div>
    </div>
  );
}