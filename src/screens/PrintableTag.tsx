import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { SITE_URL, passportUrl } from "../lib/config";
import { GARMENT } from "../lib/garment";

const QR_VALUE = passportUrl("en", GARMENT.dppId, SITE_URL);

// Web NFC exists only in Chrome on Android; on iPhone the tag is written
// with a free app instead (see the steps on the page).
type NdefWriter = { write: (msg: { records: { recordType: string; data: string }[] }) => Promise<void> };
const canWriteNfc = typeof window !== "undefined" && "NDEFReader" in window;

export default function PrintableTag() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [nfc, setNfc] = useState<"idle" | "waiting" | "done" | "error">("idle");

  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(QR_VALUE); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* select it by hand */ }
  };

  const writeNfc = async () => {
    try {
      setNfc("waiting");
      const Reader = (window as unknown as { NDEFReader: new () => NdefWriter }).NDEFReader;
      await new Reader().write({ records: [{ recordType: "url", data: QR_VALUE }] });
      setNfc("done");
    } catch {
      setNfc("error");
    }
  };

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
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#9E4F63] font-sans font-semibold">
          Printable Tag
        </p>
        <h1 className="font-display italic text-2xl text-ink mt-1">
          Scan this with an iPhone
        </h1>
        <p className="font-sans text-xs text-clay mt-2">
          This QR points to <span className="text-ink">{QR_VALUE}</span>.
          Point the iPhone Camera app at it directly, no app install needed,
          it opens straight into the passport.
        </p>
      </div>

      {/* the physical tag mockup, matching the cardboard tag from the demo guide */}
      <div className="bg-cream rounded-lg w-[220px] py-8 px-6 flex flex-col items-center gap-5 shadow-xl border border-line">
        <p className="font-sans text-[11px] tracking-[0.2em] text-clay">COS</p>
        <div ref={canvasWrapRef} className="bg-white p-3 rounded-md">
          <QRCodeCanvas
            value={QR_VALUE}
            size={160}
            level="M"
            fgColor="#2B2622"
            bgColor="#FFFFFF"
          />
        </div>
        <p className="font-display italic text-sm text-[#9E4F63]">Scan me ›</p>
        <p className="font-sans text-[9px] text-clay tracking-wide">
          DPP-ID: 4f2a
        </p>
      </div>

      <button
        onClick={downloadPng}
        className="bg-ink text-cream font-sans text-xs tracking-wide px-6 py-3 rounded-full"
      >
        Download tag as PNG
      </button>

      {/* The same link, for an NFC sticker sewn into the coat: tap a phone
          to the sleeve and the passport opens, verification and all. */}
      <section className="max-w-sm w-full bg-cream rounded-2xl border border-line p-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#9E4F63] font-sans font-semibold">NFC tag</p>
        <h2 className="font-display italic text-xl text-ink mt-1">Tap the coat, open the passport</h2>
        <p className="font-sans text-xs text-clay mt-2 leading-relaxed">
          Write this link to an NTAG213 or NTAG215 sticker and put it inside the coat, behind the care label.
          Any iPhone (XS or newer) or Android phone opens it with a tap, no app needed.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate rounded-md bg-white border border-line px-2.5 py-2 font-mono text-[11px] text-ink">{QR_VALUE}</code>
          <button onClick={copyUrl} className="shrink-0 rounded-full border border-line px-3 py-2 font-sans text-[11px] text-ink">{copied ? "Copied" : "Copy"}</button>
        </div>
        {canWriteNfc ? (
          <button onClick={writeNfc} disabled={nfc === "waiting"} className="mt-4 w-full rounded-full bg-ink text-cream py-3 font-sans text-xs disabled:opacity-60">
            {nfc === "waiting" ? "Hold the sticker to the back of your phone…" : nfc === "done" ? "Written. Tap it to test." : nfc === "error" ? "Couldn't write. Try again" : "Write to an NFC sticker"}
          </button>
        ) : (
          <ol className="mt-4 space-y-1.5 font-sans text-xs text-ink list-decimal pl-4 leading-relaxed">
            <li>Install the free <span className="italic">NFC Tools</span> app.</li>
            <li>Write → Add a record → URL / URI, and paste the link.</li>
            <li>Tap Write, then hold the sticker to the top of your iPhone.</li>
            <li>Lock the tag in the app (optional) so it can't be rewritten.</li>
          </ol>
        )}
      </section>
    </div>
  );
}
