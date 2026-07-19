import { useState } from "react";
import { Eyebrow, Donut, Card } from "../components/UI";
import {
  loadMoment,
  saveMoment,
  loadWardrobe,
  saveWardrobe,
  type WardrobeItem,
  loadCareChecks,
  saveCareChecks,
  loadMoments,
  addMoment,
  type SavedMoment,
} from "../lib/persistence";
import {
  QrCode,
  Check,
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  Shirt,
  Recycle,
  Wrench,
  Repeat,
} from "lucide-react";

/* 1 — SKELETON LOADER */
export function SkeletonLoader() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 gap-6">
      <Eyebrow>Digital Product Passport</Eyebrow>
      <div className="w-full space-y-3">
        <div className="h-3 w-2/3 mx-auto rounded-full shimmer" />
        <div className="h-3 w-1/2 mx-auto rounded-full shimmer" />
      </div>
      <p className="font-sans text-xs text-clay tracking-wide">Verifying passport…</p>
      <p className="absolute bottom-10 font-display italic text-sm text-clay/60">wornwith.care</p>
    </div>
  );
}

/* 2 — CAMERA SCAN */
export function CameraScan() {
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleScan = () => {
    if (scanned) return;
    setFlash(true);
    setTimeout(() => {
      setScanned(true);
      setFlash(false);
    }, 350);
  };

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-8 bg-ink/95">
      <div />
      <div
        onClick={handleScan}
        className="relative w-[220px] h-[280px] border-2 border-white/30 rounded-2xl flex items-center justify-center cursor-pointer"
      >
        {flash && <div className="absolute inset-0 bg-white scan-flash rounded-2xl" />}
        <div className="bg-cream rounded-lg w-[150px] h-[190px] flex flex-col items-center justify-between py-6 shadow-xl">
          <p className="font-sans text-[10px] tracking-widest text-clay">COS</p>
          <QrCode size={44} className="text-ink" strokeWidth={1.2} />
          <p className="font-display italic text-xs text-blush-deep">Scan me ›</p>
        </div>
        {/* corner brackets */}
        {["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map((pos, i) => (
          <div key={i} className={`absolute w-6 h-6 border-white ${pos}`} />
        ))}
      </div>
      <div className="h-16 flex items-center">
        {scanned ? (
          <p className="flex items-center gap-1.5 text-sm text-white font-sans fade-up">
            <Check size={16} className="text-blush" /> Scan successful
          </p>
        ) : (
          <p className="text-white/50 text-xs font-sans">Tap the tag to scan</p>
        )}
      </div>
    </div>
  );
}

/* 3 — WELCOME */
export function Welcome() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 gap-8 text-center fade-up">
      <Eyebrow>Digital Product Passport</Eyebrow>
      <div>
        <p className="font-sans text-sm text-clay">Welcome to</p>
        <h1 className="font-display italic text-4xl text-ink mt-1">wornwith.care</h1>
      </div>
      <div className="w-24 h-28 rounded-xl bg-blush-pale flex items-center justify-center">
        <Shirt size={40} className="text-blush-deep" strokeWidth={1} />
      </div>
      <p className="font-sans text-[11px] text-clay tracking-wide">
        COS-8821 &nbsp;✦&nbsp; RWS &nbsp;·&nbsp; DPP-ID: 4f2a
      </p>
      <Card className="w-full text-left">
        <p className="text-[10px] font-sans font-semibold text-sage uppercase tracking-wide mb-1">
          Verified Passport
        </p>
        <p className="flex items-center gap-1.5 font-sans text-sm text-ink font-medium">
          Verified Passport <Check size={14} className="text-sage" />
        </p>
        <p className="text-[11px] text-clay mt-1">April 2026 · ID: #DPP-204839</p>
        <p className="text-[11px] text-clay">Stored on secure digital ledger</p>
        <div className="mt-3 pt-3 border-t border-line flex items-center gap-1.5">
          <span className="text-[10px]">🇪🇺</span>
          <span className="text-[10px] font-sans text-clay">EU Regulated · ESPR 2027</span>
        </div>
      </Card>
    </div>
  );
}

