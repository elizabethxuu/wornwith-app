import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { SITE_URL } from "../lib/config";

export default function PrintableTag() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const downloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "wornwith-care-tag-qr.png";
    a.click();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 py-10 px-4 bg-[#F0ECE6]">
      <div className="text-center max-w-sm">
        <p className="text-[10px] tracking-[0.2em] uppercase text-blush-deep font-sans font-semibold">
          Printable Tag
        </p>
        <h1 className="font-display italic text-2xl text-ink mt-1">
          Scan this with an iPhone
        </h1>
        <p className="font-sans text-xs text-clay mt-2">
          This QR points to <span className="text-ink">{SITE_URL}</span>.
          Point the iPhone Camera app at it directly — no app install needed,
          it opens straight into the passport.
        </p>
      </div>

      {/* the physical tag mockup, matching the cardboard tag from the demo guide */}
      <div className="bg-cream rounded-lg w-[220px] py-8 px-6 flex flex-col items-center gap-5 shadow-xl border border-line">
        <p className="font-sans text-[11px] tracking-[0.2em] text-clay">COS</p>
        <div ref={canvasWrapRef} className="bg-white p-3 rounded-md">
          <QRCodeCanvas
            value={SITE_URL}
            size={160}
            level="M"
            fgColor="#2B2622"
            bgColor="#FFFFFF"
          />
        </div>
        <p className="font-display italic text-sm text-blush-deep">Scan me ›</p>
        <p className="font-sans text-[9px] text-clay/70 tracking-wide">
          DPP-ID: 4f2a
        </p>
      </div>

      <button
        onClick={downloadPng}
        className="bg-ink text-cream font-sans text-xs tracking-wide px-6 py-3 rounded-full"
      >
        Download tag as PNG
      </button>
      <p className="font-sans text-[11px] text-clay text-center max-w-xs">
      
      </p>
    </div>
  );
}
