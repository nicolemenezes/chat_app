const COLORS = [
  "#5865f2","#ed4245","#f0b232","#3ba55d",
  "#eb459e","#4fdc7c","#ff7f50","#9b59b6"
];

function colorFor(name = "") {
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name = "?", size = 36 }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: "50%",
        background: colorFor(name),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 500,
        color: "#fff",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}