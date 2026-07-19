import type { ReactNode } from "react";

export default function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-[340px] h-[700px] bg-paper rounded-phone shadow-[0_30px_60px_-15px_rgba(43,38,34,0.25)] border border-line overflow-hidden">
      {/* status bar */}
      <div className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-6 pt-2 text-[11px] text-ink/70 font-sans z-20">
        <span>9:41</span>
        <div className="w-24 h-6 bg-ink rounded-full absolute left-1/2 -translate-x-1/2 top-1" />
        <span>􀛨 􀙇 100%</span>
      </div>
      <div className="w-full h-full pt-11 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
}