/* 4 — PRODUCT OVERVIEW */
export function ProductOverview() {
  const rows = [
    ["Material", "70% Recycled Wool"],
    ["Made in", "Italy & Portugal"],
    ["Certified", "RWS · GOTS"],
    ["Lifespan", "8–10 years"],
  ];
  return (
    <div className="h-full px-5 py-4 fade-up">
      <div className="flex items-center gap-1.5 text-clay text-xs font-sans mb-4">
        <ChevronLeft size={14} /> <span>COS Wool Jacket</span>
        <span className="ml-auto flex items-center gap-1 text-sage text-[10px]">
          <Check size={12} /> DPP Verified
        </span>
      </div>
      <div className="w-full h-40 rounded-card bg-blush-pale overflow-hidden mb-4">
        <img
          src="/images/cos-wool-jacket.png"
          alt="COS Black Wool Funnel-Neck Coat"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <h2 className="font-display italic text-2xl text-ink leading-tight">
        COS Black Wool
        <br />Funnel-Neck Coat
      </h2>
      <p className="font-sans text-[11px] text-clay mt-1 mb-4">
        Sustainable materials, timeless style
      </p>
      <div className="divide-y divide-line border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 font-sans text-[12px]">
            <span className="text-clay">{k}</span>
            <span className="text-ink font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Eyebrow>Your Garment</Eyebrow>
        <div className="mt-2 space-y-1.5 font-sans text-[12px]">
          <div className="flex justify-between"><span className="text-clay">Owned since</span><span className="text-ink">April 2026</span></div>
          <div className="flex justify-between"><span className="text-clay">Times worn</span><span className="text-ink">~18</span></div>
          <div className="flex justify-between"><span className="text-clay">Condition</span><span className="text-sage font-medium">Excellent</span></div>
        </div>
      </div>
    </div>
  );
}

