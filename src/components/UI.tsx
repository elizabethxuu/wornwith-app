import { useState, useEffect } from "react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.18em] uppercase text-blush-deep font-sans font-semibold">
      {children}
    </p>
  );
}

export function Donut({
  percent,
  label,
  sublabel,
  color = "#C97A8C",
}: {
  percent: number;
  label: string;
  sublabel: string;
  color?: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Kick off the fill on the next tick so the browser paints the 0%
    // state first — otherwise React batches straight to the final value
    // and the stroke transition never has anything to animate from.
    const t = setTimeout(() => setDisplayed(percent), 50);
    return () => clearTimeout(t);
  }, [percent]);

  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (displayed / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[84px] h-[84px]">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={r} fill="none" stroke="#F1E9EA" strokeWidth="8" />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 42 42)"
            style={{ transition: "stroke-dashoffset 1.1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display italic text-lg text-ink">
          {displayed}%
        </div>
      </div>
      <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide">{label}</p>
      <p className="text-[10px] font-sans text-clay/70">{sublabel}</p>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-paper border border-line rounded-card px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function JourneyMap() {
  const points = [
    { x: 34, y: 96, label: "NZ" },
    { x: 118, y: 42, label: "Italy" },
    { x: 192, y: 74, label: "Portugal" },
    { x: 268, y: 36, label: "Paris", active: true },
  ];
  const path = `M ${points[0].x} ${points[0].y} Q 80 20, ${points[1].x} ${points[1].y} T ${points[2].x} ${points[2].y} Q 230 50, ${points[3].x} ${points[3].y}`;

  return (
    <div className="w-full bg-blush-pale/40 rounded-card py-5 px-2 mb-4">
      <svg viewBox="0 0 300 130" className="w-full h-auto" fill="none">
        {/* faint globe texture — a few soft latitude arcs */}
        <ellipse cx="150" cy="65" rx="140" ry="55" stroke="#E7A6B4" strokeOpacity="0.25" strokeWidth="1" />
        <ellipse cx="150" cy="65" rx="100" ry="40" stroke="#E7A6B4" strokeOpacity="0.2" strokeWidth="1" />
        <ellipse cx="150" cy="65" rx="60" ry="25" stroke="#E7A6B4" strokeOpacity="0.15" strokeWidth="1" />

        {/* the dashed route connecting each stop */}
        <path d={path} stroke="#C97A8C" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />

        {points.map((p) => (
          <g key={p.label}>
            {p.active && (
              <circle cx={p.x} cy={p.y} r="9" fill="#E7A6B4" fillOpacity="0.35">
                <animate attributeName="r" values="7;11;7" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.4;0.1;0.4" dur="2.2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={p.x} cy={p.y} r="4" fill={p.active ? "#C97A8C" : "#FFFFFF"} stroke="#C97A8C" strokeWidth="1.5" />
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight={p.active ? 600 : 500}
              fill={p.active ? "#C97A8C" : "#8A7F76"}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
