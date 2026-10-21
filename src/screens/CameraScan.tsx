import { useState, useEffect } from "react";
import { useLanguage } from "../lib/i18n";
import { Check } from "lucide-react";


/* 2: CAMERA SCAN */
export function CameraScan({ onComplete }: { onComplete?: () => void } = {}) {
  const { t } = useLanguage();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleScan = () => {
    if (scanned || scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanned(true);
      setScanning(false);
    }, 420);
  };

  // Auto-plays once on mount when used as the real "you just scanned the
  // tag" moment in the live boot sequence.
  useEffect(() => {
    if (!onComplete) return;
    const startTimer = setTimeout(() => handleScan(), 120);
    return () => clearTimeout(startTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After the success text has had a moment to register, a quick white
  // flash, a camera-shutter beat, not a loading transition, then
  // dissolves straight into Welcome.
  useEffect(() => {
    if (!scanned || !onComplete) return;
    const flashTimer = setTimeout(() => setFlashing(true), 650);
    const exitTimer = setTimeout(() => setExiting(true), 800);
    const completeTimer = setTimeout(() => onComplete(), 1120);
    return () => {
      clearTimeout(flashTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanned]);

  return (
    <div
      onClick={handleScan}
      className="relative h-full w-full flex items-center justify-center bg-cream overflow-hidden cursor-pointer transition-opacity duration-300"
      style={{
        opacity: exiting ? 0 : 1,
        border: "3px solid #1A1A1A",
      }}
    >
      {scanning && (
        // A single black line sweeping the full height, monochrome,
        // quiet, no color accent.
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#1A1A1A] scan-line-sweep-mono" />
      )}
      {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2", "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"].map((pos, i) => (
        <div key={i} className={`absolute w-8 h-8 border-[#1A1A1A] ${pos}`} />
      ))}
      {/* A small rounded-rectangle marker anchored near the bottom of
          the frame, presses in right as the scan begins, like it's the
          tag actually being tapped, then releases back. */}
      <div
        className={`absolute bottom-16 left-1/2 w-24 h-14 rounded-xl ${scanning ? "tap-press" : ""}`}
        style={{ border: "2px solid #1A1A1A", transform: "translateX(-50%)" }}
      />
      {scanned && (
        <p className="relative flex items-center gap-1.5 text-sm text-ink font-sans fade-up">
          <Check size={16} className="text-ink" /> {t("qr_scan_successful")}
        </p>
      )}
      {/* The chic beat, a quick, bright white flash right before the
          screen dissolves into Welcome. Plays once, no loop. */}
      {flashing && <div className="absolute inset-0 bg-white white-flash-once" />}
    </div>
  );
}
