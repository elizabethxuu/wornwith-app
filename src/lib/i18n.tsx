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
  material_value: { en: "70% Recycled Wool", fr: "70% de laine recyclée", pt: "70% de lã reciclada" },
  product_name_l1: { en: "COS Black Wool", fr: "Manteau en Laine Noire", pt: "Casaco de Lã Preta" },
  product_name_l2: { en: "Funnel-Neck Coat", fr: "à Col Cheminée COS", pt: "com Gola Funil COS" },
  made_in_value: { en: "Italy & Portugal", fr: "Italie et Portugal", pt: "Itália e Portugal" },
  wears_5: { en: "5 wears", fr: "5 usages", pt: "5 usos" },
  wears_30: { en: "30 wears", fr: "30 usages", pt: "30 usos" },
  wears_100: { en: "100 wears", fr: "100 usages", pt: "100 usos" },
  impact_high: { en: "High", fr: "Élevé", pt: "Alto" },
  impact_opt: { en: "Opt.", fr: "Opt.", pt: "Ideal" },
  impact_low: { en: "Low", fr: "Faible", pt: "Baixo" },
  place_italy: { en: "Italy", fr: "Italie", pt: "Itália" },
  place_portugal: { en: "Portugal", fr: "Portugal", pt: "Portugal" },
  place_paris: { en: "Paris", fr: "Paris", pt: "Paris" },
  place_france: { en: "France", fr: "France", pt: "França" },
  place_nz: { en: "NZ", fr: "NZ", pt: "NZ" },
  place_full_nz: { en: "Canterbury Plains, NZ", fr: "Canterbury Plains, NZ", pt: "Canterbury Plains, NZ" },
  place_full_nz_short: { en: "Canterbury Plains", fr: "Canterbury Plains", pt: "Canterbury Plains" },
  place_full_italy: { en: "Biella, Italy", fr: "Biella, Italie", pt: "Biella, Itália" },
  place_full_portugal: { en: "Porto, Portugal", fr: "Porto, Portugal", pt: "Porto, Portugal" },
  place_full_paris: { en: "Paris, France", fr: "Paris, France", pt: "Paris, França" },
  your_garment: { en: "Your Garment", fr: "Votre Vêtement", pt: "Sua Peça" },
  owned_since: { en: "Owned since", fr: "Possédé depuis", pt: "Adquirido em" },
  owned_since_date: { en: "April 2026", fr: "avril 2026", pt: "abril de 2026" },
  times_worn: { en: "Times worn", fr: "Fois porté", pt: "Vezes usado" },
  condition: { en: "Condition", fr: "État", pt: "Condição" },
  excellent: { en: "Excellent", fr: "Excellent", pt: "Excelente" },
  lifespan_value: { en: "8–10 years", fr: "8 à 10 ans", pt: "8–10 anos" },
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
  who_made_it: { en: "Who made it?", fr: "Qui l'a fabriqué ?", pt: "Quem fez isso?" },
  supply_chain_supporting_line: {
    en: "Every hand this coat passed through before it reached yours.",
    fr: "Chaque main par laquelle ce manteau est passé avant de vous parvenir.",
    pt: "Cada mão pela qual este casaco passou antes de chegar até você.",
  },
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
  care: { en: "Care", fr: "Entretien", pt: "Cuidado" },
  care_supporting_line: {
    en: "The small choices that keep it in rotation longer.",
    fr: "Les petits gestes qui le gardent en rotation plus longtemps.",
    pt: "As pequenas escolhas que o mantêm em uso por mais tempo.",
  },

  next_recommended_care_title: { en: "Next Recommended Care", fr: "Prochain Entretien Recommandé", pt: "Próximo Cuidado Recomendado" },
  next_suggested_service_title: { en: "Next Suggested Service", fr: "Prochain Service Suggéré", pt: "Próximo Serviço Sugerido" },

  care_tier_excellent: {
    en: "No maintenance is recommended at this time.",
    fr: "Aucun entretien n'est recommandé pour le moment.",
    pt: "Nenhuma manutenção é recomendada no momento.",
  },
  care_tier_moderate: {
    en: "A light professional clean is recommended before continued seasonal use.",
    fr: "Un léger nettoyage professionnel est recommandé avant une utilisation saisonnière continue.",
    pt: "Uma limpeza profissional leve é recomendada antes do uso contínuo na estação.",
  },
  care_tier_heavy: {
    en: "This garment would benefit from professional servicing before further regular wear.",
    fr: "Ce vêtement bénéficierait d'un entretien professionnel avant une utilisation régulière prolongée.",
    pt: "Esta peça se beneficiaria de manutenção profissional antes de mais uso regular.",
  },


  care_reasoning_before: { en: "Based on", fr: "Sur la base de", pt: "Com base em" },
  care_reasoning_wears_word: { en: "recorded wears", fr: "ports enregistrés", pt: "usos registrados" },
  care_reasoning_and_condition: { en: "and the garment's", fr: "et l'état", pt: "e a condição" },
  care_reasoning_condition_word: { en: "condition", fr: "du vêtement", pt: "da peça" },

  season_word_spring: { en: "spring", fr: "printemps", pt: "primavera" },
  season_word_summer: { en: "summer", fr: "estivales", pt: "verão" },
  season_word_autumn: { en: "autumn", fr: "automnales", pt: "outono" },
  season_word_winter: { en: "winter", fr: "hivernales", pt: "inverno" },

  condition_word_excellent: { en: "excellent", fr: "excellent", pt: "excelente" },

  care_guidance_label: { en: "Care Guidance", fr: "Conseils d'Entretien", pt: "Orientação de Cuidados" },

  care_will_notify: {
    en: "We'll let you know when its care profile changes.",
    fr: "Nous vous informerons lorsque son profil d'entretien évoluera.",
    pt: "Avisaremos quando o perfil de cuidados mudar.",
  },

  service_professional_cleaning: { en: "Professional cleaning before seasonal storage", fr: "Nettoyage professionnel avant le stockage saisonnier", pt: "Limpeza profissional antes do armazenamento sazonal" },
  service_light_brushing: { en: "Light brushing after regular wear to preserve the wool fibres", fr: "Brossage léger après un port régulier pour préserver les fibres de laine", pt: "Escovação leve após uso regular para preservar as fibras de lã" },
  service_wooden_hanger: { en: "Store on a broad wooden hanger in a cool, dry environment", fr: "Ranger sur un large cintre en bois dans un environnement frais et sec", pt: "Guardar em um cabide de madeira largo em ambiente fresco e seco" },

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
  env_performance_title: { en: "Environmental Performance", fr: "Performance Environnementale", pt: "Desempenho Ambiental" },
  env_performance_body: {
    en: "Designed to outperform most comparable wool outerwear across environmental and durability measures, this garment ranks among the top 10% for environmental performance. Its material composition, manufacturing process and projected longevity reduce its lifetime environmental impact while extending years of active use.",
    fr: "Conçu pour surpasser la plupart des vêtements d'extérieur en laine comparables en matière d'impact environnemental et de durabilité, ce vêtement se classe parmi les 10% les plus performants. Sa composition, son procédé de fabrication et sa longévité projetée réduisent son impact environnemental sur l'ensemble de son cycle de vie tout en prolongeant ses années d'utilisation active.",
    pt: "Projetado para superar a maioria das peças de lã comparáveis em medidas ambientais e de durabilidade, esta peça está entre as 10% melhores em desempenho ambiental. Sua composição de material, processo de fabricação e longevidade projetada reduzem seu impacto ambiental ao longo da vida útil, ao mesmo tempo em que estendem seus anos de uso ativo.",
  },
  env_metric_carbon: { en: "lower carbon footprint", fr: "d'empreinte carbone en moins", pt: "menos de pegada de carbono" },
  env_metric_carbon_value: { en: "30%", fr: "30%", pt: "30%" },
  env_metric_recyclable: { en: "recyclable material composition", fr: "de composition en matériaux recyclables", pt: "de composição em materiais recicláveis" },
  env_metric_recyclable_value: { en: "92%", fr: "92%", pt: "92%" },
  env_metric_renewable: { en: "renewable energy used in manufacturing", fr: "d'énergie renouvelable utilisée en fabrication", pt: "de energia renovável usada na fabricação" },
  env_metric_renewable_value: { en: "78%", fr: "78%", pt: "78%" },
  env_metric_sourced: { en: "responsibly sourced wool fibres", fr: "de fibres de laine issues de sources responsables", pt: "de fibras de lã de origem responsável" },
  env_metric_sourced_value: { en: "100%", fr: "100%", pt: "100%" },
  env_metric_water: { en: "water conserved during production", fr: "d'eau préservée pendant la production", pt: "de água preservada durante a produção" },
  env_metric_water_value: { en: "2,400 L", fr: "2 400 L", pt: "2.400 L" },
  env_metric_service: { en: "projected service life", fr: "de durée de vie projetée", pt: "de vida útil projetada" },
  env_metric_service_value: { en: "10+ years", fr: "10 ans et plus", pt: "10+ anos" },
  impact_supporting_line: {
    en: "What this coat actually costs the planet, and what it saves.",
    fr: "Ce que ce manteau coûte réellement à la planète, et ce qu'il permet d'économiser.",
    pt: "O que este casaco realmente custa ao planeta, e o que ele economiza.",
  },
  section_passport: { en: "Passport", fr: "Passeport", pt: "Passaporte" },
  section_product: { en: "Product", fr: "Produit", pt: "Produto" },
  section_journey: { en: "Journey", fr: "Parcours", pt: "Jornada" },
  section_care: { en: "Care", fr: "Entretien", pt: "Cuidado" },
  section_impact: { en: "Impact", fr: "Impact", pt: "Impacto" },
  section_ownership: { en: "Ownership", fr: "Propriété", pt: "Propriedade" },
  section_next_chapter: { en: "Next Chapter", fr: "Prochain Chapitre", pt: "Próximo Capítulo" },
  section_story: { en: "Story", fr: "Histoire", pt: "História" },
  section_wardrobe: { en: "Wardrobe", fr: "Garde-robe", pt: "Guarda-roupa" },

  wool_farming_card_title: { en: "About this wool farm", fr: "À propos de cette ferme", pt: "Sobre esta fazenda de lã" },
  wool_farming_cert_label: { en: "Certification", fr: "Certification", pt: "Certificação" },
  wool_farming_cert_value: { en: "Responsible Wool Standard", fr: "Responsible Wool Standard", pt: "Responsible Wool Standard" },
  wool_farming_region_label: { en: "Region", fr: "Région", pt: "Região" },
  wool_farming_region_value: { en: "Canterbury Plains, New Zealand", fr: "Canterbury Plains, Nouvelle-Zélande", pt: "Canterbury Plains, Nova Zelândia" },
  wool_farming_climate_label: { en: "Climate", fr: "Climat", pt: "Clima" },
  wool_farming_climate_value: { en: "Temperate — ideal for merino", fr: "Tempéré — idéal pour le mérinos", pt: "Temperado — ideal para merino" },
  wool_farming_season_label: { en: "Shearing season", fr: "Saison de tonte", pt: "Temporada de tosquia" },
  wool_farming_season_value: { en: "Spring (Sept–Nov)", fr: "Printemps (sept.–nov.)", pt: "Primavera (set.–nov.)" },
  learn_more: { en: "Learn more", fr: "En savoir plus", pt: "Saiba mais" },

  manufacturing_card_title: { en: "About this mill", fr: "À propos de cette filature", pt: "Sobre esta fábrica" },
  manufacturing_mill_label: { en: "Mill", fr: "Filature", pt: "Fábrica" },
  manufacturing_mill_value: { en: "Biella Wool Mill", fr: "Filature de Biella", pt: "Fábrica de Biella" },
  manufacturing_family_label: { en: "Family owned", fr: "Entreprise familiale", pt: "Empresa familiar" },
  manufacturing_family_value: { en: "Yes, 3rd generation", fr: "Oui, 3e génération", pt: "Sim, 3ª geração" },
  manufacturing_since_label: { en: "Operating since", fr: "En activité depuis", pt: "Em operação desde" },
  manufacturing_since_value: { en: "1938", fr: "1938", pt: "1938" },
  manufacturing_renewable_label: { en: "Renewable energy", fr: "Énergie renouvelable", pt: "Energia renovável" },
  manufacturing_renewable_value: { en: "65%", fr: "65%", pt: "65%" },


  // Archive transition
  transition_saving: { en: "Saving to Archive…", fr: "Enregistrement dans les archives…", pt: "Salvando no Arquivo…" },
  transition_provenance: { en: "Updating provenance…", fr: "Mise à jour de la provenance…", pt: "Atualizando a proveniência…" },
  transition_reflection: { en: "Generating reflection…", fr: "Génération de la réflexion…", pt: "Gerando reflexão…" },
  transition_assessing: { en: "Assessing garment history…", fr: "Évaluation de l'historique du vêtement…", pt: "Avaliando o histórico da peça…" },
  transition_complete: { en: "Complete.", fr: "Terminé.", pt: "Concluído." },

  // AI Reflection (archive, featured)
  ai_reflection_title: { en: "AI Reflection", fr: "Réflexion IA", pt: "Reflexão de IA" },

  // From the Archives
  from_the_archives_title: { en: "From the Archives", fr: "Depuis les Archives", pt: "Dos Arquivos" },
  from_the_archives_subtitle: {
    en: "Every wear, repair and journey contributes to this garment's provenance.",
    fr: "Chaque port, réparation et voyage contribue à la provenance de ce vêtement.",
    pt: "Cada uso, reparo e jornada contribui para a proveniência desta peça.",
  },
  archive_cat_acquisition: { en: "Acquisition", fr: "Acquisition", pt: "Aquisição" },
  archive_title_acquisition: { en: "Purchased", fr: "Acheté", pt: "Comprado" },
  archive_desc_acquisition: { en: "Entered into your collection.", fr: "Entré dans votre collection.", pt: "Adicionado à sua coleção." },

  archive_cat_journey: { en: "First Journey", fr: "Premier Voyage", pt: "Primeira Jornada" },
  archive_title_journey: { en: "Weekend in Edinburgh", fr: "Week-end à Édimbourg", pt: "Fim de semana em Edimburgo" },
  archive_desc_journey: { en: "First memory recorded.", fr: "Premier souvenir enregistré.", pt: "Primeira memória registrada." },

  archive_cat_maintenance: { en: "Maintenance", fr: "Entretien", pt: "Manutenção" },
  archive_title_maintenance: { en: "Buttons professionally repaired", fr: "Boutons réparés professionnellement", pt: "Botões reparados profissionalmente" },
  archive_desc_maintenance: { en: "Routine care preserved the original construction.", fr: "Un entretien de routine a préservé la construction d'origine.", pt: "Cuidados de rotina preservaram a construção original." },

  archive_cat_milestone: { en: "Milestone", fr: "Étape Marquante", pt: "Marco" },
  archive_title_milestone: { en: "50 wears recorded", fr: "50 ports enregistrés", pt: "50 usos registrados" },
  archive_desc_milestone: { en: "A significant longevity milestone.", fr: "Une étape importante de longévité.", pt: "Um marco importante de longevidade." },

  archive_cat_restoration: { en: "Restoration", fr: "Restauration", pt: "Restauração" },
  archive_title_restoration: { en: "Buttons replaced", fr: "Boutons remplacés", pt: "Botões substituídos" },
  archive_desc_restoration: { en: "Components renewed to extend service life.", fr: "Composants renouvelés pour prolonger la durée de vie.", pt: "Componentes renovados para prolongar a vida útil." },

  archive_cat_transfer: { en: "Transfer", fr: "Transfert", pt: "Transferência" },
  archive_title_transfer: { en: "Ownership transferred", fr: "Propriété transférée", pt: "Propriedade transferida" },
  archive_desc_transfer: { en: "Digital provenance transferred with the garment.", fr: "Provenance numérique transférée avec le vêtement.", pt: "Proveniência digital transferida com a peça." },

  // Curator's Notes
  curators_notes_title: { en: "Curator's Notes", fr: "Notes du Conservateur", pt: "Notas do Curador" },
  curators_notes_body: {
    en: "This garment has matured through four winters, travelled across three cities and remained in exceptional condition. Rather than being replaced, it has been maintained, repaired and continuously worn — an ownership pattern that reflects the principles of circular design. Its documented history suggests a product intended to endure well beyond the industry average.",
    fr: "Ce vêtement a mûri à travers quatre hivers, voyagé dans trois villes et est resté dans un état exceptionnel. Plutôt que d'être remplacé, il a été entretenu, réparé et porté continuellement — une habitude de possession qui reflète les principes du design circulaire. Son histoire documentée suggère un produit conçu pour durer bien au-delà de la moyenne du secteur.",
    pt: "Esta peça amadureceu ao longo de quatro invernos, viajou por três cidades e permaneceu em condição excepcional. Em vez de ser substituída, foi mantida, reparada e usada continuamente — um padrão de posse que reflete os princípios do design circular. Sua história documentada sugere um produto feito para durar muito além da média do setor.",
  },

  // Ownership Summary
  ownership_summary_title: { en: "Ownership Summary", fr: "Résumé de Propriété", pt: "Resumo de Propriedade" },
  recorded_wears: { en: "Recorded wears", fr: "Ports enregistrés", pt: "Usos registrados" },
  environmental_ranking: { en: "Environmental ranking", fr: "Classement Environnemental", pt: "Classificação Ambiental" },
  archive_entries_count: { en: "Archive entries", fr: "Entrées d'archives", pt: "Entradas no arquivo" },
  save_another_moment: { en: "+ Save another moment", fr: "+ Enregistrer un autre moment", pt: "+ Salvar outro momento" },

  // Today's Edit
  todays_edit_title: { en: "Today's Edit", fr: "La Sélection du Jour", pt: "A Seleção de Hoje" },

  weather_unavailable: { en: "Enable location access for real-time weather.", fr: "Activez l'accès à la position pour la météo en temps réel.", pt: "Ative o acesso à localização para clima em tempo real." },

  why_this_piece_title: { en: "Why this piece?", fr: "Pourquoi cette pièce ?", pt: "Por que esta peça?" },
  reason_temperature: { en: "Suited to today's temperature", fr: "Adapté à la température d'aujourd'hui", pt: "Adequado à temperatura de hoje" },
  reason_not_worn: { en: "Not worn in {n} days", fr: "Pas porté depuis {n} jours", pt: "Não usado há {n} dias" },
  reason_condition: { en: "Excellent condition", fr: "État excellent", pt: "Condição excelente" },
  reason_weather: { en: "Well suited to changing weather", fr: "Bien adapté aux conditions changeantes", pt: "Bem adequado a condições variáveis" },
  reason_impact: { en: "Extends impact per wear", fr: "Prolonge l'impact par port", pt: "Estende o impacto por uso" },

  morning_brief_title: { en: "Morning Brief", fr: "Bulletin du Matin", pt: "Boletim Matinal" },
  listen_label: { en: "Listen", fr: "Écouter", pt: "Ouvir" },
  stop_label: { en: "Stop", fr: "Arrêter", pt: "Parar" },
  voice_unavailable: { en: "Spoken briefing isn't supported in this browser.", fr: "Le bulletin audio n'est pas pris en charge par ce navigateur.", pt: "O boletim falado não é compatível com este navegador." },

  alternatives_title: { en: "Also Consider", fr: "À Considérer Aussi", pt: "Considere Também" },

  readiness_title: { en: "Garment Readiness", fr: "État de Préparation", pt: "Prontidão da Peça" },

  interlude_title: { en: "Interlude", fr: "Interlude", pt: "Interlúdio" },
  interlude_supporting: {
    en: "A quiet accompaniment to today's recommendation.",
    fr: "Un accompagnement discret à la recommandation du jour.",
    pt: "Um acompanhamento discreto para a recomendação de hoje.",
  },
  enter_listening_room: { en: "Enter the Listening Room", fr: "Entrer dans la Salle d'Écoute", pt: "Entrar na Sala de Escuta" },
  listening_room_title: { en: "The Listening Room", fr: "La Salle d'Écoute", pt: "A Sala de Escuta" },
  todays_atmosphere_title: { en: "Today's Atmosphere", fr: "L'Atmosphère du Jour", pt: "A Atmosfera de Hoje" },
  editorial_notes_title: { en: "Editorial Notes", fr: "Notes Éditoriales", pt: "Notas Editoriais" },
  listening_nearby_title: { en: "Listening Nearby", fr: "À Écouter", pt: "Para Ouvir" },
  reading_nearby_title: { en: "Reading Nearby", fr: "À Lire", pt: "Para Ler" },
  continue_listening_label: { en: "Continue Listening", fr: "Continuer l'Écoute", pt: "Continuar Ouvindo" },
  return_to_todays_edit: { en: "Return", fr: "Retour", pt: "Voltar" },
  ready_to_wear: { en: "Ready to wear", fr: "Prêt à porter", pt: "Pronto para usar" },
  estimated_after_wears: { en: "Estimated after {n} additional wears", fr: "Estimé après {n} ports supplémentaires", pt: "Estimado após mais {n} usos" },

  // Editorial weather observations — no percentages, no technical terms
  obs_rain: { en: "Light rain later today makes outerwear a thoughtful choice.", fr: "De la pluie légère plus tard aujourd'hui fait de la veste un choix judicieux.", pt: "Chuva leve mais tarde hoje torna o casaco uma escolha ponderada." },
  obs_warming: { en: "The day begins cool before warming into the afternoon.", fr: "La journée commence fraîche avant de se réchauffer dans l'après-midi.", pt: "O dia começa frio antes de esquentar à tarde." },
  obs_cool: { en: "Cool temperatures favour soft wool layers today.", fr: "Les températures fraîches favorisent les couches de laine douce aujourd'hui.", pt: "As temperaturas frias favorecem camadas macias de lã hoje." },
  obs_clear_warm: { en: "Clear skies call for lighter natural fibres.", fr: "Un ciel dégagé appelle des fibres naturelles plus légères.", pt: "Céu limpo pede fibras naturais mais leves." },
  obs_mild: { en: "A crisp morning gives way to a mild afternoon.", fr: "Une matinée vive cède la place à un après-midi doux.", pt: "Uma manhã fresca dá lugar a uma tarde amena." },
  obs_default: { en: "A quietly versatile day for getting dressed.", fr: "Une journée discrètement polyvalente pour s'habiller.", pt: "Um dia discretamente versátil para se vestir." },

  // Garment reasoning line, editorial not technical
  reasoning_rain: { en: "Ideal for today's changing conditions. Layer over a lightweight knit for comfort throughout the day.", fr: "Idéal pour les conditions changeantes d'aujourd'hui. Superposez avec un tricot léger pour plus de confort tout au long de la journée.", pt: "Ideal para as condições variáveis de hoje. Combine com uma malha leve para mais conforto ao longo do dia." },
  reasoning_cool: { en: "A dependable layer for today's cooler air, effortless from morning through evening.", fr: "Une couche fiable pour l'air plus frais d'aujourd'hui, sans effort du matin au soir.", pt: "Uma camada confiável para o ar mais frio de hoje, sem esforço da manhã à noite." },
  reasoning_warm: { en: "Light enough for today's warmth, considered enough to last.", fr: "Assez léger pour la chaleur d'aujourd'hui, assez réfléchi pour durer.", pt: "Leve o suficiente para o calor de hoje, pensado o suficiente para durar." },
  reasoning_default: { en: "A quietly versatile choice for today, at ease indoors or out.", fr: "Un choix discrètement polyvalent pour aujourd'hui, à l'aise en intérieur comme en extérieur.", pt: "Uma escolha discretamente versátil para hoje, à vontade dentro ou fora." },

  morning_label: { en: "Morning", fr: "Matin", pt: "Manhã" },
  afternoon_label: { en: "Afternoon", fr: "Après-midi", pt: "Tarde" },
  evening_label: { en: "Evening", fr: "Soir", pt: "Noite" },
  rain_expected: { en: "Light rain expected later today.", fr: "Pluie légère attendue plus tard aujourd'hui.", pt: "Chuva leve esperada mais tarde hoje." },
  clear_expected: { en: "Clear conditions expected today.", fr: "Conditions dégagées attendues aujourd'hui.", pt: "Condições claras esperadas hoje." },

  not_worn_week: { en: "Not worn in over a week", fr: "Pas porté depuis plus d'une semaine", pt: "Não usado há mais de uma semana" },
  not_worn_two_weeks: { en: "Not worn in over two weeks", fr: "Pas porté depuis plus de deux semaines", pt: "Não usado há mais de duas semanas" },
  not_worn_month: { en: "Not worn in over a month", fr: "Pas porté depuis plus d'un mois", pt: "Não usado há mais de um mês" },

  recently_maintained: { en: "Recently maintained", fr: "Entretenu récemment", pt: "Mantido recentemente" },
  estimated_maintenance: { en: "Estimated maintenance", fr: "Entretien estimé", pt: "Manutenção estimada" },
  years_word: { en: "years", fr: "ans", pt: "anos" },

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
  est_lifespan: { en: "Est. lifespan", fr: "Durée de vie est.", pt: "Vida útil est." },
  closing_line: {
    en: "Once you wear the outfits, the outfits should not wear you.",
    fr: "Une fois que vous portez les tenues, elles ne doivent pas vous porter.",
    pt: "Depois de vestir as roupas, as roupas não devem te vestir.",
  },

  story_continues_title: { en: "The Story Continues", fr: "L'Histoire Continue", pt: "A História Continua" },
  thank_you_wearing_care: { en: "Thank you for wearing with care.", fr: "Merci de porter avec soin.", pt: "Obrigado por usar com cuidado." },
  closing_craftsmanship_line: {
    en: "Every story begins with craftsmanship.",
    fr: "Chaque histoire commence par le savoir-faire.",
    pt: "Cada história começa com o artesanato.",
  },
  closing_stewardship_line: {
    en: "Its lasting value is shaped through thoughtful ownership, careful stewardship and the moments collected along the way.",
    fr: "Sa valeur durable se construit à travers une possession réfléchie, un entretien attentif et les moments accumulés en chemin.",
    pt: "Seu valor duradouro é moldado por uma posse cuidadosa, uma administração atenta e os momentos reunidos ao longo do caminho.",
  },
  closing_evolve_line: {
    en: "This passport will continue to evolve alongside yours.",
    fr: "Ce passeport continuera d'évoluer aux côtés du vôtre.",
    pt: "Este passaporte continuará a evoluir junto com o seu.",
  },
  return_to_wardrobe: { en: "Return to My Wardrobe", fr: "Retour à Ma Garde-robe", pt: "Voltar ao Meu Guarda-roupa" },

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
  seed_note_marais: { en: "March dinner · Paris, New York", fr: "Dîner de mars · Paris, New York", pt: "Jantar de março · Paris, Nova York" },
  seed_note_silk: { en: "June birthday · London", fr: "Anniversaire de juin · Londres", pt: "Aniversário de junho · Londres" },
  seed_note_linen: { en: "Last: Lisbon trip", fr: "Dernière fois : voyage à Lisbonne", pt: "Última vez: viagem a Lisboa" },
  search_placeholder: { en: "Search for journal entry", fr: "Rechercher une entrée de journal", pt: "Buscar uma entrada do diário" },
  clear_filters: { en: "Clear filters", fr: "Effacer les filtres", pt: "Limpar filtros" },
  shown_of: { en: "of", fr: "sur", pt: "de" },
  shown_label: { en: "shown", fr: "affichés", pt: "exibidos" },
  no_entries_match: { en: "No entries match your search.", fr: "Aucune entrée ne correspond à votre recherche.", pt: "Nenhuma entrada corresponde à sua busca." },
  mark_resold: { en: "Mark resold", fr: "Marquer comme revendu", pt: "Marcar como revendido" },
  resold_badge: { en: "✓ Resold", fr: "✓ Revendu", pt: "✓ Revendido" },
  brand_label: { en: "Brand", fr: "Marque", pt: "Marca" },
  logged_label: { en: "Logged", fr: "Enregistré", pt: "Registrado" },
  the_memory: { en: "The memory", fr: "Le souvenir", pt: "A memória" },
  remove_from_wardrobe: { en: "Remove from wardrobe", fr: "Retirer de la garde-robe", pt: "Remover do guarda-roupa" },
  no_photo_added: { en: "No photo added", fr: "Aucune photo ajoutée", pt: "Nenhuma foto adicionada" },
  wardrobe_empty_title: { en: "Nothing here yet", fr: "Rien ici pour l'instant", pt: "Nada aqui ainda" },
  wardrobe_empty_subtitle: {
    en: "Scan a tag to add the first piece — and the first memory that comes with it.",
    fr: "Scannez une étiquette pour ajouter la première pièce — et le premier souvenir qui l'accompagne.",
    pt: "Escaneie uma etiqueta para adicionar a primeira peça — e a primeira memória que vem com ela.",
  },
  scan_a_tag: { en: "Scan a tag", fr: "Scanner une étiquette", pt: "Escanear uma etiqueta" },
  connection_eyebrow: { en: "Connection", fr: "Connexion", pt: "Conexão" },
  connection_error_title: { en: "Couldn't verify this passport", fr: "Impossible de vérifier ce passeport", pt: "Não foi possível verificar este passaporte" },
  connection_error_subtitle: {
    en: "Check your connection and try again. The garment's story hasn't gone anywhere.",
    fr: "Vérifiez votre connexion et réessayez. L'histoire du vêtement n'a pas disparu.",
    pt: "Verifique sua conexão e tente novamente. A história da peça não foi a lugar nenhum.",
  },
  try_again: { en: "Try again", fr: "Réessayer", pt: "Tentar novamente" },
  not_found_title: { en: "No passport found", fr: "Aucun passeport trouvé", pt: "Nenhum passaporte encontrado" },
  not_found_subtitle: {
    en: "This code doesn't match a garment we know. Rescan the tag, or check the link.",
    fr: "Ce code ne correspond à aucun vêtement connu. Rescannez l'étiquette ou vérifiez le lien.",
    pt: "Este código não corresponde a nenhuma peça conhecida. Reescaneie a etiqueta ou verifique o link.",
  },
  scan_again: { en: "Scan again", fr: "Scanner à nouveau", pt: "Escanear novamente" },
  location_error_eyebrow: { en: "Ready to pass it on", fr: "Prêt à le transmettre", pt: "Pronto para repassar" },
  location_error_title: { en: "Location isn't available", fr: "Position non disponible", pt: "Localização não disponível" },
  location_error_subtitle: {
    en: "Enter a city or postcode instead, and we'll find a tailor or donation point nearby.",
    fr: "Entrez plutôt une ville ou un code postal, et nous trouverons un tailleur ou un point de don à proximité.",
    pt: "Em vez disso, digite uma cidade ou CEP, e encontraremos um costureiro ou ponto de doação próximo.",
  },
  city_postcode: { en: "City or postcode", fr: "Ville ou code postal", pt: "Cidade ou CEP" },
  photo_added_hint: { en: "Photo added — tap to change", fr: "Photo ajoutée — touchez pour changer", pt: "Foto adicionada — toque para alterar" },
  generating_reflection: { en: "Generating a reflection…", fr: "Génération d'une réflexion…", pt: "Gerando uma reflexão…" },
  reflection_failed: { en: "Couldn't generate a reflection — try again", fr: "Impossible de générer une réflexion — réessayer", pt: "Não foi possível gerar uma reflexão — tentar novamente" },
  generate_reflection: { en: "Generate a reflection", fr: "Générer une réflexion", pt: "Gerar uma reflexão" },
  add_photo_hint: { en: "Add a photo (optional)", fr: "Ajouter une photo (facultatif)", pt: "Adicionar uma foto (opcional)" },
  search_button: { en: "Search", fr: "Rechercher", pt: "Buscar" },
  back_button: { en: "Back", fr: "Retour", pt: "Voltar" },
};

export type TranslationKey = keyof typeof dict;

const LOCALE_MAP: Record<Lang, string> = { en: "en-US", fr: "fr-FR", pt: "pt-PT" };

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  locale: string;
}>({
  lang: "en",
  setLang: () => {},
  t: (key) => dict[key]?.en ?? String(key),
  locale: "en-US",
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
  const t = (key: TranslationKey) => {
    const entry = dict[key];
    if (!entry) {
      // A missing dictionary entry is a real bug (like the accidentally-
      // deleted care_tier_excellent key), but the raw key name — e.g.
      // "care_tier_excellent" — must never render as visible copy. Warn
      // loudly in development so it gets caught, fail silently (empty
      // string) in production so a person never sees an implementation
      // detail.
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key: "${key}"`);
      }
      return "";
    }
    return entry[lang] ?? entry.en ?? "";
  };
  const locale = LOCALE_MAP[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
