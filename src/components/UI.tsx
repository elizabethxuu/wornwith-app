import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";

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

const worldMapUrl = "/data/world-110m.json";
const highlightedCountries = ["New Zealand", "Italy", "Portugal", "France"];
const journeyStops = [
  { coords: [172.5, -43.5] as [number, number], label: "NZ" },
  { coords: [8.05, 45.57] as [number, number], label: "Italy" },
  { coords: [-8.61, 41.15] as [number, number], label: "Portugal" },
  { coords: [2.35, 48.86] as [number, number], label: "Paris", active: true },
];

export function JourneyMap() {
  return (
    <div className="w-full bg-paper border border-line rounded-card overflow-hidden mb-4">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 52 }}
        width={320}
        height={190}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <Geographies geography={worldMapUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isHighlighted = highlightedCountries.includes(geo.properties.name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHighlighted ? "#E7A6B4" : "#F1E9EA"}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {journeyStops.slice(0, -1).map((s, i) => (
          <Line
            key={i}
            from={s.coords}
            to={journeyStops[i + 1].coords}
            stroke="#C97A8C"
            strokeWidth={1.3}
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
        ))}

        {journeyStops.map((s) => (
          <Marker key={s.label} coordinates={s.coords}>
            {s.active && (
              <circle r={8} fill="#C97A8C" fillOpacity={0.25}>
                <animate attributeName="r" values="6;10;6" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.35;0.1;0.35" dur="2.2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              r={s.active ? 4 : 3}
              fill={s.active ? "#C97A8C" : "#FFFFFF"}
              stroke="#C97A8C"
              strokeWidth={1.3}
            />
            <text
              textAnchor="middle"
              y={-9}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: s.active ? 600 : 500,
                fontSize: s.active ? 12 : 10,
                fill: s.active ? "#C97A8C" : "#2B2622",
              }}
            >
              {s.label}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
