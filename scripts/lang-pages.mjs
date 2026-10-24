// After the build: writes dist/fr/index.html and dist/pt/index.html, the
// same app with the page title, description and link-preview image in that
// language. Link previews (iMessage, LinkedIn, WhatsApp) read the raw HTML
// and never run the app, so each language needs its own copy.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SITE = "https://wornwith.care";
const LANGS = {
  fr: {
    locale: "fr_FR",
    title: "Worn With Care | Passeport Numérique Produit",
    description: "Un Passeport Numérique Produit : d'où vient le vêtement, comment en prendre soin, où il ira ensuite.",
    alt: "Une femme portant un manteau noir en laine à col cheminée, à côté du logo wornwith.care.",
  },
  pt: {
    locale: "pt_PT",
    title: "Worn With Care | Passaporte Digital do Produto",
    description: "Um Passaporte Digital do Produto: de onde veio a peça, como cuidar dela e para onde vai a seguir.",
    alt: "Uma mulher com um casaco preto de lã de gola alta, ao lado do logótipo wornwith.care.",
  },
};

const base = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

for (const [lang, c] of Object.entries(LANGS)) {
  let html = base
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${c.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${attr(c.description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${SITE}/${lang}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${SITE}/${lang}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${attr(c.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${attr(c.description)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${SITE}/og-image-${lang}.jpg`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${attr(c.alt)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${attr(c.title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${attr(c.description)}`)
    .replace(/(<meta name="twitter:image" content=")[^"]*/, `$1${SITE}/og-image-${lang}.jpg`)
    .replace('<meta property="og:locale" content="en_US" />', `<meta property="og:locale" content="${c.locale}" />`)
    .replace(`<meta property="og:locale:alternate" content="${c.locale}" />`, '<meta property="og:locale:alternate" content="en_US" />');
  mkdirSync(new URL(`../dist/${lang}/`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../dist/${lang}/index.html`, import.meta.url), html);
  console.log(`wrote dist/${lang}/index.html`);
}
