export function Mark({ size = "nav" }: { size?: "nav" | "hero" }) {
  return (
    <span className={`mark mark-${size}`} role="img" aria-label="Design Lab North">
      <img className="mark-on-paper" src="/brand/dln-mute.png" alt="" />
      <img className="mark-on-ink" src="/brand/dln-white.png" alt="" />
    </span>
  );
}
