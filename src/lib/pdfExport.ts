// Generates the complete Digital Product Passport as a real, multi-page,
// selectable-text PDF — built with jsPDF's native text/drawing API, not
// html2canvas on the current viewport. Every value is read live from the
// same data sources the app itself renders from (GARMENT, the Ownership
// Record, the Wardrobe list), so a person's actual saved memories,
// ownership details, and wardrobe entries appear here, not a static
// example.
//
// Honest scope note: this covers every section of the passport with real
// content, but two simplifications were necessary. First, typography uses
// jsPDF's built-in Times (serif) and Helvetica (sans) font families rather
// than the exact Cormorant Garamond / Inter used on the web — embedding a
// custom font family into a PDF is a real, separate undertaking (base64-
// encoding the font file into a jsPDF font module) that was out of scope
// here. Second, the interactive route map isn't reproduced as a graphic;
// the Journey section's real content (stops, locations, key facts) is
// included as formatted text instead of a rasterized map image.

import jsPDF from "jspdf";
import { GARMENT, getEstimatedYearsRemaining } from "./garment";
import { loadOwnershipRecord } from "./persistence";
import { loadWardrobe } from "./persistence";
import { dict, type Lang } from "./i18n";

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Palette pulled directly from the app's existing Tailwind config, not
// reinvented for the PDF.
const COLOR = {
  ink: [43, 38, 34] as [number, number, number],
  clay: [110, 99, 90] as [number, number, number],
  burgundy: [142, 61, 82] as [number, number, number],
  sage: [143, 166, 136] as [number, number, number],
  line: [237, 231, 225] as [number, number, number],
  cream: [251, 249, 246] as [number, number, number],
};

function currentLang(): Lang {
  try {
    return (localStorage.getItem("wornwith:lang") as Lang) || "en";
  } catch {
    return "en";
  }
}

function makeT(lang: Lang) {
  return (key: string): string => {
    const entry = (dict as Record<string, Record<string, string>>)[key];
    if (!entry) return "";
    return entry[lang] ?? entry.en ?? "";
  };
}

