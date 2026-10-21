import { useState } from "react";
import { Eyebrow, Card, EmptyState } from "../components/UI";
import { useLanguage } from "../lib/i18n";
import { ChevronLeft, ShoppingBag, Recycle, Wrench, Repeat, MapPinOff } from "lucide-react";


/* 9: WHAT'S NEXT */
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
      <Eyebrow>{t("section_next_chapter")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">
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
      <p className="font-sans text-[10px] text-clay mt-4 text-center">
        {t("location_note")}
      </p>

      <Card className="mt-4">
        <Eyebrow>{t("why_brands_participate")}</Eyebrow>
        <p className="font-sans text-[11px] text-clay leading-relaxed mt-2">
          {t("brand_incentive_note")}
        </p>
      </Card>
    </div>
  );
}
