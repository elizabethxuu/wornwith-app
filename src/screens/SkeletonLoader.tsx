import { useLanguage } from "../lib/i18n";

/* 1: SKELETON LOADER */
export function SkeletonLoader() {
  const { t } = useLanguage();
  return (
    <div
      data-testid="verifying-logo"
      className="relative h-full w-full flex flex-col items-center justify-center bg-paper px-8"
    >
      <img
        src="/images/wornwith-logo.webp"
        alt=""
        aria-hidden="true"
        className="lux-verify-logo w-[clamp(7rem,30vw,11rem)] h-auto"
      />
      <div className="lux-verify-rule mt-6 h-px w-20 bg-ink/70" aria-hidden="true" />
      <p className="lux-verify-word mt-5 font-sans text-[10px] uppercase tracking-[0.42em] text-clay" aria-hidden="true">wornwith.care</p>
      {/* Screen readers still hear what is happening. */}
      <p className="sr-only" role="status">{t("verifying")}</p>
    </div>
  );
}
