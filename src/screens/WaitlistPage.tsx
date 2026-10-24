import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { apiUrl } from "../lib/apiBase";
import { GARMENT } from "../lib/garment";
import { JOURNEY, PASSPORT_ID } from "../lib/passportRecord";

// wornwith.care/waitlist: "Which piece in your closet deserves a passport?"
// Sign-ups go to /api/waitlist. Until a database is connected the form
// offers an email to hello@ instead, so no one is ever turned away.

const CHIPS: { kind: string; key: WKey }[] = [
  { kind: "coat", key: "wl_chip_coat" },
  { kind: "leather", key: "wl_chip_leather" },
  { kind: "dress", key: "wl_chip_dress" },
  { kind: "knit", key: "wl_chip_knit" },
  { kind: "denim", key: "wl_chip_denim" },
];

// This page's own words, kept here so the passport doesn't load them.
const W = {
  lc_countries: { en: "countries", fr: "pays", pt: "países" },
  lc_years: { en: "years of wear", fr: "ans de port", pt: "anos de uso" },
  wl_eyebrow: { en: "The waitlist", fr: "La liste d'attente", pt: "A lista de espera" },
  wl_title: { en: "Which piece in your closet deserves a passport?", fr: "Quelle pièce de votre garde-robe mérite un passeport ?", pt: "Que peça do seu armário merece um passaporte?" },
  wl_sub: { en: "Worn With Care gives the clothes you keep a passport: where they came from, how to care for them, and the life they've lived with you. Tell us the one piece you'd start with.", fr: "Worn With Care donne un passeport aux vêtements que vous gardez : d'où ils viennent, comment en prendre soin, et la vie qu'ils ont vécue avec vous. Dites-nous la pièce par laquelle vous commenceriez.", pt: "A Worn With Care dá um passaporte às roupas que guarda: de onde vieram, como cuidar delas e a vida que viveram consigo. Diga-nos a peça por onde começaria." },
  wl_piece_label: { en: "The piece", fr: "La pièce", pt: "A peça" },
  wl_piece_ph: { en: "My grandmother's camel coat", fr: "Le manteau camel de ma grand-mère", pt: "O casaco camelo da minha avó" },
  wl_chip_coat: { en: "A coat", fr: "Un manteau", pt: "Um casaco" },
  wl_chip_leather: { en: "A leather jacket", fr: "Une veste en cuir", pt: "Um casaco de cabedal" },
  wl_chip_dress: { en: "A vintage dress", fr: "Une robe vintage", pt: "Um vestido vintage" },
  wl_chip_knit: { en: "An heirloom knit", fr: "Un tricot de famille", pt: "Uma malha de família" },
  wl_chip_denim: { en: "Raw denim", fr: "Un denim brut", pt: "Uma ganga crua" },
  wl_email_label: { en: "Email", fr: "E-mail", pt: "E-mail" },
  wl_join: { en: "Join the waitlist", fr: "Rejoindre la liste", pt: "Entrar na lista" },
  wl_joining: { en: "Joining…", fr: "Inscription…", pt: "A inscrever…" },
  wl_fine: { en: "One email when your passport is ready. Nothing else.", fr: "Un e-mail quand votre passeport est prêt. Rien d'autre.", pt: "Um e-mail quando o seu passaporte estiver pronto. Nada mais." },
  wl_done_eyebrow: { en: "You're on the list", fr: "Vous êtes sur la liste", pt: "Está na lista" },
  wl_done_title: { en: "We've added {piece} to the list.", fr: "Nous avons ajouté {piece} à la liste.", pt: "Adicionámos {piece} à lista." },
  wl_done_sub: { en: "Know someone who keeps their clothes for years? Send them the coat's passport.", fr: "Vous connaissez quelqu'un qui garde ses vêtements des années ? Envoyez-lui le passeport du manteau.", pt: "Conhece alguém que guarda as roupas durante anos? Envie-lhe o passaporte do casaco." },
  wl_count: { en: "{n} people waiting", fr: "{n} personnes en attente", pt: "{n} pessoas à espera" },
  wl_top: { en: "Most named: {piece}", fr: "La plus citée : {piece}", pt: "A mais referida: {piece}" },
  wl_err_email: { en: "Please enter a valid email.", fr: "Veuillez saisir un e-mail valide.", pt: "Introduza um e-mail válido." },
  wl_err_piece: { en: "Tell us the piece first.", fr: "Dites-nous d'abord la pièce.", pt: "Diga-nos primeiro a peça." },
  wl_err: { en: "Something went wrong. Try again, or write to hello@wornwith.care.", fr: "Un problème est survenu. Réessayez, ou écrivez à hello@wornwith.care.", pt: "Algo correu mal. Tente de novo, ou escreva para hello@wornwith.care." },
  wl_closed: { en: "The waitlist opens soon. Until then, email us your piece and we'll add you by hand.", fr: "La liste ouvre bientôt. D'ici là, envoyez-nous votre pièce par e-mail et nous vous ajouterons à la main.", pt: "A lista abre em breve. Até lá, envie-nos a sua peça por e-mail e adicionamo-lo à mão." },
  wl_email_us: { en: "Email hello@wornwith.care", fr: "Écrire à hello@wornwith.care", pt: "Escrever para hello@wornwith.care" },
  wl_see_passport: { en: "See the coat's passport ›", fr: "Voir le passeport du manteau ›", pt: "Ver o passaporte do casaco ›" },
  wl_next_title: { en: "What happens next", fr: "Et ensuite", pt: "O que vem a seguir" },
  wl_next1_t: { en: "We read every answer", fr: "Nous lisons chaque réponse", pt: "Lemos todas as respostas" },
  wl_next1_b: { en: "The pieces you name decide which brands and garments get passports first.", fr: "Les pièces que vous citez décident quelles marques et quels vêtements reçoivent un passeport en premier.", pt: "As peças que refere decidem que marcas e roupas recebem passaporte primeiro." },
  wl_next2_t: { en: "Your piece gets its passport", fr: "Votre pièce reçoit son passeport", pt: "A sua peça recebe o passaporte" },
  wl_next2_b: { en: "Its origin, its care, and a tag you can tap with your phone.", fr: "Son origine, son entretien, et une étiquette à toucher avec votre téléphone.", pt: "A origem, os cuidados e uma etiqueta que pode tocar com o telemóvel." },
  wl_next3_t: { en: "It keeps its story", fr: "Elle garde son histoire", pt: "Guarda a sua história" },
  wl_next3_b: { en: "Wears, repairs, cities and owners, carried with it when you pass it on.", fr: "Les fois portées, les réparations, les villes et les propriétaires, transmis avec elle.", pt: "Usos, reparações, cidades e donos, que seguem com ela quando a passar adiante." },
} as const;
type WKey = keyof typeof W;

