import { useState, useEffect } from "react";
import { Eyebrow, Donut, Card, JourneyMap, Pill, Disclaimer, EmptyState } from "../components/UI";
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
  updateMomentSummary,
  type SavedMoment,
  logWardrobeEvent,
  compressImage,
} from "../lib/persistence";
import { GARMENT } from "../lib/garment";
import { useLanguage } from "../lib/i18n";
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
  ArrowRight,
  Search,
  CalendarDays,
  Camera,
  MapPinOff,
  Heart,
} from "lucide-react";

/* 1 — SKELETON LOADER */
export function SkeletonLoader() {
  const { t } = useLanguage();
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 gap-6">
      <Eyebrow>{t("dpp_eyebrow")}</Eyebrow>
      <div className="w-full space-y-3">
        <div className="h-3 w-2/3 mx-auto rounded-full shimmer" />
        <div className="h-3 w-1/2 mx-auto rounded-full shimmer" />
      </div>
      <p className="font-sans text-xs text-clay tracking-wide">{t("verifying")}</p>
      <p className="absolute bottom-10 font-display italic text-sm text-clay/60">wornwith.care</p>
    </div>
  );
}

/* 2 — CAMERA SCAN */
export function CameraScan() {
  const { t } = useLanguage();
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
          <p className="font-display italic text-xs text-blush-deep">{t("scan_me")}</p>
        </div>
        {/* corner brackets */}
        {["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map((pos, i) => (
          <div key={i} className={`absolute w-6 h-6 border-white ${pos}`} />
        ))}
      </div>
      <div className="h-16 flex items-center">
        {scanned ? (
          <p className="flex items-center gap-1.5 text-sm text-white font-sans fade-up">
            <Check size={16} className="text-blush" /> {t("scan_successful")}
          </p>
        ) : (
          <p className="text-white/50 text-xs font-sans">{t("tap_to_scan")}</p>
        )}
      </div>
    </div>
  );
}

