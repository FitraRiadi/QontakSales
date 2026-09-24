import { useMemo, useState } from "react";
import "./BackgroundRipple.css";

/**
 * Port murni (tanpa Tailwind/shadcn) dari BackgroundRippleEffect:
 * grid kotak interaktif — hover menyala, klik memicu gelombang ripple
 * dari sel yang diklik (delay proporsional jarak).
 */
export default function BackgroundRipple({ rows = 8, cols = 27, cellSize = 56, className = "" }) {
  const [origin, setOrigin] = useState(null);
  const [burst, setBurst] = useState(0);
  const cells = useMemo(() => Array.from({ length: rows * cols }, (_, i) => i), [rows, cols]);

  return (
    <div className={`brip-root ${className}`} aria-hidden="true">
      <div
        key={`brip-${burst}`}
        className="brip-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {cells.map((idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const dist = origin ? Math.hypot(origin.row - row, origin.col - col) : 0;
          const style = origin
            ? {
                "--brip-delay": `${Math.max(0, dist * 55)}ms`,
                "--brip-duration": `${200 + dist * 80}ms`,
              }
            : undefined;
          return (
            <div
              key={idx}
              className={"brip-cell" + (origin ? " brip-rippling" : "")}
              style={style}
              onClick={() => {
                setOrigin({ row, col });
                setBurst((k) => k + 1);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