const LOCALE = { en: "en-US", fr: "fr-FR", pt: "pt-BR" } as const;

type Status = "idle" | "sending" | "done" | "closed" | "error" | "bad-email" | "no-piece";

export default function WaitlistPage() {
  const { lang } = useLanguage();
  const t = (k: WKey) => W[k][lang];
  const [piece, setPiece] = useState("");
  const [chip, setChip] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [stats, setStats] = useState<{ count: number | null; top: string | null }>({ count: null, top: null });

  useEffect(() => {
    document.title = `${t("wl_eyebrow")} · Worn With Care`;
    // Unlisted until the waitlist is announced: keep it out of search results.
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, [lang]);

  useEffect(() => {
    fetch(apiUrl("/api/waitlist"))
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) setStats(j); })
      .catch(() => undefined);
  }, []);

  const chipLabel = (kind: string) => {
    const c = CHIPS.find((x) => x.kind === kind);
    return c ? t(c.key) : "";
  };
  // A chip still counts as chosen only while its words are unchanged.
  const kind = chip && piece === chipLabel(chip) ? chip : "other";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!piece.trim()) return setStatus("no-piece");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setStatus("bad-email");
    setStatus("sending");
    try {
      const r = await fetch(apiUrl("/api/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), piece: piece.trim(), kind, lang }),
      });
      if (r.status === 501) return setStatus("closed");
      if (r.status === 400) {
        const j = await r.json().catch(() => ({}));
        return setStatus(j.error === "piece" ? "no-piece" : "bad-email");
      }
      setStatus(r.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  const named = kind !== "other" ? piece.charAt(0).toLowerCase() + piece.slice(1) : `“${piece.trim()}”`;
  const home = lang === "en" ? "/" : `/${lang}`;
  const mailto = `mailto:hello@wornwith.care?subject=${encodeURIComponent(t("wl_eyebrow"))}&body=${encodeURIComponent(`${t("wl_piece_label")}: ${piece}`)}`;
  const num = new Intl.NumberFormat(LOCALE[lang]);

  const field = "w-full font-sans text-[16px] px-4 py-3.5 rounded-xl border border-line bg-paper text-ink placeholder:text-clay/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E3D52]";

  return (
    <div className="min-h-[100dvh] bg-cream text-ink">
      <header className="max-w-[1160px] mx-auto px-6 py-7 flex items-center justify-between gap-4 flex-wrap">
        <a href={home} className="flex items-center gap-2.5" aria-label="Worn With Care">
          <img src="/images/wornwith-logo-sm.webp" alt="" className="h-7 w-auto" />
          <span className="font-display italic text-[24px] font-medium">wornwith.care</span>
        </a>
        <a href={`${home}?dpp=${GARMENT.dppId}`} className="font-sans text-[14px] font-medium text-[#8E3D52]">
          {t("wl_see_passport")}
        </a>
      </header>

      <main className="max-w-[1160px] mx-auto px-6 pt-6 pb-16 md:pt-10 md:pb-20 flex flex-wrap gap-12 md:gap-14 items-center">
        <div className="flex-[999_1_480px] min-w-0 flex flex-col gap-5">
          <p className="font-sans text-[12px] tracking-[0.26em] uppercase font-semibold text-[#8E3D52]">{t("wl_eyebrow")}</p>
          <h1 className="font-display italic font-medium text-[44px] md:text-[68px] leading-[1.02] [text-wrap:balance]">{t("wl_title")}</h1>
          <p className="font-sans text-[16px] md:text-[17px] leading-relaxed text-clay max-w-[52ch]">{t("wl_sub")}</p>

          {status === "done" ? (
            <div className="max-w-[520px] mt-2 border border-line bg-paper rounded-2xl px-6 py-5 flex flex-col gap-2 fade-up" role="status">
              <span className="font-sans text-[11px] tracking-[0.22em] uppercase font-semibold text-[#3F6B4A]">{t("wl_done_eyebrow")}</span>
              <span className="font-display italic text-[28px] leading-snug">{t("wl_done_title").replace("{piece}", named)}</span>
              <span className="font-sans text-[14px] text-clay">{t("wl_done_sub")}</span>
            </div>
          ) : status === "closed" ? (
            <div className="max-w-[520px] mt-2 border border-line bg-paper rounded-2xl px-6 py-5 flex flex-col gap-3" role="status">
              <span className="font-sans text-[14px] text-ink leading-relaxed">{t("wl_closed")}</span>
              <a href={mailto} className="self-start rounded-full bg-ink text-cream px-5 py-3 font-sans text-[14px] font-medium">{t("wl_email_us")}</a>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-4 max-w-[520px] mt-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wl-piece" className="font-sans text-[13px] font-semibold">{t("wl_piece_label")}</label>
                <input
                  id="wl-piece"
                  type="text"
                  value={piece}
                  maxLength={120}
                  onChange={(e) => { setPiece(e.target.value); if (status === "no-piece") setStatus("idle"); }}
                  placeholder={t("wl_piece_ph")}
                  aria-invalid={status === "no-piece"}
                  aria-describedby={status === "no-piece" ? "wl-msg" : undefined}
                  className={field}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {CHIPS.map((c) => {
                  const on = kind === c.kind;
                  return (
                    <button
                      key={c.kind}
                      type="button"
                      aria-pressed={on}
                      onClick={() => { setPiece(t(c.key)); setChip(c.kind); if (status === "no-piece") setStatus("idle"); }}
                      className={`font-sans text-[13px] min-h-[40px] px-4 rounded-full border transition-colors ${on ? "bg-ink text-cream border-ink" : "bg-paper text-ink border-line"}`}
                    >
                      {t(c.key)}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wl-email" className="font-sans text-[13px] font-semibold">{t("wl_email_label")}</label>
                <div className="flex flex-wrap gap-2.5">
                  <input
                    id="wl-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === "bad-email") setStatus("idle"); }}
                    placeholder="you@example.com"
                    aria-invalid={status === "bad-email"}
                    aria-describedby={status === "bad-email" ? "wl-msg" : undefined}
                    className={`${field} flex-[1_1_240px] w-auto min-w-0`}
                  />
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex-none rounded-full bg-ink text-cream px-6 min-h-[52px] font-sans text-[15px] font-medium disabled:opacity-60"
                  >
                    {status === "sending" ? t("wl_joining") : t("wl_join")}
                  </button>
                </div>
              </div>
              <p id="wl-msg" role={status === "error" || status === "bad-email" || status === "no-piece" ? "alert" : undefined} className={`font-sans text-[12px] ${status === "error" || status === "bad-email" || status === "no-piece" ? "text-[#A23B3B]" : "text-clay"}`}>
                {status === "bad-email" ? t("wl_err_email") : status === "no-piece" ? t("wl_err_piece") : status === "error" ? t("wl_err") : t("wl_fine")}
              </p>
            </form>
          )}

          {stats.count !== null && (
            <p className="font-sans text-[13px] text-clay">
              {t("wl_count").replace("{n}", num.format(stats.count))}
              {stats.top && chipLabel(stats.top) ? ` · ${t("wl_top").replace("{piece}", chipLabel(stats.top))}` : ""}
            </p>
          )}
        </div>

        <div className="flex-[1_1_320px] min-w-0 flex justify-center">
          <a href={`${home}?dpp=${GARMENT.dppId}`} className="w-full max-w-[380px] bg-paper border border-line rounded-[22px] p-6 flex flex-col gap-4 shadow-[0_18px_40px_rgba(46,41,37,0.08)]">
            <div className="flex justify-between items-center gap-3">
              <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-clay">{PASSPORT_ID}</span>
              <span className="font-sans text-[11px] font-semibold text-[#3F6B4A]">RWS · GRS</span>
            </div>
            <img src={GARMENT.image} alt={GARMENT.name} className="w-full h-[240px] object-cover rounded-[14px]" />
            <span className="font-display italic text-[26px] leading-tight">{GARMENT.name}</span>
            <div className="grid grid-cols-3 gap-2.5 border-t border-line pt-3.5">
              <div className="flex flex-col"><span className="font-display font-semibold text-[24px]">{JOURNEY.countries}</span><span className="font-sans text-[11px] text-clay">{t("lc_countries")}</span></div>
              <div className="flex flex-col"><span className="font-display font-semibold text-[24px]">{num.format(JOURNEY.distanceKm)}</span><span className="font-sans text-[11px] text-clay">km</span></div>
              <div className="flex flex-col"><span className="font-display font-semibold text-[24px]">{GARMENT.lifespan.replace(/ .*/, "")}</span><span className="font-sans text-[11px] text-clay">{t("lc_years")}</span></div>
            </div>
          </a>
        </div>
      </main>

      <section className="border-t border-line bg-paper">
        <div className="max-w-[1160px] mx-auto px-6 py-14 md:py-16 flex flex-col gap-7">
          <h2 className="font-display italic font-medium text-[34px]">{t("wl_next_title")}</h2>
          <ol className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {([["01", "wl_next1_t", "wl_next1_b"], ["02", "wl_next2_t", "wl_next2_b"], ["03", "wl_next3_t", "wl_next3_b"]] as const).map(([n, title, body]) => (
              <li key={n} className="flex flex-col gap-2">
                <span className="font-display italic text-[28px] text-[#8E3D52]">{n}</span>
                <span className="font-sans text-[16px] font-semibold">{t(title)}</span>
                <span className="font-sans text-[14px] leading-relaxed text-clay">{t(body)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="max-w-[1160px] mx-auto px-6 py-8 flex flex-wrap gap-4 justify-between font-sans text-[12px] text-clay">
        <span>© 2026 Worn With Care</span>
        <a href="mailto:hello@wornwith.care" className="text-[#8E3D52]">hello@wornwith.care</a>
      </footer>
    </div>
  );
}