/* 5 — PRODUCT LIFECYCLE */
export function ProductLifecycle() {
  const stops = [
    { icon: "🐑", title: "Wool Farming", place: "Canterbury Plains", flag: "🇳🇿" },
    { icon: "🧵", title: "Spinning & Weaving", place: "Biella, Italy", flag: "🇮🇹" },
    { icon: "✂️", title: "Cutting & Construction", place: "Porto, Portugal", flag: "🇵🇹" },
    { icon: "🧍", title: "With you now", place: "Paris, France", flag: "🇫🇷", active: true },
  ];
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>Product Lifecycle</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1">Where did it come from?</h2>
      <p className="font-sans text-[11px] text-clay mt-1 mb-2">18,400km from farm to your hands</p>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {["🇳🇿 NZ", "🇮🇹 Italy", "🇵🇹 Portugal", "🇫🇷 France"].map((t) => (
          <span key={t} className="text-[10px] font-sans bg-blush-pale text-blush-deep px-2 py-1 rounded-full">
            {t}
          </span>
        ))}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-line" />
        <div className="space-y-5">
          {stops.map((s) => (
            <div key={s.title} className="relative flex items-center gap-3">
              <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 ${s.active ? "bg-blush border-blush" : "bg-paper border-line"}`} />
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className={`font-sans text-[13px] font-medium ${s.active ? "text-blush-deep" : "text-ink"}`}>{s.title}</p>
                <p className="text-[11px] text-clay font-sans">{s.flag} {s.place}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 6 — SUPPLY CHAIN */
export function SupplyChain() {
  const chain = [
    { icon: "🐑", label: "Wool Farm", place: "NZ", code: "NZ-F4821" },
    { icon: "🏭", label: "Milling", place: "Italy", code: "IT-F9043" },
    { icon: "🚢", label: "Ship", place: "Portugal", code: "PT-F2217" },
    { icon: "🏬", label: "Retail", place: "Paris", code: "FR-F6631" },
  ];
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>Supply Chain</Eyebrow>
      <div className="grid grid-cols-4 gap-1.5 mt-4 mb-4">
        {chain.map((c) => (
          <div key={c.label} className="text-center">
            <div className="w-11 h-11 mx-auto rounded-full bg-blush-pale flex items-center justify-center text-lg">
              {c.icon}
            </div>
            <p className="text-[9px] font-sans font-semibold text-ink mt-1">{c.label}</p>
            <p className="text-[8px] font-sans text-clay">{c.place}</p>
            <p className="text-[7px] font-sans text-clay/60">{c.code}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[["4", "Countries"], ["18,400km", "traveled"], ["100%", "Verified"]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2 text-center">
            <p className="font-display italic text-base text-blush-deep">{v}</p>
            <p className="text-[8px] font-sans text-clay uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>
      <Card>
        <Eyebrow>Ethical Audit</Eyebrow>
        <div className="mt-2 space-y-1.5 font-sans text-[12px]">
          <div className="flex justify-between"><span className="text-clay">Fair wages</span><span className="text-sage flex items-center gap-1">✦ Passed</span></div>
          <div className="flex justify-between"><span className="text-clay">Health & safety</span><span className="text-sage flex items-center gap-1">✦ Grade A</span></div>
          <div className="flex justify-between"><span className="text-clay">No forced labour</span><span className="text-sage flex items-center gap-1">✦ Verified</span></div>
        </div>
        <p className="text-[9px] text-clay/70 font-sans mt-2 pt-2 border-t border-line">
          Audited by Bureau Veritas · Cert #BV-2025-09871
        </p>
      </Card>
    </div>
  );
}

/* 7 — CARE TO EXTEND LIFE */
export function CareGuide() {
  const wears = [
    ["5 wears", "High", "text-blush-deep"],
    ["30 wears", "Opt.", "text-blush"],
    ["100 wears", "Low", "text-sage"],
  ];
  const care = [
    ["Cold water only", "30°C max"],
    ["Lay flat to dry", "Never hang wet"],
    ["Steam, don't iron", "Let it breathe"],
    ["Fold, don't hang", "Away from sunlight"],
  ];
  const [checks, setChecks] = useState<boolean[]>(() => loadCareChecks());

  const toggle = (i: number) => {
    const updated = checks.map((c, idx) => (idx === i ? !c : c));
    setChecks(updated);
    saveCareChecks(updated);
  };

  return (
    <div className="h-full px-5 py-6 fade-up">
      <h2 className="font-display italic text-2xl text-ink leading-tight">
        Designed for years,<br />not seasons.
      </h2>
      <p className="text-[11px] text-clay font-sans mt-1 mb-4">Designed lifespan: 8–10 years</p>

      <Eyebrow>Impact per wear</Eyebrow>
      <div className="flex justify-between mt-2 mb-5">
        {wears.map(([label, tag, color]) => (
          <div key={label} className="text-center">
            <p className="font-sans text-[11px] text-ink">{label}</p>
            <p className={`font-sans text-[10px] font-semibold ${color}`}>{tag}</p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-line border-y border-line mb-4">
        {care.map(([t, s], i) => (
          <label key={t} className="flex items-center gap-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() => toggle(i)}
              className="accent-blush-deep w-4 h-4"
            />
            <div>
              <p className={`font-sans text-[12px] ${checks[i] ? "text-clay line-through" : "text-ink"}`}>{t}</p>
              <p className="font-sans text-[10px] text-clay">{s}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="border-l-2 border-blush pl-3">
        <Eyebrow>Trade-off honesty</Eyebrow>
        <p className="font-display italic text-[13px] text-ink mt-1">
          "Blended fibres can make recycling more complex at end-of-life."
        </p>
      </div>
    </div>
  );
}

/* 8 — SUSTAINABILITY METRICS */
export function SustainabilityMetrics() {
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>Sustainability</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1 mb-4">Impact Metrics</h2>
      <div className="flex justify-around mb-5">
        <Donut percent={30} label="CO₂" sublabel="vs 12.1kg avg" color="#C97A8C" />
        <Donut percent={80} label="H₂O" sublabel="recycled water" color="#8FA688" />
      </div>
      <div className="space-y-2 font-sans text-[12px] mb-4">
        {[["Recyclability", "92%"], ["Renewable energy", "78%"], ["Ethical sourcing", "100%"]].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center">
            <span className="text-clay">{k}</span>
            <span className="text-ink font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["7.9kg", "CO₂ saved"], ["2,400L", "water saved"], ["Top 10%", "of brands"]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2.5 text-center">
            <p className="font-display italic text-sm text-blush-deep">{v}</p>
            <p className="text-[8px] font-sans text-clay uppercase tracking-wide mt-0.5">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 9 — WHAT'S NEXT */
export function WhatsNext() {
  const options = [
    {
      icon: Repeat,
      title: "Resell",
      sub: "Vestiaire Collective",
      color: "#C97A8C",
      href: "https://www.vestiairecollective.com",
    },
    {
      icon: ShoppingBag,
      title: "Thrift",
      sub: "Donate locally",
      color: "#8FA688",
      href: "https://www.google.com/maps/search/thrift+store+donation+near+me",
    },
    {
      icon: Wrench,
      title: "Repair",
      sub: "Find a tailor nearby",
      color: "#8A7F76",
      href: "https://www.google.com/maps/search/tailor+clothing+repair+near+me",
    },
    {
      icon: Recycle,
      title: "Recycle",
      sub: "Return to COS",
      color: "#C97A8C",
      href: "https://www.cos.com",
    },
  ];
  return (
    <div className="h-full px-5 py-6 fade-up">
      <h2 className="font-display italic text-2xl text-ink leading-tight">
        Ready to pass<br />it on?
      </h2>
      <p className="font-sans text-[11px] text-clay mt-1 mb-5">Choose what happens next</p>
      <div className="space-y-2.5">
        {options.map((o) => (
          <a
            key={o.title}
            href={o.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 border border-line rounded-card px-4 py-3 text-left hover:border-blush transition-colors"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blush-pale">
              <o.icon size={16} style={{ color: o.color }} />
            </div>
            <div className="flex-1">
              <p className="font-sans text-[13px] font-medium text-ink">{o.title}</p>
              <p className="font-sans text-[11px] text-clay">{o.sub}</p>
            </div>
            <ChevronLeft size={14} className="rotate-180 text-clay" />
          </a>
        ))}
      </div>
      <p className="font-sans text-[10px] text-clay/60 mt-4 text-center">
        Thrift and Repair open a nearby-places search — your browser may ask
        for location access.
      </p>
    </div>
  );
}

/* 10 — THE STORY BEHIND IT */
export function StoryBehindIt() {
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 text-[11px] font-sans text-sage font-medium">
            <Check size={12} /> Verified passport
          </span>
          <span className="text-[10px] font-sans text-clay">5 Apr 2026 · blockchain</span>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} className="text-blush-deep" />
          <p className="text-[10px] font-sans font-semibold text-blush-deep uppercase tracking-wide">
            The story behind it
          </p>
        </div>
        <p className="font-display italic text-[15px] text-ink leading-relaxed">
          Your coat began on sheep farms in New Zealand, before moving through
          European mills and into skilled hands in Portugal — designed to be
          worn, repaired, and passed on.
        </p>
        <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
          Crafted from 70% recycled merino — it carries a lower footprint than
          90% of comparable wool coats.
        </p>
        <p className="font-display italic text-[13px] text-blush-deep mt-3">
          Crafted to last. Designed to return.
        </p>
      </Card>
    </div>
  );
}

/* 11 — PERSONALIZATION */
export function Personalization() {
  const [text, setText] = useState(() => loadMoment() || "dinner, autumn, somewhere with candlelight");
  const [moments, setMoments] = useState<SavedMoment[]>(() => loadMoments());

  const handleSave = () => {
    if (!text.trim()) return;
    saveMoment(text);
    setMoments(addMoment(text));
  };

  return (
    <div className="h-full px-5 py-6 fade-up flex flex-col">
      <Eyebrow>Make it yours</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1 mb-4 leading-snug">
        When do you think you'll wear this?
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="dinner, autumn, somewhere with candlelight"
        className="w-full border border-line rounded-xl px-3 py-2.5 font-display italic text-[14px] text-ink resize-none focus:outline-none focus:border-blush"
      />
      <button
        onClick={handleSave}
        className="mt-3 w-full bg-ink text-cream font-sans text-[12px] tracking-wide py-2.5 rounded-full transition-colors"
      >
        Save this moment
      </button>

      {moments.length > 0 && (
        <Card className="mt-4">
          <Eyebrow>Saved moments</Eyebrow>
          <div className="mt-2 space-y-2 max-h-24 overflow-y-auto no-scrollbar">
            {[...moments].reverse().map((m, i) => (
              <div key={i} className="border-b border-line last:border-0 pb-2 last:pb-0">
                <p className="font-display italic text-[13px] text-ink">{m.text}</p>
                <p className="font-sans text-[9px] text-clay/60 mt-0.5">
                  {new Date(m.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Eyebrow>Your Garment</Eyebrow>
        <div className="mt-2 space-y-1.5 font-sans text-[12px]">
          <div className="flex justify-between"><span className="text-clay">Owned since</span><span className="text-ink">April 2026</span></div>
          <div className="flex justify-between"><span className="text-clay">Times worn</span><span className="text-ink">~18</span></div>
          <div className="flex justify-between"><span className="text-clay">Condition</span><span className="text-sage">Excellent</span></div>
          <div className="flex justify-between"><span className="text-clay">Est. lifespan</span><span className="text-ink">6+ years ✦</span></div>
        </div>
      </div>
      <p className="font-display italic text-[12px] text-clay text-center mt-auto pt-6">
        Once you wear the outfits, the outfits should not wear you.
      </p>
    </div>
  );
}

/* 12 — MY WARDROBE */
export function MyWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>(() => loadWardrobe());
  const [logging, setLogging] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const submitMemory = () => {
    if (!name.trim()) return;
    const updated = [...items, { name: name.trim(), tag: null, worn: "1×", note: note.trim() || "Just now" }];
    setItems(updated);
    saveWardrobe(updated);
    setName("");
    setNote("");
    setLogging(false);
  };

  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>My Wardrobe</Eyebrow>
      <h2 className="font-display italic text-xl text-ink mt-1 mb-3">
        {items.length} pieces · 3 brands · 2 resold
      </h2>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[[String(items.length), "items"], ["3", "brands"], ["2", "resold"]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2.5 text-center">
            <p className="font-display italic text-lg text-blush-deep">{v}</p>
            <p className="text-[9px] font-sans text-clay uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>
      <div className="divide-y divide-line border-y border-line">
        {items.map((it, i) => (
          <div key={i} className="py-3">
            <p className="font-sans text-[13px] font-medium text-ink flex items-center gap-1.5">
              {it.name}
              {it.tag && (
                <span className="text-[9px] text-sage border border-sage/40 rounded-full px-1.5 py-0.5">
                  {it.tag}
                </span>
              )}
            </p>
            <p className="font-sans text-[11px] text-clay mt-0.5">
              Worn {it.worn} · {it.note}
            </p>
          </div>
        ))}
      </div>

      {logging ? (
        <div className="mt-4 border border-line rounded-card px-4 py-3.5 space-y-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What is it? e.g. Wool Trench Coat"
            className="w-full border border-line rounded-lg px-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="The memory — e.g. First worn at Jessika's birthday"
            className="w-full border border-line rounded-lg px-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={submitMemory}
              className="flex-1 bg-ink text-cream font-sans text-[11px] tracking-wide py-2 rounded-full"
            >
              Save memory
            </button>
            <button
              onClick={() => { setLogging(false); setName(""); setNote(""); }}
              className="px-4 font-sans text-[11px] text-clay"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setLogging(true)}
          className="w-full mt-4 font-sans text-[12px] text-blush-deep border border-dashed border-blush rounded-full py-2.5"
        >
          + Log a memory
        </button>
      )}
    </div>
  );
}
