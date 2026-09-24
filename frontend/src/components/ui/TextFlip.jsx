import { useEffect, useMemo, useRef } from "react";
import "./TextFlip.css";

/**
 * Port murni (tanpa Tailwind) dari animata TextFlip:
 * satu kata berputar vertikal dalam loop. Prop `words` = kata unik,
 * kata pertama otomatis diulang di akhir biar loop-nya seamless.
 */
export default function TextFlip({ words, className = "" }) {
  const list = useMemo(() => [...words, words[0]], [words]);
  const tallestRef = useRef(null);

  useEffect(() => {
    const el = tallestRef.current;
    if (!el) return;
    let maxHeight = 0;
    const probes = [];
    words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "tf-probe";
      span.textContent = word;
      el.appendChild(span);
      if (span.offsetHeight > maxHeight) maxHeight = span.offsetHeight;
      probes.push(span);
    });
    probes.forEach((s) => el.removeChild(s));
    if (maxHeight > 0) el.style.height = `${maxHeight}px`;
  }, [words]);

  return (
    <span className={`tf-flip ${className}`} aria-live="off">
      <span ref={tallestRef} className="tf-col">
        {list.map((word, index) => (
          <span key={index} className="tf-word">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
