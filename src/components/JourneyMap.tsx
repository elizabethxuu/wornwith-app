import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { useLanguage } from "../lib/i18n";

const worldMapUrl = "/data/world-110m.json";
// Per-country watercolor wash, France (Paris) is the one deliberate
// burgundy focal point; NZ gets the turquoise primary; Italy reads
// slightly warmer; Portugal stays neutral, per the brief.
const COUNTRY_WASH: Record<string, { fill: string; opacity: number }> = {
  "New Zealand": { fill: "#2FC7D8", opacity: 0.22 },
  Italy: { fill: "#E3B98E", opacity: 0.28 },
  Portugal: { fill: "#D9D5CF", opacity: 0.4 },
  France: { fill: "#EBC9D2", opacity: 0.4 },
};
const STOP_ACCENTS = ["#2FC7D8", "#D19A63", "#8A7F76", "#A94C63"]; // NZ, Italy, Portugal, Paris
// dx/dy fan each label out in its own direction so the three closely-spaced
// European stops (Portugal, Italy, Paris) don't stack on top of each other.
// leader: true draws a short connecting line from the pin to the label.
const journeyStops = [
  {
    coords: [172.5, -43.5] as [number, number],
    labelKey: "place_nz" as const,
    dx: 0,
    dy: -17,
    icon: "",
    placeKey: "place_full_nz" as const,
    blurbKey: "stop_blurb_nz" as const,
  },
  {
    coords: [8.05, 45.57] as [number, number],
    labelKey: "place_italy" as const,
    dx: 40,
    dy: 4,
    leader: true,
    icon: "",
    placeKey: "place_full_italy" as const,
    blurbKey: "stop_blurb_italy" as const,
  },
  {
    coords: [-8.61, 41.15] as [number, number],
    labelKey: "place_portugal" as const,
    dx: -48,
    dy: 10,
    leader: true,
    icon: "",
    placeKey: "place_full_portugal" as const,
    blurbKey: "stop_blurb_portugal" as const,
  },
  {
    coords: [2.35, 48.86] as [number, number],
    labelKey: "place_paris" as const,
    dx: 4,
    dy: -30,
    active: true,
    leader: true,
    icon: "",
    placeKey: "place_full_paris" as const,
    blurbKey: "stop_blurb_paris" as const,
  },
];

