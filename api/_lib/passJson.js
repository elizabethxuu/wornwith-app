// The Apple Wallet pass for the coat: what it says, in each language.
// Pure, so it can be tested without certificates. api/pass.js signs it.

const SITE = "https://wornwith.care";

const L = {
  en: {
    description: "Worn With Care garment passport",
    garment: "GARMENT PASSPORT",
    name: "Black Wool Coat",
    worn: "WORN",
    owner: "OWNER",
    since: "SINCE",
    sinceValue: "Apr 2026",
    journey: "JOURNEY",
    nextCare: "NEXT CARE",
    nextCareValue: "Brush · Saturdays",
    passport: "Passport",
    material: "Material",
    materialValue: "70% recycled wool",
    certified: "Certified",
    route: "Route",
    routeValue: "Canterbury → Biella → Porto → Paris",
    care: "Care reminders",
    careValue: "Brush on Saturdays. Steam on the 1st of each month. Store it on 15 April; bring it back on 1 October.",
    open: "Open the passport",
    km: "21,400 km",
  },
  fr: {
    description: "Passeport de vêtement Worn With Care",
    garment: "PASSEPORT DU VÊTEMENT",
    name: "Manteau en laine noire",
    worn: "PORTÉ",
    owner: "PROPRIÉTAIRE",
    since: "DEPUIS",
    sinceValue: "avr. 2026",
    journey: "VOYAGE",
    nextCare: "PROCHAIN SOIN",
    nextCareValue: "Brosser · le samedi",
    passport: "Passeport",
    material: "Matière",
    materialValue: "70 % laine recyclée",
    certified: "Certifié",
    route: "Trajet",
    routeValue: "Canterbury → Biella → Porto → Paris",
    care: "Rappels d'entretien",
    careValue: "Brosser le samedi. Vaporiser le 1er de chaque mois. Le ranger le 15 avril ; le ressortir le 1er octobre.",
    open: "Ouvrir le passeport",
    km: "21 400 km",
  },
  pt: {
    description: "Passaporte de peça Worn With Care",
    garment: "PASSAPORTE DA PEÇA",
    name: "Casaco de lã preta",
    worn: "USADO",
    owner: "DONO",
    since: "DESDE",
    sinceValue: "abr. 2026",
    journey: "VIAGEM",
    nextCare: "PRÓXIMO CUIDADO",
    nextCareValue: "Escovar · aos sábados",
    passport: "Passaporte",
    material: "Material",
    materialValue: "70% lã reciclada",
    certified: "Certificado",
    route: "Percurso",
    routeValue: "Canterbury → Biella → Porto → Paris",
    care: "Lembretes de cuidado",
    careValue: "Escovar aos sábados. Vaporizar no dia 1 de cada mês. Guardar a 15 de abril; voltar a usar a 1 de outubro.",
    open: "Abrir o passaporte",
    km: "21.400 km",
  },
};

export const PASSPORT_ID = "DPP-204839";
export const DPP = "4f2a";

// Only what a visitor may set: a language, a wear count and an owner's name.
export function cleanPassInput(q = {}) {
  const lang = ["en", "fr", "pt"].includes(q.lang) ? q.lang : "en";
  const n = parseInt(String(q.worn ?? "").replace(/[^0-9]/g, ""), 10);
  const worn = Number.isFinite(n) && n > 0 && n < 100000 ? n : null;
  const owner = String(q.owner ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  return { lang, worn, owner: owner || null };
}

export function buildPassJson({ lang, worn, owner }, { passTypeIdentifier, teamIdentifier }) {
  const t = L[lang] || L.en;
  const url = `${SITE}/${lang}?dpp=${DPP}`;
  const secondary = [];
  if (owner) secondary.push({ key: "owner", label: t.owner, value: owner });
  secondary.push({ key: "since", label: t.since, value: t.sinceValue });
  if (!owner) secondary.push({ key: "journey", label: t.journey, value: t.km, textAlignment: "PKTextAlignmentRight" });
  else secondary[1].textAlignment = "PKTextAlignmentRight";

  const auxiliary = [{ key: "care", label: t.nextCare, value: t.nextCareValue }];
  if (owner) auxiliary.push({ key: "journey", label: t.journey, value: t.km, textAlignment: "PKTextAlignmentRight" });

  return {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: `${PASSPORT_ID}-${lang}`,
    organizationName: "Worn With Care",
    description: t.description,
    logoText: "wornwith.care",
    backgroundColor: "rgb(46, 41, 37)",
    foregroundColor: "rgb(251, 249, 246)",
    labelColor: "rgb(214, 170, 184)",
    sharingProhibited: false,
    generic: {
      headerFields: worn ? [{ key: "worn", label: t.worn, value: `${worn}×` }] : [],
      primaryFields: [{ key: "garment", label: t.garment, value: t.name }],
      secondaryFields: secondary,
      auxiliaryFields: auxiliary,
      backFields: [
        { key: "passport", label: t.passport, value: PASSPORT_ID },
        { key: "material", label: t.material, value: t.materialValue },
        { key: "certified", label: t.certified, value: "RWS · GRS" },
        { key: "route", label: t.route, value: t.routeValue },
        { key: "careAll", label: t.care, value: t.careValue },
        { key: "link", label: t.open, value: url, attributedValue: `<a href="${url}">${url.replace("https://", "")}</a>` },
      ],
    },
    barcodes: [{ format: "PKBarcodeFormatQR", message: url, messageEncoding: "iso-8859-1", altText: PASSPORT_ID }],
  };
}

// The signing material, from Vercel environment variables. PEMs can be pasted
// as they are (with line breaks) or base64-encoded on one line.
export function readPassConfig(env = process.env) {
  const pem = (v) => {
    if (!v) return null;
    const s = v.trim();
    if (s.includes("-----BEGIN")) return s.replace(/\\n/g, "\n");
    try {
      const decoded = Buffer.from(s, "base64").toString("utf8");
      return decoded.includes("-----BEGIN") ? decoded : null;
    } catch {
      return null;
    }
  };
  const cfg = {
    passTypeIdentifier: env.APPLE_PASS_TYPE_ID || null,
    teamIdentifier: env.APPLE_TEAM_ID || null,
    signerCert: pem(env.APPLE_PASS_CERT),
    signerKey: pem(env.APPLE_PASS_KEY),
    signerKeyPassphrase: env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    wwdr: pem(env.APPLE_WWDR_CERT),
  };
  const ready = Boolean(cfg.passTypeIdentifier && cfg.teamIdentifier && cfg.signerCert && cfg.signerKey && cfg.wwdr);
  return { ready, ...cfg };
}