// Loads the product image as a data URL so it can be embedded — fetch()
// works here since this runs in the browser, not a server context.
async function loadImageDataUrl(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

type Cursor = { y: number; page: number };

export async function generatePassportPdf(): Promise<void> {
  const lang = currentLang();
  const t = makeT(lang);
  const ownership = loadOwnershipRecord();
  const wardrobe = loadWardrobe();

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor: Cursor = { y: MARGIN, page: 1 };

  const setColor = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const setDrawColor = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);

  const newPage = () => {
    doc.addPage();
    cursor.page += 1;
    cursor.y = MARGIN;
  };

  // Ensures a block of the given height fits before the bottom margin;
  // starts a fresh page rather than letting content clip or straddle a
  // page break awkwardly.
  const ensureSpace = (height: number) => {
    if (cursor.y + height > PAGE_H - MARGIN - 8) {
      newPage();
    }
  };

  const eyebrow = (text: string) => {
    ensureSpace(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(COLOR.burgundy);
    doc.text(text.toUpperCase(), MARGIN, cursor.y, { charSpace: 0.5 });
    cursor.y += 5;
    setDrawColor(COLOR.line);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, cursor.y, PAGE_W - MARGIN, cursor.y);
    cursor.y += 8;
  };

  const headline = (text: string, size = 20) => {
    const lines = doc.splitTextToSize(text, CONTENT_W);
    ensureSpace(lines.length * (size * 0.42) + 4);
    doc.setFont("times", "italic");
    doc.setFontSize(size);
    setColor(COLOR.ink);
    doc.text(lines, MARGIN, cursor.y);
    cursor.y += lines.length * (size * 0.42) + 6;
  };

  const body = (text: string, opts: { color?: [number, number, number]; size?: number } = {}) => {
    const size = opts.size ?? 10.5;
    const lines = doc.splitTextToSize(text, CONTENT_W);
    ensureSpace(lines.length * (size * 0.42) + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    setColor(opts.color ?? COLOR.clay);
    doc.text(lines, MARGIN, cursor.y);
    cursor.y += lines.length * (size * 0.42) + 5;
  };

  const row = (label: string, value: string) => {
    ensureSpace(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(COLOR.clay);
    doc.text(label, MARGIN, cursor.y);
    doc.setFont("helvetica", "bold");
    setColor(COLOR.ink);
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, PAGE_W - MARGIN - valueWidth, cursor.y);
    cursor.y += 6;
    setDrawColor(COLOR.line);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, cursor.y - 2, PAGE_W - MARGIN, cursor.y - 2);
  };

  const spacer = (h: number) => {
    cursor.y += h;
  };

  const sectionTitle = (text: string) => {
    ensureSpace(10);
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    setColor(COLOR.ink);
    doc.text(text, MARGIN, cursor.y);
    cursor.y += 9;
  };

  // ---------- PAGE 1 — Cover ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setColor(COLOR.clay);
  doc.text(t("dpp_eyebrow").toUpperCase() || "DIGITAL PRODUCT PASSPORT", PAGE_W / 2, cursor.y, { align: "center", charSpace: 0.5 });
  cursor.y += 14;

  const imageDataUrl = await loadImageDataUrl(GARMENT.image);
  if (imageDataUrl) {
    try {
      const imgW = 70;
      const imgH = 88;
      doc.addImage(imageDataUrl, "PNG", (PAGE_W - imgW) / 2, cursor.y, imgW, imgH, undefined, "FAST");
      cursor.y += imgH + 10;
    } catch {
      // Image failed to decode/embed — continue without it rather than
      // failing the whole export.
    }
  }

  doc.setFont("times", "italic");
  doc.setFontSize(24);
  setColor(COLOR.ink);
  const nameLines = doc.splitTextToSize(GARMENT.name, CONTENT_W);
  doc.text(nameLines, PAGE_W / 2, cursor.y, { align: "center" });
  cursor.y += nameLines.length * 10 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setColor(COLOR.clay);
  doc.text(GARMENT.tagline, PAGE_W / 2, cursor.y, { align: "center" });
  cursor.y += 12;

  doc.setFontSize(9);
  doc.text(`${GARMENT.brandSku}   \u2726   RWS   \u2726   DPP-ID: ${GARMENT.dppId}`, PAGE_W / 2, cursor.y, { align: "center" });
  cursor.y += 14;

  // Verified passport box
  const boxH = 32;
  setDrawColor(COLOR.line);
  doc.roundedRect(MARGIN, cursor.y, CONTENT_W, boxH, 3, 3, "S");
  const boxTextX = MARGIN + 8;
  let boxY = cursor.y + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(COLOR.sage);
  doc.text((t("verified_passport") || "Verified Passport").toUpperCase(), boxTextX, boxY, { charSpace: 0.3 });
  boxY += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setColor(COLOR.ink);
  doc.text(t("verified_passport") || "Verified Passport", boxTextX, boxY);
  boxY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(COLOR.clay);
  doc.text(`${GARMENT.verifiedDate} \u00b7 ID: ${GARMENT.fullDppId}`, boxTextX, boxY);
  boxY += 5;
  doc.text(t("stored_ledger") || "Stored on secure digital ledger", boxTextX, boxY);
  cursor.y += boxH + 12;

  doc.setFontSize(8);
  setColor(COLOR.clay);
  doc.text(t("eu_regulated") || "EU Regulated \u00b7 ESPR 2028\u20132029", PAGE_W / 2, cursor.y, { align: "center" });
  cursor.y += 10;

  // ---------- PAGE 2 — Product Information + Crafted to Last ----------
  newPage();
  eyebrow(t("section_product") || "Product");
  headline(GARMENT.name, 18);
  body(GARMENT.tagline);
  spacer(4);
  sectionTitle(t("product_editorial_label") || "Crafted to Last");
  body(t("product_editorial_headline"), { color: COLOR.burgundy, size: 12 });
  spacer(2);
  body(
    [t("product_editorial_copy_1"), t("product_editorial_copy_2"), t("product_editorial_copy_3")]
      .filter(Boolean)
      .join(" ")
  );
  spacer(6);
  row(t("material") || "Material", t("material_value") || GARMENT.material);
  row(t("made_in") || "Made in", t("made_in_value") || GARMENT.madeIn);
  row(t("certified") || "Certified", GARMENT.certified);
  row(t("lifespan") || "Lifespan", t("lifespan_value") || GARMENT.lifespan);
  row(t("repairability") || "Repairability", "8.5 / 10");
  spacer(8);
  sectionTitle(t("your_garment") || "Your Garment");
  row(t("owned_since") || "Owned since", ownership.purchaseDate || GARMENT.ownedSince);
  row(t("times_worn") || "Times worn", ownership.wearCount || GARMENT.timesWorn);
  row(t("condition") || "Condition", ownership.condition || GARMENT.condition);

  // ---------- PAGE 3 — Journey / Origin ----------
  newPage();
  eyebrow(t("section_journey") || "Journey");
  headline(t("supply_chain_title") || "Where it came from", 16);
  const journeySteps: [string, string][] = [
    [t("wool_farming") || "Wool Farming", t("stop_blurb_nz") || ""],
    [t("spinning_weaving") || "Spinning & Weaving", t("stop_blurb_italy") || ""],
    [t("cutting_construction") || "Cutting & Construction", t("stop_blurb_portugal") || ""],
    [t("with_you_now") || "With You Now", t("stop_blurb_paris") || ""],
  ];
  for (const [title, desc] of journeySteps) {
    sectionTitle(title);
    if (desc) body(desc);
    spacer(3);
  }
  spacer(4);
  row(t("wool_farming_cert_label") || "Certification", t("wool_farming_cert_value") || "");
  row(t("manufacturing_mill_label") || "Mill", t("manufacturing_mill_value") || "");
  row(t("manufacturing_since_label") || "Since", t("manufacturing_since_value") || "");

  // ---------- PAGE 4 — Care ----------
  newPage();
  eyebrow(t("care") || "Care");
  headline(t("designed_years") || "Designed for years, not seasons.", 16);
  body(t("care_supporting_line") || "");
  spacer(4);
  sectionTitle(t("impact_per_wear") || "Impact Per Wear");
  row(t("wears_5") || "5 wears", t("impact_high") || "High");
  row(t("wears_30") || "30 wears", t("impact_opt") || "Opt.");
  row(t("wears_100") || "100 wears", t("impact_low") || "Low");
  spacer(6);
  sectionTitle(t("atelier_title") || "The Atelier");
  body(t("atelier_intro") || "");
  spacer(6);
  sectionTitle(t("care_philosophy_title") || "Care Philosophy");
  body(
    [t("care_philosophy_line1"), t("care_philosophy_line2"), t("care_philosophy_line3")].filter(Boolean).join(" ")
  );

  // ---------- PAGE 5 — Sustainability / Environmental Performance ----------
  newPage();
  eyebrow(t("section_impact") || "Sustainability");
  headline(t("env_performance_title") || "Environmental Performance", 16);
  body(t("env_performance_body") || "");
  spacer(4);
  row(t("env_metric_carbon") || "Lower carbon footprint", t("env_metric_carbon_value") || "");
  row(t("env_metric_recyclable") || "Recyclable material composition", t("env_metric_recyclable_value") || "");
  row(t("env_metric_renewable") || "Renewable energy used in manufacturing", t("env_metric_renewable_value") || "");
  row(t("env_metric_sourced") || "Responsibly sourced wool fibres", t("env_metric_sourced_value") || "");
  row(t("env_metric_water") || "Water conserved during production", t("env_metric_water_value") || "");

  // ---------- PAGE 6 — Story Behind It ----------
  newPage();
  eyebrow(t("section_story") || "Story");
  headline(t("story_behind_it") || "The Story Behind It", 16);
  body(
    [t("story_sentence_1"), t("story_sentence_2"), t("story_sentence_3")].filter(Boolean).join(" ")
  );
  spacer(2);
  body(t("story_p2") || "");
  spacer(2);
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  setColor(COLOR.ink);
  ensureSpace(10);
  doc.text(t("crafted_to_last") || "", MARGIN, cursor.y);
  cursor.y += 10;

  // ---------- PAGE 7 — Ownership ----------
  newPage();
  eyebrow(t("section_ownership") || "Ownership");
  headline(t("designed_return") || "A record that grows with you.", 16);
  spacer(2);
  sectionTitle(t("ownership_record_title") || "Ownership Record");
  if (ownership.owner) row(t("field_owner") || "Owner", ownership.owner);
  row(t("field_purchase_date") || "Purchase Date", ownership.purchaseDate || GARMENT.ownedSince);
  if (ownership.purchaseLocation) row(t("field_purchase_location") || "Purchase Location", ownership.purchaseLocation);
  if (ownership.purchasePrice) row(t("field_purchase_price") || "Purchase Price", ownership.purchasePrice);
  if (ownership.originalRetailer) row(t("field_original_retailer") || "Original Retailer", ownership.originalRetailer);
  row(t("field_condition") || "Condition", ownership.condition || GARMENT.condition);
  row(t("field_wear_count") || "Wear Count", ownership.wearCount || GARMENT.timesWorn);
  if (ownership.repairHistory) {
    spacer(3);
    sectionTitle(t("field_repair_history") || "Repair History");
    body(ownership.repairHistory);
  }
  if (ownership.favoriteMemories) {
    spacer(3);
    sectionTitle(t("field_favorite_memories") || "Favourite Memories");
    body(ownership.favoriteMemories);
  }
  if (ownership.travelHistory) {
    spacer(3);
    sectionTitle(t("field_travel_history") || "Travel History");
    body(ownership.travelHistory);
  }
  if (ownership.notes) {
    spacer(3);
    sectionTitle(t("field_notes") || "Notes");
    body(ownership.notes);
  }

  // ---------- PAGE 8 — Wardrobe ----------
  if (wardrobe.length > 0) {
    newPage();
    eyebrow(t("section_wardrobe") || "Wardrobe");
    headline(t("my_wardrobe") || "My Wardrobe", 16);
    spacer(2);
    for (const item of wardrobe) {
      const name = item.nameKey ? t(item.nameKey) || item.name : item.name;
      sectionTitle(name);
      const noteText = item.noteKey ? t(item.noteKey) || item.note : item.note;
      if (item.brand) row(t("brand_label") || "Brand", item.brand);
      row(t("worn_label") || "Worn", item.worn);
      if (noteText) body(noteText, { size: 9.5 });
      spacer(3);
    }
  }

  // ---------- PAGE 9 — About / Verification / Data Sources / Confidence ----------
  newPage();
  eyebrow(t("about_passport_eyebrow") || "About this Passport");
  headline(t("about_passport_title") || "A living record of craftsmanship.", 16);
  body(t("about_passport_p1") || "");
  spacer(2);
  body(t("about_passport_p2") || "");
  spacer(2);
  body(t("about_passport_p3") || "");
  spacer(6);
  sectionTitle(t("verification_panel_title") || "About this verification");
  body(t("verification_panel_body") || "");
  spacer(6);
  sectionTitle(t("data_sources_title") || "Data Sources");
  row(t("data_source_brand_label") || "Brand Verification", t("data_source_verified_value") || "Verified");
  row(t("data_source_manufacturing_label") || "Manufacturing Records", t("data_source_verified_value") || "Verified");
  row(t("data_source_owner_label") || "Owner Contributions", t("data_source_active_value") || "Active");
  row(t("data_source_updated_label") || "Last Updated", t("about_passport_last_updated_value") || "");

  // ---------- FINAL PAGE — Provenance & Closing ----------
  newPage();
  eyebrow(t("section_passport") || "Passport");
  headline(t("closing_evolve_line") || "Crafted to last. Designed to evolve.", 16);
  spacer(4);
  row("DPP-ID", GARMENT.dppId);
  row(t("verified_date_value") ? (t("owned_since") || "Verified") : "Verified", GARMENT.verifiedDate);
  row(t("est_lifespan") || "Estimated lifespan remaining", getEstimatedYearsRemaining());
  spacer(10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(COLOR.clay);
  doc.text(t("footer_copyright") || "\u00a9 2026 Elizabeth Xu", PAGE_W / 2, PAGE_H - MARGIN, { align: "center" });

  // Page numbers on every page — elegant, minimal.
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(COLOR.clay);
    doc.text(`${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
  }

  const safeName = GARMENT.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  doc.save(`wornwith-care-digital-passport-${safeName}.pdf`);
}