/* 3 — WELCOME */
export function Welcome() {
  const { t, lang, setLang } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);
  const [showRws, setShowRws] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    // A real, shared counter across every visitor — not fake or per-browser.
    // Only increments once per browser session so refreshing the page (or
    // navigating back to this screen) doesn't inflate the count.
    const alreadyCounted = sessionStorage.getItem("wornwith:counted");
    const endpoint = alreadyCounted
      ? "https://api.countapi.xyz/get/wornwithcare-demo/passport-views"
      : "https://api.countapi.xyz/hit/wornwithcare-demo/passport-views";

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.value === "number") setViewCount(data.value);
        sessionStorage.setItem("wornwith:counted", "1");
      })
      .catch(() => {
        // Public API can be flaky/blocked (adblockers, offline demo, etc.)
        // — fail silently rather than show an error for something this minor.
      });
  }, []);

  return (
    <div className="h-full flex flex-col p-3 text-center fade-up">
      <div className="w-full h-full flex flex-col items-center justify-center gap-7 border border-ink/70 rounded-[32px] px-7 py-10 overflow-y-auto no-scrollbar">
        <div className="w-full flex flex-col items-center gap-7">
          <Eyebrow>{t("dpp_eyebrow")}</Eyebrow>
          <div>
            <p className="font-sans text-sm text-clay">{t("welcome_to")}</p>
            <h1 className="font-display italic text-4xl text-ink mt-1">wornwith.care</h1>
          </div>

          {!showInfo ? (
            <button
              onClick={() => setShowInfo(true)}
              className="font-sans text-[11px] text-blush-deep underline underline-offset-2 -mt-3"
            >
              {t("what_is_this")}
            </button>
          ) : (
            <div className="bg-blush-pale/50 rounded-xl px-4 py-3 -mt-3 fade-up">
              <p className="font-sans text-[11px] text-ink/80 leading-relaxed text-left">
                {t("dpp_explainer")}
              </p>
            </div>
          )}

          <div className="w-24 h-28 rounded-xl bg-blush-pale flex items-center justify-center">
            <Heart size={40} className="text-blush-deep" strokeWidth={1} fill="#C97A8C" />
          </div>
          <p className="font-sans text-[11px] text-clay tracking-wide">
            {GARMENT.brandSku} &nbsp;✦&nbsp;{" "}
            <button onClick={() => setShowRws(!showRws)} className="underline underline-offset-2">
              RWS
            </button>
            {" "}&nbsp;·&nbsp; DPP-ID: {GARMENT.dppId}
          </p>
          {showRws && (
            <div className="bg-blush-pale/50 rounded-xl px-4 py-3 -mt-3 fade-up">
              <p className="font-sans text-[11px] text-ink/80 leading-relaxed text-left">
                {t("rws_explainer")}
              </p>
            </div>
          )}
        </div>
        <Card className="w-full text-left">
          <p className="text-[10px] font-sans font-semibold text-sage uppercase tracking-wide mb-1">
            {t("verified_passport")}
          </p>
          <p className="flex items-center gap-1.5 font-sans text-sm text-ink font-medium">
            {t("verified_passport")} <Check size={14} className="text-sage" />
          </p>
          <p className="text-[11px] text-clay mt-1">{t("verified_date_value")} · ID: {GARMENT.fullDppId}</p>
          <p className="text-[11px] text-clay">{t("stored_ledger")}</p>
          <div className="mt-3 pt-3 border-t border-line flex items-center gap-1.5">
            <span className="text-[10px]">🇪🇺</span>
            <span className="text-[10px] font-sans text-clay">{t("eu_regulated")}</span>
          </div>
          {viewCount !== null && (
            <div className="mt-3 pt-3 border-t border-line">
              <p className="text-[10px] font-sans text-clay">
                {t("viewed_times")} <span className="text-ink font-medium">{viewCount.toLocaleString()}</span> {t("times_suffix")}
              </p>
            </div>
          )}
        </Card>

        {/* Language switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang("en")}
            className={`font-sans text-[11px] flex items-center gap-1 px-2 py-1 rounded-full transition-opacity ${lang === "en" ? "opacity-100 bg-blush-pale/60" : "opacity-50"}`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => setLang("fr")}
            className={`font-sans text-[11px] flex items-center gap-1 px-2 py-1 rounded-full transition-opacity ${lang === "fr" ? "opacity-100 bg-blush-pale/60" : "opacity-50"}`}
          >
            🇫🇷 FR
          </button>
          <button
            onClick={() => setLang("pt")}
            className={`font-sans text-[11px] flex items-center gap-1 px-2 py-1 rounded-full transition-opacity ${lang === "pt" ? "opacity-100 bg-blush-pale/60" : "opacity-50"}`}
          >
            🇵🇹 PT
          </button>
        </div>

        <p className="font-sans text-[9px] text-clay/60">
          {t("demo_disclaimer")}
        </p>
      </div>
    </div>
  );
}


/* 4 — PRODUCT OVERVIEW */
export function ProductOverview() {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const rows = [
    [t("material"), t("material_value")],
    [t("made_in"), t("made_in_value")],
    [t("certified"), GARMENT.certified],
    [t("lifespan"), t("lifespan_value")],
    [t("repairability"), "8.5 / 10"],
  ];
  return (
    <div className="h-full px-5 py-4 fade-up">
      <div className="flex items-center gap-1.5 text-clay text-xs font-sans mb-4">
        <ChevronLeft size={14} /> <span>{GARMENT.brand} {t("wool_jacket")}</span>
        <span className="ml-auto flex items-center gap-1 text-sage text-[10px]">
          <Check size={12} /> {t("dpp_verified")}
        </span>
      </div>
      <div className="w-full h-64 rounded-card bg-blush-pale overflow-hidden mb-4 flex items-center justify-center">
        {imgError ? (
          <div className="text-center px-6">
            <Shirt size={40} className="text-blush-deep mx-auto mb-2" strokeWidth={1} />
            <p className="font-sans text-[10px] text-clay">{t("photo_unavailable")}</p>
          </div>
        ) : (
          <img
            src={GARMENT.image}
            alt={GARMENT.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain object-center"
          />
        )}
      </div>
      <h2 className="font-display italic text-2xl text-ink leading-tight">
        COS Black Wool
        <br />Funnel-Neck Coat
      </h2>
      <p className="font-sans text-[11px] text-clay mt-1 mb-4">
        {t("tagline_coat")}
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
        <Eyebrow>{t("your_garment")}</Eyebrow>
        <div className="mt-2 space-y-1.5 font-sans text-[12px]">
          <div className="flex justify-between"><span className="text-clay">{t("owned_since")}</span><span className="text-ink">{t("owned_since_date")}</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("times_worn")}</span><span className="text-ink">{GARMENT.timesWorn}</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("condition")}</span><span className="text-sage font-medium">{t("excellent")}</span></div>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
}

/* 5 — PRODUCT LIFECYCLE */
export function ProductLifecycle() {
  const { t } = useLanguage();
  const stops = [
    { icon: "🐑", title: t("wool_farming"), place: t("place_full_nz_short"), flag: "🇳🇿" },
    { icon: "🧵", title: t("spinning_weaving"), place: t("place_full_italy"), flag: "🇮🇹" },
    { icon: "✂️", title: t("cutting_construction"), place: t("place_full_portugal"), flag: "🇵🇹" },
    { icon: "🧍", title: t("with_you_now"), place: t("place_full_paris"), flag: "🇫🇷", active: true },
  ];
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("lifecycle_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1">{t("where_from")}</h2>
      <p className="font-sans text-[11px] text-clay mt-1 mb-2">{t("km_traveled")}</p>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {["🇳🇿 NZ", "🇮🇹 Italy", "🇵🇹 Portugal", "🇫🇷 France"].map((bubble, i) => (
          <span
            key={bubble}
            style={{ animationDelay: `${i * 120}ms` }}
            className="pop-in text-[10px] font-sans bg-blush-pale text-blush-deep px-2 py-1 rounded-full"
          >
            {bubble}
          </span>
        ))}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-line" />
        <div className="space-y-5">
          {stops.map((s, i) => (
            <div
              key={s.title}
              style={{ animationDelay: `${480 + i * 150}ms` }}
              className="pop-in relative flex items-center gap-3"
            >
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
      <Disclaimer />
    </div>
  );
}

/* 6 — SUPPLY CHAIN */
export function SupplyChain() {
  const { t } = useLanguage();
  const chain = [
    { icon: "🐑", label: t("wool_farm"), place: "NZ", code: "NZ-F4821" },
    { icon: "🏭", label: t("milling"), place: "Italy", code: "IT-F9043" },
    { icon: "🚢", label: t("ship"), place: "Portugal", code: "PT-F2217" },
    { icon: "🏬", label: t("retail"), place: "Paris", code: "FR-F6631" },
  ];
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("supply_chain")}</Eyebrow>
      <div className="flex items-center justify-between mt-4 mb-4">
        {chain.map((c, i) => (
          <div key={c.label} className="flex items-center">
            <div
              style={{ animationDelay: `${i * 150}ms` }}
              className="pop-in text-center w-14"
            >
              <div className="w-11 h-11 mx-auto rounded-full bg-blush-pale flex items-center justify-center text-lg">
                {c.icon}
              </div>
              <p className="text-[9px] font-sans font-semibold text-ink mt-1">{c.label}</p>
              <p className="text-[8px] font-sans text-clay">{c.place}</p>
              <p className="text-[7px] font-sans text-clay/60">{c.code}</p>
            </div>
            {i < chain.length - 1 && (
              <ArrowRight
                size={13}
                strokeWidth={1.5}
                style={{ animationDelay: `${i * 150 + 75}ms` }}
                className="pop-in text-blush shrink-0 -mt-4"
              />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[["4", t("countries")], ["18,400km", t("traveled")], ["100%", t("verified")]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2 text-center">
            <p className="font-display italic text-base text-blush-deep">{v}</p>
            <p className="text-[8px] font-sans text-clay uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>
      <Card>
        <Eyebrow>{t("ethical_audit")}</Eyebrow>
        <div className="mt-2 grid grid-cols-[1fr,auto] gap-y-1.5 gap-x-4 font-sans text-[12px] items-center">
          <span className="text-clay">{t("fair_wages")}</span>
          <span className="text-sage flex items-center gap-1 justify-self-start">✦ {t("passed")}</span>
          <span className="text-clay">{t("health_safety")}</span>
          <span className="text-sage flex items-center gap-1 justify-self-start">✦ {t("grade_a")}</span>
          <span className="text-clay">{t("no_forced_labour")}</span>
          <span className="text-sage flex items-center gap-1 justify-self-start">✦ {t("verified")}</span>
        </div>
        <p className="text-[9px] text-clay/70 font-sans mt-2 pt-2 border-t border-line">
          {t("audited_by")}
        </p>
      </Card>

      <Card className="mt-3">
        <div className="grid grid-cols-[1fr,auto] gap-y-2 gap-x-4 font-sans text-[12px] items-start">
          <span className="text-clay">{t("chemical_compliance")}</span>
          <span className="text-sage text-right text-[11px]">✦ {t("reach_compliant")}</span>
          <span className="text-clay">{t("economic_operator")}</span>
          <span className="text-ink text-right text-[11px] font-medium">{t("economic_operator_value")}</span>
        </div>
        <p className="text-[9px] text-clay/60 font-sans mt-2 pt-2 border-t border-line leading-relaxed">
          {t("economic_operator_note")}
        </p>
      </Card>
      <Disclaimer />
    </div>
  );
}

/* 7 — CARE TO EXTEND LIFE */
export function CareGuide() {
  const { t } = useLanguage();
  const wears = [
    [t("wears_5"), t("impact_high"), "text-blush-deep"],
    [t("wears_30"), t("impact_opt"), "text-blush"],
    [t("wears_100"), t("impact_low"), "text-sage"],
  ];
  const care = [
    [t("cold_water"), t("max_30")],
    [t("lay_flat"), t("never_hang_wet")],
    [t("steam_dont_iron"), t("let_breathe")],
    [t("fold_dont_hang"), t("away_sunlight")],
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
        {t("designed_years")}
      </h2>
      <p className="text-[11px] text-clay font-sans mt-1 mb-4">{t("designed_lifespan")}</p>

      <Eyebrow>{t("impact_per_wear")}</Eyebrow>
      <div className="flex justify-between mt-2 mb-5">
        {wears.map(([label, tag, color]) => (
          <div key={label} className="text-center">
            <p className="font-sans text-[11px] text-ink">{label}</p>
            <p className={`font-sans text-[10px] font-semibold ${color}`}>{tag}</p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-line border-y border-line mb-4">
        {care.map(([label, sub], i) => (
          <label key={label} className="flex items-center gap-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() => toggle(i)}
              className="accent-blush-deep w-4 h-4"
            />
            <div>
              <p className={`font-sans text-[12px] ${checks[i] ? "text-clay line-through" : "text-ink"}`}>{label}</p>
              <p className="font-sans text-[10px] text-clay">{sub}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="border-l-2 border-blush pl-3">
        <Eyebrow>{t("tradeoff_honesty")}</Eyebrow>
        <p className="font-display italic text-[13px] text-ink mt-1">
          "{t("tradeoff_quote")}"
        </p>
      </div>
      <Disclaimer />
    </div>
  );
}

/* 8 — SUSTAINABILITY METRICS */
export function SustainabilityMetrics() {
  const { t } = useLanguage();
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("sustainability")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1 mb-4">{t("impact_metrics")}</h2>
      <div className="flex justify-around mb-5">
        <Donut percent={30} label="CO₂" sublabel={t("vs_avg")} color="#C97A8C" />
        <Donut percent={80} label="H₂O" sublabel={t("recycled_water")} color="#8FA688" />
      </div>
      <div className="space-y-3 mb-4">
        <Pill label={t("recyclability")} percent={92} color="#C97A8C" />
        <Pill label={t("renewable_energy")} percent={78} color="#8FA688" />
        <Pill label={t("ethical_sourcing")} percent={100} color="#C9A46A" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["7.9kg", t("co2_saved")], ["2,400L", t("water_saved")], ["Top 10%", t("top_10")]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2.5 text-center">
            <p className="font-display italic text-sm text-blush-deep">{v}</p>
            <p className="text-[8px] font-sans text-clay uppercase tracking-wide mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <Disclaimer />
    </div>
  );
}

/* 9 — WHAT'S NEXT */
export function WhatsNext() {
  const { t } = useLanguage();
  const [locationQuery, setLocationQuery] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState("");

  const options = [
    {
      icon: Repeat,
      title: t("resell"),
      sub: "Vestiaire Collective",
      color: "#C97A8C",
      href: "https://www.vestiairecollective.com",
    },
    {
      icon: ShoppingBag,
      title: t("thrift"),
      sub: t("donate_locally"),
      color: "#8FA688",
      searchTerm: "thrift store donation near me",
    },
    {
      icon: Wrench,
      title: t("repair"),
      sub: t("find_tailor"),
      color: "#8A7F76",
      searchTerm: "tailor clothing repair near me",
    },
    {
      icon: Recycle,
      title: t("recycle"),
      sub: t("return_to_cos"),
      color: "#C97A8C",
      href: "https://www.cos.com",
    },
  ];

  const handleLocationAction = (searchTerm: string) => {
    if (!navigator.geolocation) {
      setLocationQuery(searchTerm);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.open(
          `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}/@${pos.coords.latitude},${pos.coords.longitude},14z`,
          "_blank"
        );
      },
      () => setLocationQuery(searchTerm),
      { timeout: 6000 }
    );
  };

  const submitManualLocation = () => {
    if (!locationQuery || !manualLocation.trim()) return;
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(`${locationQuery} near ${manualLocation}`)}`,
      "_blank"
    );
    setLocationQuery(null);
    setManualLocation("");
  };

  if (locationQuery) {
    return (
      <EmptyState
        icon={MapPinOff}
        eyebrow={t("location_error_eyebrow")}
        title={t("location_error_title")}
        subtitle={t("location_error_subtitle")}
      >
        <div className="flex items-center gap-2 mt-5 w-full max-w-[260px]">
          <input
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitManualLocation()}
            placeholder={t("city_postcode")}
            className="flex-1 border border-line rounded-full px-4 py-2.5 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={submitManualLocation}
            className="bg-ink text-cream font-sans text-[12px] font-semibold px-5 py-2.5 rounded-full"
          >
            {t("search_button")}
          </button>
          <button
            onClick={() => { setLocationQuery(null); setManualLocation(""); }}
            className="font-sans text-[12px] text-clay px-2 py-2.5"
          >
            {t("back_button")}
          </button>
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="h-full px-5 py-6 fade-up">
      <h2 className="font-display italic text-2xl text-ink leading-tight">
        {t("ready_pass_on")}
      </h2>
      <p className="font-sans text-[11px] text-clay mt-1 mb-5">{t("choose_next")}</p>
      <div className="space-y-2.5">
        {options.map((o) =>
          o.searchTerm ? (
            <button
              key={o.title}
              onClick={() => handleLocationAction(o.searchTerm)}
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
            </button>
          ) : (
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
          )
        )}
      </div>
      <p className="font-sans text-[10px] text-clay/60 mt-4 text-center">
        {t("location_note")}
      </p>

      <Card className="mt-4">
        <Eyebrow>{t("why_brands_participate")}</Eyebrow>
        <p className="font-sans text-[11px] text-clay leading-relaxed mt-2">
          {t("brand_incentive_note")}
        </p>
      </Card>
      <Disclaimer />
    </div>
  );
}

/* 10 — THE STORY BEHIND IT */
export function StoryBehindIt() {
  const { t } = useLanguage();
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied">("idle");
  const [savedToWardrobe, setSavedToWardrobe] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: GARMENT.name,
      text: `The story behind my ${GARMENT.name} — verified on wornwith.care`,
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareState("copied");
      }
    } catch {
      // user cancelled the native share sheet — not an error, do nothing
    }
    setTimeout(() => setShareState("idle"), 2000);
  };

  const handleSaveToWardrobe = () => {
    const items = loadWardrobe();
    const alreadySaved = items.some((it) => it.name === GARMENT.name);
    if (!alreadySaved) {
      const newItem = { name: GARMENT.name, tag: "DPP", worn: GARMENT.timesWorn, note: "Saved from passport", brand: GARMENT.brand };
      const updated = [...items, newItem];
      saveWardrobe(updated);
      logWardrobeEvent(newItem);
    }
    setSavedToWardrobe(true);
  };

  return (
    <div className="h-full px-5 py-6 fade-up">
      <JourneyMap />
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 text-[11px] font-sans text-sage font-medium">
            <Check size={12} /> {t("verified_passport")}
          </span>
          <span className="text-[10px] font-sans text-clay">{t("story_date_value")} · {t("blockchain_word")}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} className="text-blush-deep" />
          <p className="text-[10px] font-sans font-semibold text-blush-deep uppercase tracking-wide">
            {t("story_behind_it")}
          </p>
        </div>
        <p className="font-display italic text-[15px] text-ink leading-relaxed">
          {t("story_p1")}
        </p>
        <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
          {t("story_p2")}
        </p>
        <p className="font-display italic text-[13px] text-blush-deep mt-3">
          {t("crafted_to_last")}
        </p>
      </Card>

      <div className="flex gap-2.5 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 border border-line rounded-full py-2.5 font-sans text-[12px] text-ink"
        >
          {shareState === "shared" ? t("shared") : shareState === "copied" ? t("link_copied") : t("share_passport")}
        </button>
        <button
          onClick={handleSaveToWardrobe}
          disabled={savedToWardrobe}
          className="flex-1 bg-ink text-cream rounded-full py-2.5 font-sans text-[12px] disabled:opacity-60"
        >
          {savedToWardrobe ? t("saved") : t("save_to_wardrobe")}
        </button>
      </div>
      <Disclaimer />
    </div>
  );
}

/* 11 — PERSONALIZATION */
export function Personalization() {
  const { t } = useLanguage();
  const [text, setText] = useState(() => loadMoment());
  const [moments, setMoments] = useState<SavedMoment[]>(() => loadMoments());
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const generateReflection = (savedAt: string, momentText: string) => {
    setGenerating((g) => ({ ...g, [savedAt]: true }));
    setFailed((f) => ({ ...f, [savedAt]: false }));
    fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: momentText }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) {
          setMoments(updateMomentSummary(savedAt, data.summary));
        } else {
          setFailed((f) => ({ ...f, [savedAt]: true }));
        }
      })
      .catch(() => setFailed((f) => ({ ...f, [savedAt]: true })))
      .finally(() => setGenerating((g) => ({ ...g, [savedAt]: false })));
  };

  const handleSave = () => {
    if (!text.trim()) return;
    saveMoment(text);
    const updated = addMoment(text);
    setMoments(updated);
    const newMoment = updated[updated.length - 1];
    generateReflection(newMoment.savedAt, newMoment.text);
    setText("");
    saveMoment("");
  };

  return (
    <div className="h-full px-5 py-6 fade-up flex flex-col">
      <Eyebrow>{t("make_it_yours")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1 mb-4 leading-snug">
        {t("when_wear")}
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={t("moment_placeholder")}
        className="w-full border border-line rounded-xl px-3 py-2.5 font-display italic text-[14px] text-ink resize-none focus:outline-none focus:border-blush"
      />
      <button
        onClick={handleSave}
        className="mt-3 w-full bg-ink text-cream font-sans text-[12px] tracking-wide py-2.5 rounded-full transition-colors"
      >
        {t("save_moment")}
      </button>

      {moments.length > 0 && (
        <Card className="mt-4">
          <Eyebrow>{t("saved_moments")}</Eyebrow>
          <div className="mt-2 space-y-3 max-h-40 overflow-y-auto no-scrollbar">
            {[...moments].reverse().map((m, i) => (
              <div key={i} className="border-b border-line last:border-0 pb-3 last:pb-0">
                <p className="font-display italic text-[13px] text-ink">{m.text}</p>
                <p className="font-sans text-[9px] text-clay/60 mt-0.5">
                  {new Date(m.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>

                {m.summary ? (
                  <p className="font-sans text-[11px] text-ink/80 mt-1.5 flex items-start gap-1.5">
                    <span className="text-ink shrink-0">💎</span>
                    <span>{m.summary}</span>
                  </p>
                ) : generating[m.savedAt] ? (
                  <p className="font-sans text-[10px] text-clay/50 mt-1.5 italic">
                    {t("generating_reflection")}
                  </p>
                ) : failed[m.savedAt] ? (
                  <button
                    onClick={() => generateReflection(m.savedAt, m.text)}
                    className="font-sans text-[10px] text-blush-deep underline underline-offset-2 mt-1.5"
                  >
                    {t("reflection_failed")}
                  </button>
                ) : (
                  <button
                    onClick={() => generateReflection(m.savedAt, m.text)}
                    className="font-sans text-[10px] text-clay/60 flex items-center gap-1 mt-1.5"
                  >
                    <span className="text-ink">💎</span> {t("generate_reflection")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Eyebrow>{t("your_garment")}</Eyebrow>
        <div className="mt-2 space-y-1.5 font-sans text-[12px]">
          <div className="flex justify-between"><span className="text-clay">{t("owned_since")}</span><span className="text-ink">{t("owned_since_date")}</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("times_worn")}</span><span className="text-ink">~18</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("condition")}</span><span className="text-sage">{t("excellent")}</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("est_lifespan")}</span><span className="text-ink">{t("est_lifespan_value")} ✦</span></div>
        </div>
      </div>
      <p className="font-display italic text-[12px] text-clay text-center mt-auto pt-6">
        {t("closing_line")}
      </p>
      <Disclaimer />
    </div>
  );
}

/* 12 — MY WARDROBE */
export function MyWardrobe() {
  const { t } = useLanguage();
  const [items, setItems] = useState<WardrobeItem[]>(() => loadWardrobe());
  const [logging, setLogging] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      // ignore — photo is optional, don't block the rest of the form
    }
  };

  const submitMemory = () => {
    if (!name.trim()) return;
    const newItem: WardrobeItem = {
      name: name.trim(),
      tag: null,
      worn: "1×",
      note: note.trim() || "Just now",
      loggedAt: new Date().toISOString().slice(0, 10),
      ...(photo ? { photo } : {}),
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveWardrobe(updated);
    logWardrobeEvent(newItem);
    setName("");
    setNote("");
    setPhoto(null);
    setLogging(false);
  };

  const deleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    saveWardrobe(updated);
  };

  const toggleResold = (index: number) => {
    const updated = items.map((it, i) => (i === index ? { ...it, resold: !it.resold } : it));
    setItems(updated);
    saveWardrobe(updated);
  };

  const brandCount = new Set(items.map((it) => it.brand || "Unlabeled")).size;
  const resoldCount = items.filter((it) => it.resold).length;

  const filtered = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => {
      const matchesSearch =
        !search.trim() ||
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.note.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || it.loggedAt === dateFilter;
      return matchesSearch && matchesDate;
    });

  const hasActiveFilters = search.trim() !== "" || dateFilter !== "";

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Shirt}
        eyebrow={t("my_wardrobe")}
        title={t("wardrobe_empty_title")}
        subtitle={t("wardrobe_empty_subtitle")}
        actionLabel={t("scan_a_tag")}
        actionHref="?mode=tag"
      />
    );
  }

  if (selectedIndex !== null && items[selectedIndex]) {
    const it = items[selectedIndex];
    return (
      <div
        className="h-full px-5 py-6 fade-up overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectedIndex(null)}
          className="flex items-center gap-1 text-clay text-xs font-sans mb-4"
        >
          <ChevronLeft size={14} /> {t("my_wardrobe")}
        </button>

        {it.photo ? (
          <img
            src={it.photo}
            alt={it.name}
            className="w-full aspect-square rounded-card object-cover border border-line mb-4"
          />
        ) : (
          <div className="w-full aspect-square rounded-card bg-blush-pale/50 flex flex-col items-center justify-center gap-2 mb-4">
            <Camera size={32} className="text-blush-deep/40" />
            <p className="font-sans text-[11px] text-clay/60">{t("no_photo_added")}</p>
          </div>
        )}

        <h2 className="font-display italic text-2xl text-ink leading-tight">{it.name}</h2>

        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {it.tag && (
            <span className="text-[10px] text-sage border border-sage/40 rounded-full px-2 py-1">
              {it.tag}
            </span>
          )}
          <button
            onClick={() => toggleResold(selectedIndex)}
            className={`text-[10px] rounded-full px-2 py-1 border transition-colors ${
              it.resold
                ? "text-blush-deep border-blush-deep bg-blush-pale/60"
                : "text-clay/50 border-line"
            }`}
          >
            {it.resold ? t("resold_badge") : t("mark_resold")}
          </button>
        </div>

        <div className="divide-y divide-line border-y border-line font-sans text-[12px]">
          <div className="flex justify-between py-2.5">
            <span className="text-clay">{t("brand_label")}</span>
            <span className="text-ink font-medium">{it.brand || "—"}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-clay">{t("worn_label")}</span>
            <span className="text-ink font-medium">{it.worn}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-clay">{t("logged_label")}</span>
            <span className="text-ink font-medium">
              {it.loggedAt
                ? new Date(it.loggedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-sans font-semibold text-blush-deep uppercase tracking-wide mb-1">
            {t("the_memory")}
          </p>
          <p className="font-display italic text-[15px] text-ink leading-relaxed">
            {it.noteKey ? t(it.noteKey) : it.note}
          </p>
        </div>

        <button
          onClick={() => { deleteItem(selectedIndex); setSelectedIndex(null); }}
          className="w-full mt-6 font-sans text-[12px] text-blush-deep border border-line rounded-full py-2.5"
        >
          {t("remove_from_wardrobe")}
        </button>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("my_wardrobe")}</Eyebrow>
      <h2 className="font-display italic text-xl text-ink mt-1 mb-3">
        {items.length} {t("pieces")} · {brandCount} {t("brands")} · {resoldCount} {t("resold")}
      </h2>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[[String(items.length), t("items_label")], [String(brandCount), t("brands")], [String(resoldCount), t("resold")]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2.5 text-center">
            <p className="font-display italic text-lg text-blush-deep">{v}</p>
            <p className="text-[9px] font-sans text-clay uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full border border-line rounded-full pl-8 pr-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
        </div>
        <label className="relative flex items-center justify-center w-9 h-9 border border-line rounded-full shrink-0 cursor-pointer">
          <CalendarDays size={14} className={dateFilter ? "text-blush-deep" : "text-clay/60"} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Filter by date logged"
          />
        </label>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-2 -mt-2">
          <p className="font-sans text-[10px] text-clay">
            {filtered.length} {t("shown_of")} {items.length} {t("shown_label")}
          </p>
          <button
            onClick={() => { setSearch(""); setDateFilter(""); }}
            className="font-sans text-[10px] text-blush-deep underline underline-offset-2"
          >
            {t("clear_filters")}
          </button>
        </div>
      )}

      <div className="divide-y divide-line border-y border-line">
        {filtered.length === 0 ? (
          <p className="py-6 text-center font-sans text-[12px] text-clay">
            {t("no_entries_match")}
          </p>
        ) : (
          filtered.map(({ it, i }) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
              className="py-3 flex items-start gap-3 group cursor-pointer"
            >
              {it.photo ? (
                <img
                  src={it.photo}
                  alt={it.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-line"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-blush-pale/50 flex items-center justify-center shrink-0">
                  <Camera size={16} className="text-blush-deep/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[13px] font-medium text-ink flex items-center gap-1.5 flex-wrap">
                  {it.name}
                  {it.tag && (
                    <span className="text-[9px] text-sage border border-sage/40 rounded-full px-1.5 py-0.5">
                      {it.tag}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleResold(i); }}
                    className={`text-[9px] rounded-full px-1.5 py-0.5 border transition-colors ${
                      it.resold
                        ? "text-blush-deep border-blush-deep bg-blush-pale/60"
                        : "text-clay/40 border-line"
                    }`}
                  >
                    {it.resold ? t("resold_badge") : t("mark_resold")}
                  </button>
                </p>
                <p className="font-sans text-[11px] text-clay mt-0.5">
                  {t("worn_label")} {it.worn} · {it.noteKey ? t(it.noteKey) : it.note}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteItem(i); }}
                aria-label={`Remove ${it.name}`}
                className="text-clay/50 hover:text-blush-deep font-sans text-[11px] shrink-0 pt-0.5"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {logging ? (
        <div className="mt-4 border border-line rounded-card px-4 py-3.5 space-y-2.5">
          <div className="flex items-center gap-3">
            <label className="w-14 h-14 rounded-lg border border-dashed border-blush flex items-center justify-center shrink-0 cursor-pointer overflow-hidden">
              {photo ? (
                <img src={photo} alt="Selected" className="w-full h-full object-cover" />
              ) : (
                <Camera size={18} className="text-blush-deep/60" />
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
            <p className="font-sans text-[10px] text-clay flex-1">
              {photo ? t("photo_added_hint") : t("add_photo_hint")}
            </p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("what_is_it")}
            className="w-full border border-line rounded-lg px-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("memory_placeholder")}
            className="w-full border border-line rounded-lg px-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={submitMemory}
              className="flex-1 bg-ink text-cream font-sans text-[11px] tracking-wide py-2 rounded-full"
            >
              {t("save_memory")}
            </button>
            <button
              onClick={() => { setLogging(false); setName(""); setNote(""); setPhoto(null); }}
              className="px-4 font-sans text-[11px] text-clay"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setLogging(true)}
          className="w-full mt-4 font-sans text-[12px] text-blush-deep border border-dashed border-blush rounded-full py-2.5"
        >
          {t("log_a_memory")}
        </button>
      )}
      <p className="font-display italic text-[13px] text-clay text-center mt-6">
        With care,
        <br />Elizabeth Xu
      </p>
      <Disclaimer />
    </div>
  );
}