export default function JourneyMap() {
  const { t } = useLanguage();
  // Defaults to the last stop (where the garment is now) since that's the
  // most relevant detail to show before anyone's tapped anything.
  const [selected, setSelected] = useState(journeyStops.length - 1);
  const [drawn, setDrawn] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [arrivalPulsePlayed, setArrivalPulsePlayed] = useState(false);

  useEffect(() => {
    const visibleTimer = setTimeout(() => setMapVisible(true), 60);
    const drawTimer = setTimeout(() => setDrawn(true), 350);
    // The arrival pulse plays once, after the route has finished drawing
    // in, not an infinite loop. journeyStops.length - 1 segments, drawn
    // sequentially (not overlapping), so this is timed to land right as
    // the line reaches Paris.
    const segments = journeyStops.length - 1;
    const pulseTimer = setTimeout(() => setArrivalPulsePlayed(true), 350 + segments * 700 + 900);
    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(drawTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const selectStop = (i: number) => {
    setSelected(i);
  };

  const stop = journeyStops[selected];

  return (
    <div className="w-full mb-4" onClick={(e) => e.stopPropagation()}>
      <div
        className="w-full border border-line/60 rounded-card overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 55% at 50% 32%, rgba(235,201,210,0.32) 0%, transparent 72%), " +
            "radial-gradient(ellipse 50% 45% at 86% 82%, rgba(47,199,216,0.20) 0%, transparent 72%), " +
            "linear-gradient(180deg, #FDFBF7 0%, #FAF7F1 100%)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          opacity: mapVisible ? 1 : 0,
          transform: mapVisible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.985)",
          transition: "opacity 700ms cubic-bezier(0.22,0.61,0.36,1), transform 700ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 500ms ease",
        }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 58 }}
          width={340}
          height={225}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <ZoomableGroup center={[0, 0]} zoom={1} minZoom={1} maxZoom={5}>
            <Geographies geography={worldMapUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const wash = COUNTRY_WASH[geo.properties.name];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={wash ? wash.fill : "#E5E2DC"}
                      fillOpacity={wash ? wash.opacity * 0.7 : 0.3}
                      stroke="#FAF7F1"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none", transition: "fill-opacity 1.2s ease" },
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
                stroke="#2FC7D8"
                strokeWidth={1.0}
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: "1px",
                  strokeDashoffset: drawn ? 0 : 1,
                  transition: `stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 0.7}s`,
                }}
              />
            ))}

            {journeyStops.map((s, i) => {
              const stopColor = STOP_ACCENTS[i];
              return (
                <Marker key={s.labelKey} coordinates={s.coords}>
                  {/* Invisible larger touch target, the visible dot below is
                      deliberately small/precise, but a ~4-6px dot is too small
                      to reliably tap on a phone, so this circle underneath
                      captures taps across a much wider radius. */}
                  <circle
                    r={13}
                    fill="rgba(0,0,0,0.001)"
                    onClick={() => selectStop(i)}
                    style={{ cursor: "pointer", pointerEvents: "all" }}
                  />
                  {/* Paris carries a soft blush watercolor halo at all times
                     , it's the one deliberate burgundy focal point on the
                      map, not just another stop. */}
                  {s.active && (
                    <circle r={13} fill="#EBC9D2" fillOpacity={0.35} style={{ pointerEvents: "none" }} />
                  )}
                  {s.active && arrivalPulsePlayed && (
                    <circle r={6} fill={stopColor} fillOpacity={0.3}>
                      <animate attributeName="r" values="6;11;6" dur="1.1s" begin="0s" repeatCount="1" fill="freeze" />
                      <animate attributeName="fill-opacity" values="0.32;0;0" dur="1.1s" begin="0s" repeatCount="1" fill="freeze" />
                    </circle>
                  )}
                  <circle
                    r={selected === i ? 7 : s.active ? 5 : 4}
                    fill={s.active || selected === i ? stopColor : "#FFFFFF"}
                    stroke={stopColor}
                    strokeWidth={1.3}
                    style={{ pointerEvents: "none" }}
                  />
                  {selected === i && (
                    <circle
                      r={9}
                      fill="none"
                      stroke={stopColor}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  {s.leader && (
                    <line
                      x1={0}
                      y1={0}
                      x2={s.dx}
                      y2={s.dy + 3}
                      stroke={stopColor}
                      strokeWidth={0.6}
                      strokeOpacity={0.5}
                    />
                  )}
                  <text
                    x={s.dx}
                    y={s.dy}
                    textAnchor="middle"
                    paintOrder="stroke"
                    stroke="#FAF7F2"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    onClick={() => selectStop(i)}
                    style={{
                      cursor: "pointer",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontWeight: s.active || selected === i ? 600 : 500,
                      fontSize: s.active || selected === i ? 15 : 13,
                      fill: s.active || selected === i ? stopColor : "#2E2E2E",
                    }}
                  >
                    {t(s.labelKey)}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* The card itself never fades or slides in, it's permanently
          visible from the moment the page renders. The only motion here
          is the slow drifting gradient (defined in index.css); tapping a
          different stop just swaps the text with a quick fade, not the
          card's opacity. */}
      <div
        className="story-card-gradient"
        style={{
          marginTop: "10px",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(228,224,215,0.4)",
        }}
      >
        <div className="fade-up" key={selected}>
          <div className="min-w-0">
            <p
              className="font-sans text-[9px] uppercase tracking-[0.14em] font-semibold"
              style={{ color: "#2F2A28" }}
            >
              {t(stop.placeKey)}
            </p>
            <p
              className="font-display italic text-[15px] leading-snug mt-1.5"
              style={{ color: "#3B3532" }}
            >
              {t(stop.blurbKey)}
            </p>
          </div>
          {stop.active && (
            <p
              className="font-display italic text-[12px] text-right mt-3"
              style={{ color: "#3B3532" }}
            >
              {t("every_place_note")}
            </p>
          )}
        </div>
      </div>

      <p className="font-sans text-[9px] text-clay text-center mt-2">
        {t("tap_pin_hint")}
      </p>
    </div>
  );
}
