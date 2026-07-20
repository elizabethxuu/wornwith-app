import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "fr" | "pt";

const STORAGE_KEY = "wornwith:lang";

// Every user-facing string in the app, keyed and translated. Data values
// that are proper nouns, measurements, or codes (place names, percentages,
// certification codes, DPP IDs) intentionally stay as-is across languages —
// that's normal for real product passports too (a GOTS certificate doesn't
// get translated).
const dict = {
  // Skeleton loader
  dpp_eyebrow: { en: "Digital Product Passport", fr: "Passeport Numérique Produit", pt: "Passaporte Digital do Produto" },
  verifying: { en: "Verifying passport…", fr: "Vérification du passeport…", pt: "Verificando passaporte…" },

  // Camera scan
  tap_to_scan: { en: "Tap the tag to scan", fr: "Touchez l'étiquette pour scanner", pt: "Toque na etiqueta para escanear" },
  scan_successful: { en: "Scan successful", fr: "Scan réussi", pt: "Digitalização concluída" },
  scan_me: { en: "Scan me ›", fr: "Scannez-moi ›", pt: "Escaneie-me ›" },

  // Welcome
  welcome_to: { en: "Welcome to", fr: "Bienvenue sur", pt: "Bem-vindo ao" },
  what_is_this: { en: "What is this?", fr: "Qu'est-ce que c'est ?", pt: "O que é isto?" },
  dpp_explainer: {
    en: "A Digital Product Passport is a record every garment sold in the EU will be required to carry by 2028–2029 — where it was made, what it's made of, and how to care for it. This is one designer's take on what that moment could actually feel like.",
    fr: "Un Passeport Numérique Produit est un enregistrement que chaque vêtement vendu dans l'UE devra porter d'ici 2028–2029 — où il a été fabriqué, de quoi il est fait, et comment en prendre soin. Voici la vision d'une créatrice de ce moment.",
    pt: "Um Passaporte Digital do Produto é um registro que toda peça de roupa vendida na UE deverá ter até 2028–2029 — onde foi feita, do que é feita e como cuidar dela. Esta é a visão de uma designer sobre como esse momento poderia ser.",
  },
  verified_passport: { en: "Verified Passport", fr: "Passeport Vérifié", pt: "Passaporte Verificado" },
  stored_ledger: { en: "Stored on secure digital ledger", fr: "Stocké sur un registre numérique sécurisé", pt: "Armazenado em registro digital seguro" },
  eu_regulated: { en: "EU Regulated · ESPR 2028–2029", fr: "Réglementé par l'UE · ESPR 2028–2029", pt: "Regulado pela UE · ESPR 2028–2029" },
  demo_disclaimer: {
    en: "All data shown is illustrative for demo purposes only.",
    fr: "Toutes les données affichées sont illustratives, à des fins de démonstration uniquement.",
    pt: "Todos os dados exibidos são ilustrativos, apenas para fins de demonstração.",
  },
  tap_pin_hint: {
    en: "Tap a stop to learn more · pinch to zoom",
    fr: "Touchez une étape pour en savoir plus · pincez pour zoomer",
    pt: "Toque em uma etapa para saber mais · belisque para ampliar",
  },
  rws_explainer: {
    en: "Responsible Wool Standard — an independent certification verifying the wool came from farms that meet strict animal welfare and land management requirements.",
    fr: "Responsible Wool Standard — une certification indépendante garantissant que la laine provient de fermes respectant des exigences strictes en matière de bien-être animal et de gestion des terres.",
    pt: "Responsible Wool Standard — uma certificação independente que garante que a lã veio de fazendas que atendem a rigorosos requisitos de bem-estar animal e gestão da terra.",
  },
  stop_blurb_nz: {
    en: "Where the coat's story begins — wool sheared from sheep raised on open pasture.",
    fr: "Là où l'histoire du manteau commence — laine tondue sur des moutons élevés en plein pâturage.",
    pt: "Onde a história do casaco começa — lã tosquiada de ovelhas criadas em pastagens abertas.",
  },
  stop_blurb_italy: {
    en: "Raw wool is cleaned, spun into yarn, and woven into cloth by third-generation millers.",
    fr: "La laine brute est nettoyée, filée puis tissée par des artisans de troisième génération.",
    pt: "A lã bruta é limpa, fiada e tecida por moleiros de terceira geração.",
  },
  stop_blurb_portugal: {
    en: "Skilled hands cut and construct each panel — the same ateliers COS has worked with for years.",
    fr: "Des mains expertes coupent et assemblent chaque panneau — les mêmes ateliers depuis des années.",
    pt: "Mãos habilidosas cortam e montam cada painel — os mesmos ateliês há anos.",
  },
  stop_blurb_paris: {
    en: "The coat's most recent chapter — wherever you are, right now, wearing it.",
    fr: "Le dernier chapitre du manteau — où que vous soyez, en ce moment, en le portant.",
    pt: "O capítulo mais recente do casaco — onde quer que você esteja, agora, usando-o.",
  },
  viewed_times: { en: "This passport has been viewed", fr: "Ce passeport a été consulté", pt: "Este passaporte foi visualizado" },
  times_suffix: { en: "times", fr: "fois", pt: "vezes" },

  // Product overview
  dpp_verified: { en: "DPP Verified", fr: "DPP Vérifié", pt: "DPP Verificado" },
  wool_jacket: { en: "Wool Jacket", fr: "Veste en Laine", pt: "Casaco de Lã" },
  tagline_coat: { en: "Sustainable materials, timeless style", fr: "Matériaux durables, style intemporel", pt: "Materiais sustentáveis, estilo atemporal" },
  material: { en: "Material", fr: "Matériau", pt: "Material" },
  made_in: { en: "Made in", fr: "Fabriqué en", pt: "Fabricado em" },
  certified: { en: "Certified", fr: "Certifié", pt: "Certificado" },
  lifespan: { en: "Lifespan", fr: "Durée de vie", pt: "Vida útil" },
  repairability: { en: "Repairability", fr: "Réparabilité", pt: "Reparabilidade" },
  your_garment: { en: "Your Garment", fr: "Votre Vêtement", pt: "Sua Peça" },
  owned_since: { en: "Owned since", fr: "Possédé depuis", pt: "Adquirido em" },
  owned_since_date: { en: "April 2026", fr: "avril 2026", pt: "abril de 2026" },
  times_worn: { en: "Times worn", fr: "Fois porté", pt: "Vezes usado" },
  condition: { en: "Condition", fr: "État", pt: "Condição" },
  excellent: { en: "Excellent", fr: "Excellent", pt: "Excelente" },
  lifespan_value: { en: "8–10 years", fr: "8 à 10 ans", pt: "8–10 anos" },
  est_lifespan_value: { en: "6+ years", fr: "6 ans et plus", pt: "6+ anos" },
  verified_date_value: { en: "April 2026", fr: "avril 2026", pt: "abril de 2026" },
  story_date_value: { en: "5 Apr 2026", fr: "5 avr. 2026", pt: "5 abr. 2026" },
  blockchain_word: { en: "blockchain", fr: "blockchain", pt: "blockchain" },
  photo_unavailable: { en: "Photo unavailable right now", fr: "Photo indisponible pour le moment", pt: "Foto indisponível no momento" },

  // Product lifecycle
  lifecycle_eyebrow: { en: "Product Lifecycle", fr: "Cycle de Vie du Produit", pt: "Ciclo de Vida do Produto" },
  where_from: { en: "Where did it come from?", fr: "D'où vient-il ?", pt: "De onde ele veio?" },
  km_traveled: { en: "18,400km from farm to your hands", fr: "18 400 km de la ferme à vos mains", pt: "18.400km da fazenda até suas mãos" },
  wool_farming: { en: "Wool Farming", fr: "Élevage de Laine", pt: "Criação de Lã" },
  spinning_weaving: { en: "Spinning & Weaving", fr: "Filature et Tissage", pt: "Fiação e Tecelagem" },
  cutting_construction: { en: "Cutting & Construction", fr: "Coupe et Confection", pt: "Corte e Confecção" },
  with_you_now: { en: "With you now", fr: "Avec vous maintenant", pt: "Com você agora" },

  // Supply chain
  supply_chain: { en: "Supply Chain", fr: "Chaîne d'Approvisionnement", pt: "Cadeia de Suprimentos" },
  wool_farm: { en: "Wool Farm", fr: "Ferme de Laine", pt: "Fazenda de Lã" },
  milling: { en: "Milling", fr: "Filature", pt: "Fiação" },
  ship: { en: "Ship", fr: "Expédition", pt: "Envio" },
  retail: { en: "Retail", fr: "Vente au Détail", pt: "Varejo" },
  countries: { en: "Countries", fr: "Pays", pt: "Países" },
  traveled: { en: "traveled", fr: "parcourus", pt: "percorridos" },
  verified: { en: "Verified", fr: "Vérifié", pt: "Verificado" },
  ethical_audit: { en: "Ethical Audit", fr: "Audit Éthique", pt: "Auditoria Ética" },
  fair_wages: { en: "Fair wages", fr: "Salaires équitables", pt: "Salários justos" },
  health_safety: { en: "Health & safety", fr: "Santé et sécurité", pt: "Saúde e segurança" },
  no_forced_labour: { en: "No forced labour", fr: "Pas de travail forcé", pt: "Sem trabalho forçado" },
  passed: { en: "Passed", fr: "Réussi", pt: "Aprovado" },
  grade_a: { en: "Grade A", fr: "Note A", pt: "Nota A" },
  audited_by: { en: "Audited by Bureau Veritas · Cert #BV-2025-09871", fr: "Audité par Bureau Veritas · Cert n°BV-2025-09871", pt: "Auditado pela Bureau Veritas · Cert #BV-2025-09871" },
  chemical_compliance: { en: "Chemical Compliance", fr: "Conformité Chimique", pt: "Conformidade Química" },
  reach_compliant: { en: "REACH Compliant · No restricted substances detected", fr: "Conforme REACH · Aucune substance restreinte détectée", pt: "Conforme REACH · Nenhuma substância restrita detectada" },
  economic_operator: { en: "Economic Operator", fr: "Opérateur Économique", pt: "Operador Econômico" },
  economic_operator_value: { en: "COS AB · Stockholm, Sweden", fr: "COS AB · Stockholm, Suède", pt: "COS AB · Estocolmo, Suécia" },
  economic_operator_note: {
    en: "The legal entity responsible for this product's compliance under EU regulation.",
    fr: "L'entité juridique responsable de la conformité de ce produit selon la réglementation de l'UE.",
    pt: "A entidade legal responsável pela conformidade deste produto segundo a regulamentação da UE.",
  },

  // Care guide
  designed_years: { en: "Designed for years, not seasons.", fr: "Conçu pour des années, pas des saisons.", pt: "Feito para durar anos, não estações." },
  designed_lifespan: { en: "Designed lifespan: 8–10 years", fr: "Durée de vie prévue : 8–10 ans", pt: "Vida útil prevista: 8–10 anos" },
  impact_per_wear: { en: "Impact per wear", fr: "Impact par port", pt: "Impacto por uso" },
  cold_water: { en: "Cold water only", fr: "Eau froide uniquement", pt: "Somente água fria" },
  max_30: { en: "30°C max", fr: "30°C max", pt: "30°C máx" },
  lay_flat: { en: "Lay flat to dry", fr: "Séchage à plat", pt: "Secar na horizontal" },
  never_hang_wet: { en: "Never hang wet", fr: "Ne jamais suspendre mouillé", pt: "Nunca pendurar molhado" },
  steam_dont_iron: { en: "Steam, don't iron", fr: "Vapeur, pas de fer", pt: "Vapor, não passar a ferro" },
  let_breathe: { en: "Let it breathe", fr: "Laissez respirer", pt: "Deixe respirar" },
  fold_dont_hang: { en: "Fold, don't hang", fr: "Pliez, ne suspendez pas", pt: "Dobre, não pendure" },
  away_sunlight: { en: "Away from sunlight", fr: "À l'abri du soleil", pt: "Longe da luz solar" },
  tradeoff_honesty: { en: "Trade-off honesty", fr: "Honnêteté sur les compromis", pt: "Honestidade sobre compromissos" },
  tradeoff_quote: {
    en: "Blended fibres can make recycling more complex at end-of-life.",
    fr: "Les fibres mélangées peuvent compliquer le recyclage en fin de vie.",
    pt: "Fibras mistas podem tornar a reciclagem mais complexa no fim da vida útil.",
  },

  // Sustainability
  sustainability: { en: "Sustainability", fr: "Durabilité", pt: "Sustentabilidade" },
  impact_metrics: { en: "Impact Metrics", fr: "Indicateurs d'Impact", pt: "Métricas de Impacto" },
  vs_avg: { en: "vs 12.1kg avg (similar coats)", fr: "vs 12,1kg moy. (manteaux similaires)", pt: "vs 12,1kg méd. (casacos similares)" },
  recycled_water: { en: "recycled water", fr: "eau recyclée", pt: "água reciclada" },
  recyclability: { en: "Recyclability", fr: "Recyclabilité", pt: "Reciclabilidade" },
  renewable_energy: { en: "Renewable energy", fr: "Énergie renouvelable", pt: "Energia renovável" },
  ethical_sourcing: { en: "Ethical sourcing", fr: "Approvisionnement éthique", pt: "Fornecimento ético" },
  co2_saved: { en: "CO₂ saved", fr: "CO₂ économisé", pt: "CO₂ economizado" },
  water_saved: { en: "water saved", fr: "eau économisée", pt: "água economizada" },
  top_10: { en: "of brands", fr: "des marques", pt: "das marcas" },

  // What's next
  ready_pass_on: { en: "Ready to pass it on?", fr: "Prêt à le transmettre ?", pt: "Pronto para repassar?" },
  choose_next: { en: "Choose what happens next", fr: "Choisissez la suite", pt: "Escolha o que acontece a seguir" },
  resell: { en: "Resell", fr: "Revendre", pt: "Revender" },
  thrift: { en: "Thrift", fr: "Donner", pt: "Doar" },
  repair: { en: "Repair", fr: "Réparer", pt: "Consertar" },
  recycle: { en: "Recycle", fr: "Recycler", pt: "Reciclar" },
  donate_locally: { en: "Donate locally", fr: "Faire un don localement", pt: "Doar localmente" },
  find_tailor: { en: "Find a tailor nearby", fr: "Trouver un tailleur à proximité", pt: "Encontrar um costureiro próximo" },
  return_to_cos: { en: "Return to COS", fr: "Retourner chez COS", pt: "Devolver à COS" },
  location_note: {
    en: "Thrift and Repair open a nearby-places search — your browser may ask for location access.",
    fr: "Donner et Réparer ouvrent une recherche à proximité — votre navigateur peut demander l'accès à votre position.",
    pt: "Doar e Consertar abrem uma busca de locais próximos — seu navegador pode pedir acesso à localização.",
  },
  why_brands_participate: { en: "Why COS participates", fr: "Pourquoi COS participe", pt: "Por que a COS participa" },
  brand_incentive_note: {
    en: "Every resell, repair, or return routed through this passport gives COS a repeat touchpoint with you — and first right of refusal when the garment eventually leaves your closet.",
    fr: "Chaque revente, réparation ou retour effectué via ce passeport donne à COS un point de contact récurrent avec vous — et la priorité lorsque le vêtement quittera votre garde-robe.",
    pt: "Cada revenda, reparo ou devolução feito através deste passaporte dá à COS um ponto de contato recorrente com você — e prioridade quando a peça eventualmente sair do seu guarda-roupa.",
  },

  // Story
  story_behind_it: { en: "The story behind it", fr: "L'histoire derrière", pt: "A história por trás" },
  story_p1: {
    en: "Your coat began on sheep farms in New Zealand, before moving through European mills and into skilled hands in Portugal — designed to be worn, repaired, and passed on.",
    fr: "Votre manteau a commencé dans des fermes ovines en Nouvelle-Zélande, avant de passer par des filatures européennes puis entre des mains expertes au Portugal — conçu pour être porté, réparé et transmis.",
    pt: "Seu casaco começou em fazendas de ovelhas na Nova Zelândia, passou por fábricas europeias e chegou a mãos habilidosas em Portugal — feito para ser usado, reparado e repassado.",
  },
  story_p2: {
    en: "Crafted from 70% recycled merino — it carries a lower footprint than 90% of comparable wool coats.",
    fr: "Confectionné à partir de 70% de mérinos recyclé — son empreinte est inférieure à 90% des manteaux en laine comparables.",
    pt: "Feito com 70% de merino reciclado — tem uma pegada menor que 90% dos casacos de lã comparáveis.",
  },
  crafted_to_last: { en: "Crafted to last. Designed to return.", fr: "Fabriqué pour durer. Conçu pour revenir.", pt: "Feito para durar. Projetado para retornar." },
  share_passport: { en: "Share passport", fr: "Partager le passeport", pt: "Compartilhar passaporte" },
  save_to_wardrobe: { en: "Save to wardrobe", fr: "Ajouter à la garde-robe", pt: "Salvar no guarda-roupa" },
  shared: { en: "✓ Shared", fr: "✓ Partagé", pt: "✓ Compartilhado" },
  link_copied: { en: "✓ Link copied", fr: "✓ Lien copié", pt: "✓ Link copiado" },
  saved: { en: "✓ Saved", fr: "✓ Enregistré", pt: "✓ Salvo" },

  // Personalization
  make_it_yours: { en: "Make it yours", fr: "Personnalisez-le", pt: "Torne-o seu" },
  when_wear: { en: "When do you think you'll wear this?", fr: "Quand pensez-vous le porter ?", pt: "Quando você acha que vai usar isso?" },
  moment_placeholder: {
    en: "Think about a place, date, or time and enter here.",
    fr: "Pensez à un lieu, une date ou un moment et écrivez-le ici.",
    pt: "Pense em um lugar, data ou momento e escreva aqui.",
  },
  save_moment: { en: "Save this moment", fr: "Enregistrer ce moment", pt: "Salvar este momento" },
  saved_moments: { en: "Saved moments", fr: "Moments enregistrés", pt: "Momentos salvos" },
  est_lifespan: { en: "Est. lifespan", fr: "Durée de vie est.", pt: "Vida útil est." },
  closing_line: {
    en: "Once you wear the outfits, the outfits should not wear you.",
    fr: "Une fois que vous portez les tenues, elles ne doivent pas vous porter.",
    pt: "Depois de vestir as roupas, as roupas não devem te vestir.",
  },

  // Wardrobe
  my_wardrobe: { en: "My Wardrobe", fr: "Ma Garde-robe", pt: "Meu Guarda-roupa" },
  pieces: { en: "pieces", fr: "pièces", pt: "peças" },
  brands: { en: "brands", fr: "marques", pt: "marcas" },
  resold: { en: "resold", fr: "revendues", pt: "revendidas" },
  items_label: { en: "items", fr: "articles", pt: "itens" },
  worn_label: { en: "Worn", fr: "Porté", pt: "Usado" },
  what_is_it: { en: "What is it? e.g. Wool Trench Coat", fr: "Qu'est-ce que c'est ? ex. Trench en laine", pt: "O que é? ex. Trench de lã" },
  memory_placeholder: { en: "The memory — where, when, why it mattered", fr: "Le souvenir — où, quand, pourquoi c'était important", pt: "A memória — onde, quando, por que importou" },
  save_memory: { en: "Save memory", fr: "Enregistrer le souvenir", pt: "Salvar memória" },
  cancel: { en: "Cancel", fr: "Annuler", pt: "Cancelar" },
  log_a_memory: { en: "+ Log a memory", fr: "+ Ajouter un souvenir", pt: "+ Registrar uma memória" },
};

export type TranslationKey = keyof typeof dict;

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (key) => dict[key]?.en ?? String(key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as Lang) || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: TranslationKey) => dict[key]?.[lang] ?? dict[key]?.en ?? String(key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
