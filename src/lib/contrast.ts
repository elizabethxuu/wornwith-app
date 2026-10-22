// Small text needs 4.5:1 against its background. A few of the original chapter
// colors (sage, turquoise, bronze) are lighter than that, so they stay exactly
// as they are for fills, markers and icons, and small text set in them uses
// readableOn(), which only darkens that hue toward ink as far as needed.
const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
export function readableOn(color: string, background = "#FFFFFF", min = 4.5): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  const ink = rgb("#2B2622");
  const base = rgb(color);
  for (let step = 0; step <= 20; step++) {
    const mixed = "#" + base.map((v, i) => Math.round(v + (ink[i] - v) * (step / 20)).toString(16).padStart(2, "0")).join("");
    if (contrastRatio(mixed, background) >= min) return step === 0 ? color : mixed;
  }
  return "#2B2622";
}
