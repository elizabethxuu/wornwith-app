import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import { isLang, langFromPathname, localizedUrl, type Lang } from "./langUrl";

export type { Lang };

const STORAGE_KEY = "wornwith:lang";

// Every user-facing string in the app, keyed and translated. Data values
// that are proper nouns, measurements, or codes (place names, percentages,
// certification codes, DPP IDs) intentionally stay as-is across languages.
// That's normal for real product passports too (a GOTS certificate doesn't
// get translated).
export const dict = {
  // Skeleton loader
  dpp_eyebrow: { en: "Digital Product Passport", fr: "Passeport Numérique Produit", pt: "Passaporte Digital do Produto" },
  verifying: { en: "Verifying passport…", fr: "Vérification du passeport…", pt: "Verificando passaporte…" },

  // Camera scan
  qr_scan_successful: { en: "QR scan successful", fr: "Scan QR réussi", pt: "Digitalização de QR concluída" },

  // Welcome
  archive_label: { en: "Archive", fr: "Archive", pt: "Arquivo" },
  archive_tagline: { en: "The Digital Archive", fr: "L'Archive Numérique", pt: "O Arquivo Digital" },
  enter_archive: { en: "Enter the Archive", fr: "Entrer dans l'archive", pt: "Entrar no arquivo" },
  welcome_by: {
    en: "By Elizabeth Xu",
    fr: "Par Elizabeth Xu",
    pt: "Por Elizabeth Xu",
  },
  welcome_tagline: {
    en: "A living record of this garment's materials, care, and journey.",
    fr: "Un registre vivant des matériaux, de l'entretien et du parcours de ce vêtement.",
    pt: "Um registro vivo dos materiais, do cuidado e da jornada desta peça.",
  },
  stat_illustrative: {
    en: "Illustrative",
    fr: "Illustratif",
    pt: "Ilustrativo",
  },
  impact_illustrative_note: {
    en: "Illustrative estimates for this demo. These figures were not measured or independently verified.",
    fr: "Estimations illustratives pour cette démo. Ces chiffres n'ont pas été mesurés ni vérifiés de manière indépendante.",
    pt: "Estimativas ilustrativas para esta demonstração. Estes números não foram medidos nem verificados de forma independente.",
  },
  contents_title: {
    en: "Passport contents",
    fr: "Contenu du passeport",
    pt: "Conteúdo do passaporte",
  },
  contents_overview: {
    en: "Overview",
    fr: "Aperçu",
    pt: "Visão geral",
  },
  contents_journey: {
    en: "Journey",
    fr: "Parcours",
    pt: "Jornada",
  },
  contents_materials: {
    en: "Materials and Supply Chain",
    fr: "Matériaux et chaîne d'approvisionnement",
    pt: "Materiais e cadeia de suprimentos",
  },
  contents_care: {
    en: "Care",
    fr: "Entretien",
    pt: "Cuidado",
  },
  contents_environment: {
    en: "Environmental Performance",
    fr: "Performance environnementale",
    pt: "Desempenho ambiental",
  },
  contents_ownership: {
    en: "Ownership",
    fr: "Propriété",
    pt: "Propriedade",
  },
  contents_story: {
    en: "Story",
    fr: "Histoire",
    pt: "História",
  },
  contents_share: {
    en: "Share this passport",
    fr: "Partager ce passeport",
    pt: "Compartilhar este passaporte",
  },
  hero_caption: {
    en: "A winter morning along the river. The collar lifts against the wind, and the wool holds its quiet warmth. The city hurries by. She takes her time.",
    fr: "Un matin d'hiver le long du fleuve. Le col se relève contre le vent, et la laine garde sa chaleur discrète. La ville se hâte. Elle prend son temps.",
    pt: "Uma manhã de inverno junto ao rio. A gola se ergue contra o vento, e a lã guarda o seu calor discreto. A cidade corre. Ela leva o seu tempo.",
  },
  sound_on_label: { en: "Sound on", fr: "Son activé", pt: "Som ligado" },
  sound_off_label: { en: "Sound off", fr: "Son coupé", pt: "Som desligado" },
  sound_turn_on: { en: "Turn ambient sound on", fr: "Activer le son d'ambiance", pt: "Ligar o som ambiente" },
  sound_turn_off: { en: "Turn ambient sound off", fr: "Couper le son d'ambiance", pt: "Desligar o som ambiente" },
  sound_pause: { en: "Pause ambient sound", fr: "Mettre le son d'ambiance en pause", pt: "Pausar o som ambiente" },
  sound_play: { en: "Play ambient sound", fr: "Reprendre le son d'ambiance", pt: "Retomar o som ambiente" },
  hero_explore: { en: "Explore the journey", fr: "Découvrir le parcours", pt: "Explorar a jornada" },
  hero_details: { en: "Passport details", fr: "Détails du passeport", pt: "Detalhes do passaporte" },
  hero_menu: { en: "Menu", fr: "Menu", pt: "Menu" },
  tool_search: { en: "Search", fr: "Rechercher", pt: "Pesquisar" },
  tool_voice: { en: "Ask or speak", fr: "Demander ou parler", pt: "Perguntar ou falar" },
  tool_dark: { en: "Dark mode", fr: "Mode sombre", pt: "Modo escuro" },
  tool_light: { en: "Light mode", fr: "Mode clair", pt: "Modo claro" },
  tool_language: { en: "Language", fr: "Langue", pt: "Idioma" },
  tool_search_placeholder: { en: "Search the passport and your wardrobe", fr: "Rechercher dans le passeport et la garde-robe", pt: "Pesquisar no passaporte e no guarda-roupa" },
  tool_search_none: { en: "Nothing found. Try another word.", fr: "Aucun résultat. Essayez un autre mot.", pt: "Nada encontrado. Tente outra palavra." },
  tool_search_wardrobe: { en: "In your wardrobe", fr: "Dans votre garde-robe", pt: "No seu guarda-roupa" },
  search_hint_materials: { en: "material wool recycled made in italy portugal certifications supply chain mill", fr: "matiere laine recyclee fabrique italie portugal certifications chaine approvisionnement", pt: "material la reciclada feito italia portugal certificacoes cadeia suprimentos" },
  search_hint_journey: { en: "journey map lifecycle where it came from farm new zealand", fr: "parcours carte cycle de vie origine ferme nouvelle zelande", pt: "jornada mapa ciclo de vida origem fazenda nova zelandia" },
  search_hint_care: { en: "care wash steam brush fold store repair", fr: "entretien laver vapeur brosser plier ranger reparer", pt: "cuidado lavar vapor escovar dobrar guardar reparar" },
  search_hint_environment: { en: "environment impact co2 water recyclability sustainability", fr: "environnement impact co2 eau recyclabilite durabilite", pt: "ambiente impacto co2 agua reciclabilidade sustentabilidade" },
  search_hint_story: { en: "story paris new zealand chapter", fr: "histoire paris nouvelle zelande chapitre", pt: "historia paris nova zelandia capitulo" },
  search_hint_ownership: { en: "ownership moment wear log save note voice", fr: "propriete moment porter enregistrer note voix", pt: "propriedade momento usar registrar nota voz" },
  search_hint_wardrobe: { en: "wardrobe outfits today's edit ask listen", fr: "garde-robe tenues selection du jour demander ecouter", pt: "guarda-roupa looks selecao do dia perguntar ouvir" },
  search_hint_overview: { en: "overview passport coat cos details", fr: "apercu passeport manteau cos details", pt: "visao geral passaporte casaco cos detalhes" },
  hero_next: { en: "Next: Journey", fr: "Suivant : Parcours", pt: "Próximo: Jornada" },
  welcome_to: { en: "Welcome to", fr: "Bienvenue sur", pt: "Bem-vindo ao" },
  what_is_this: { en: "What is this?", fr: "Qu'est-ce que c'est ?", pt: "O que é isto?" },
  dpp_explainer_short: {
    en: "Every garment sold in the EU will soon carry a Digital Product Passport. This is one designer's take on how it could feel.",
    fr: "Tout vêtement vendu dans l'UE portera bientôt un Passeport Numérique Produit. Voici la vision d'une créatrice de ce que cela pourrait être.",
    pt: "Toda peça vendida na UE terá em breve um Passaporte Digital do Produto. Esta é a visão de uma designer de como isso poderia ser.",
  },
  stamps_eyebrow: { en: "The last page", fr: "La dernière page", pt: "A última página" },
  stamps_page_title: { en: "Where it's been", fr: "Où il est allé", pt: "Por onde passou" },
  stamps_progress: { en: "{n} of {total} stamps collected", fr: "{n} tampons sur {total}", pt: "{n} de {total} carimbos" },
  stamps_complete: { en: "Passport complete. Every stop, stamped.", fr: "Passeport complet. Chaque étape, tamponnée.", pt: "Passaporte completo. Cada parada, carimbada." },
  stamps_missing: { en: "Not yet", fr: "Pas encore", pt: "Ainda não" },
  stamps_how: { en: "Open each stop on the Journey to collect its stamp", fr: "Ouvrez chaque étape du parcours pour obtenir son tampon", pt: "Abra cada parada da jornada para ganhar o carimbo" },
  stamps_secret: { en: "You found the last page.", fr: "Vous avez trouvé la dernière page.", pt: "Você encontrou a última página." },
  stamps_end_mark: { en: "Turn the page", fr: "Tournez la page", pt: "Vire a página" },
  stamps_end_complete: { en: "Passport complete ✦", fr: "Passeport complet ✦", pt: "Passaporte completo ✦" },
  owner_stamps_title: { en: "Your stamps", fr: "Vos tampons", pt: "Seus carimbos" },
  owner_stamps_sub: { en: "Where it has been with you. Add the places worth remembering.", fr: "Là où il vous a accompagné. Ajoutez les lieux qui comptent.", pt: "Por onde passou com você. Adicione os lugares que valem a lembrança." },
  owner_stamp_top: { en: "WORN WITH CARE", fr: "PORTÉ AVEC SOIN", pt: "USADO COM CUIDADO" },
  owner_stamp_add: { en: "Add a stamp", fr: "Ajouter", pt: "Adicionar" },
  owner_stamp_place: { en: "Where", fr: "Où", pt: "Onde" },
  owner_stamp_place_ph: { en: "Copenhagen", fr: "Copenhague", pt: "Copenhague" },
  owner_stamp_when: { en: "When", fr: "Quand", pt: "Quando" },
  owner_stamp_note: { en: "A line (optional)", fr: "Un mot (facultatif)", pt: "Uma frase (opcional)" },
  owner_stamp_note_ph: { en: "First snow", fr: "Première neige", pt: "Primeira neve" },
  owner_stamp_submit: { en: "Stamp it", fr: "Tamponner", pt: "Carimbar" },
  owner_stamp_remove: { en: "Remove", fr: "Retirer", pt: "Remover" },
  owner_stamp_from: { en: "from {name}", fr: "de {name}", pt: "de {name}" },
  story_card_title: { en: "Story card", fr: "Carte story", pt: "Cartão story" },
  story_card_desc: { en: "An image of its journey and stamps, sized for Instagram stories.", fr: "Une image de son parcours et de ses tampons, au format story Instagram.", pt: "Uma imagem da jornada e dos carimbos, no formato de story do Instagram." },
  story_card_action: { en: "Make the card", fr: "Créer la carte", pt: "Criar o cartão" },
  story_card_making: { en: "Inking…", fr: "Encrage…", pt: "Carimbando…" },
  story_card_share: { en: "Share", fr: "Partager", pt: "Compartilhar" },
  story_card_save: { en: "Save image", fr: "Enregistrer", pt: "Salvar imagem" },
  story_card_eyebrow: { en: "My coat has travelled", fr: "Mon manteau a parcouru", pt: "Meu casaco percorreu" },
  story_card_route: { en: "New Zealand → Biella → Porto → Paris → me", fr: "Nouvelle-Zélande → Biella → Porto → Paris → moi", pt: "Nova Zelândia → Biella → Porto → Paris → eu" },
  story_card_own: { en: "and {n} stamps of its own, with me", fr: "et {n} tampons rien qu'à lui, avec moi", pt: "e {n} carimbos só seus, comigo" },
  story_card_own_one: { en: "and one stamp of its own, with me", fr: "et un tampon rien qu'à lui, avec moi", pt: "e um carimbo só seu, comigo" },
  story_card_coat: { en: "COS Black Wool Funnel-Neck Coat", fr: "Manteau COS en laine noire", pt: "Casaco COS de lã preta" },
  story_card_footer: { en: "Its passport · wornwith.care", fr: "Son passeport · wornwith.care", pt: "O passaporte · wornwith.care" },
  handover_title: { en: "Pass it on", fr: "Transmettre", pt: "Passar adiante" },
  handover_desc: { en: "Giving or selling the coat? Send its passport to the next owner, with a note and your stamps.", fr: "Vous donnez ou vendez le manteau ? Envoyez son passeport au prochain propriétaire, avec un mot et vos tampons.", pt: "Vai dar ou vender o casaco? Envie o passaporte ao próximo dono, com um bilhete e seus carimbos." },
  handover_action: { en: "Write a note", fr: "Écrire un mot", pt: "Escrever um bilhete" },
  handover_name_ph: { en: "Your name (optional)", fr: "Votre nom (facultatif)", pt: "Seu nome (opcional)" },
  handover_note_ph: { en: "A note for whoever wears it next…", fr: "Un mot pour celle ou celui qui le portera…", pt: "Um bilhete para quem usar depois…" },
  handover_include: { en: "Include my {n} stamps", fr: "Inclure mes {n} tampons", pt: "Incluir meus {n} carimbos" },
  handover_privacy: { en: "Your note and stamps travel inside the link itself. Anyone with the link can read them.", fr: "Votre mot et vos tampons voyagent dans le lien lui-même. Toute personne ayant le lien peut les lire.", pt: "O bilhete e os carimbos vão dentro do próprio link. Quem tiver o link pode lê-los." },
  handover_submit: { en: "Send the passport", fr: "Envoyer le passeport", pt: "Enviar o passaporte" },
  handover_link_label: { en: "Your handover link", fr: "Votre lien de transmission", pt: "Seu link de entrega" },
  handover_share_title: { en: "This coat is yours now", fr: "Ce manteau est à vous", pt: "Este casaco agora é seu" },
  handover_share_text: { en: "Its passport, and a note from me.", fr: "Son passeport, et un mot de ma part.", pt: "O passaporte dele, e um bilhete meu." },
  handover_someone: { en: "A previous owner", fr: "Un ancien propriétaire", pt: "Um dono anterior" },
  handover_chapter: { en: "Chapter {n}", fr: "Chapitre {n}", pt: "Capítulo {n}" },
  handover_welcome_title: { en: "This coat is yours now.", fr: "Ce manteau est à vous.", pt: "Este casaco agora é seu." },
  handover_welcome_sub: { en: "{name} passed it on, along with its passport.", fr: "{name} vous l'a transmis, avec son passeport.", pt: "{name} passou adiante, junto com o passaporte." },
  handover_stamps: { en: "It arrives with {n} stamps from its last life.", fr: "Il arrive avec {n} tampons de sa vie d'avant.", pt: "Ele chega com {n} carimbos da vida anterior." },
  handover_stamps_one: { en: "It arrives with one stamp from its last life.", fr: "Il arrive avec un tampon de sa vie d'avant.", pt: "Ele chega com um carimbo da vida anterior." },
  handover_begin: { en: "Begin my chapter", fr: "Commencer mon chapitre", pt: "Começar meu capítulo" },
  handover_later: { en: "Not now", fr: "Plus tard", pt: "Agora não" },
  coat_voice_listen: { en: "Hear it tell its story", fr: "L'écouter raconter son histoire", pt: "Ouvir a sua história" },
  coat_voice_stop: { en: "Stop", fr: "Arrêter", pt: "Parar" },
  coat_voice_unavailable: { en: "Voice isn't available in this browser.", fr: "La voix n'est pas disponible dans ce navigateur.", pt: "A voz não está disponível neste navegador." },
  coat_voice_script: {
    en: "I began as wool on the Canterbury Plains, in New Zealand. In Biella, third-generation millers spun me into yarn and wove me into cloth. In Porto, careful hands cut and sewed me into a coat, made to be repaired rather than replaced. I've come twenty-one thousand four hundred kilometres to be here, with you. Wear me well. And one day, pass me on.",
    fr: "J'ai commencé comme laine, dans les plaines de Canterbury, en Nouvelle-Zélande. À Biella, des filateurs de troisième génération m'ont filé et tissé. À Porto, des mains attentives m'ont coupé et cousu pour faire de moi un manteau, pensé pour être réparé plutôt que remplacé. J'ai parcouru vingt et un mille quatre cents kilomètres pour être ici, avec vous. Portez-moi bien. Et un jour, transmettez-moi.",
    pt: "Comecei como lã nas planícies de Canterbury, na Nova Zelândia. Em Biella, fiandeiros de terceira geração me transformaram em fio e me teceram. No Porto, mãos cuidadosas me cortaram e coseram num casaco, feito para ser reparado em vez de substituído. Percorri vinte e um mil e quatrocentos quilómetros para estar aqui, consigo. Use-me bem. E um dia, passe-me adiante.",
  },
  stamps_title: { en: "Where it's been", fr: "Où il est allé", pt: "Por onde passou" },
  stamps_hint: { en: "Tap a stamp to find it on the map", fr: "Touchez un tampon pour le retrouver sur la carte", pt: "Toque num carimbo para vê-lo no mapa" },
  stamp_grown: { en: "WOOL GROWN", fr: "LAINE", pt: "LÃ" },
  stamp_spun: { en: "SPUN & WOVEN", fr: "FILÉ & TISSÉ", pt: "FIAÇÃO" },
  stamp_sewn: { en: "CUT & SEWN", fr: "CONFECTION", pt: "CONFECÇÃO" },
  stamp_arrived: { en: "ARRIVED", fr: "ARRIVÉ", pt: "CHEGOU" },
  dpp_explainer: {
    en: "A Digital Product Passport is a record every garment sold in the EU will be required to carry by 2028–2030, where it was made, what it's made of, and how to care for it. This is one designer's take on what that moment could actually feel like.",
    fr: "Un Passeport Numérique Produit est un enregistrement que chaque vêtement vendu dans l'UE devra porter d'ici 2028–2030, où il a été fabriqué, de quoi il est fait, et comment en prendre soin. Voici la vision d'une créatrice de ce moment.",
    pt: "Um Passaporte Digital do Produto é um registro que toda peça de roupa vendida na UE deverá ter até 2028–2030, onde foi feita, do que é feita e como cuidar dela. Esta é a visão de uma designer sobre como esse momento poderia ser.",
  },
  verified_passport: { en: "Signed Passport Record", fr: "Dossier du passeport signé", pt: "Registro do passaporte assinado" },
  show_on_map: { en: "show on map", fr: "voir sur la carte", pt: "ver no mapa" },
  espr_badge_caption: { en: "View record", fr: "Voir le dossier", pt: "Ver registro" },
  espr_verification_label: { en: "ESPR Verification", fr: "Vérification ESPR", pt: "Verificação ESPR" },
  stored_ledger: { en: "Stored on secure digital ledger", fr: "Stocké sur un registre numérique sécurisé", pt: "Armazenado em registro digital seguro" },
  passport_id_label: { en: "Passport ID", fr: "ID du Passeport", pt: "ID do Passaporte" },
  display_code_label: { en: "Display code", fr: "Code d'affichage", pt: "Código de exibição" },
  eu_regulated: { en: "EU Regulated · ESPR 2028–2030", fr: "Réglementé par l'UE · ESPR 2028–2030", pt: "Regulado pela UE · ESPR 2028–2030" },
  tap_pin_hint: {
    en: "Tap a stop to learn more · pinch to zoom",
    fr: "Touchez une étape pour en savoir plus · pincez pour zoomer",
    pt: "Toque em uma etapa para saber mais · belisque para ampliar",
  },
  rws_explainer: {
    en: "Responsible Wool Standard: an independent certification verifying the wool came from farms that meet strict animal welfare and land management requirements.",
    fr: "Norme de Laine Responsable (RWS) : une certification indépendante garantissant que la laine provient de fermes respectant des exigences strictes en matière de bien-être animal et de gestion des terres.",
    pt: "Padrão de Lã Responsável (RWS): uma certificação independente que garante que a lã veio de fazendas que atendem a rigorosos requisitos de bem-estar animal e gestão da terra.",
  },
  stop_blurb_nz: {
    en: "Where the coat's story begins: wool sheared from sheep raised on open pasture.",
    fr: "Là où l'histoire du manteau commence : laine tondue sur des moutons élevés en plein pâturage.",
    pt: "Onde a história do casaco começa: lã tosquiada de ovelhas criadas em pastagens abertas.",
  },
  stop_blurb_italy: {
    en: "Raw wool is cleaned, spun into yarn, and woven into cloth by third-generation millers.",
    fr: "La laine brute est nettoyée, filée puis tissée par des artisans de troisième génération.",
    pt: "A lã bruta é limpa, fiada e tecida por moleiros de terceira geração.",
  },
  stop_blurb_portugal: {
    en: "Skilled hands cut and construct each panel, the same ateliers COS has worked with for years.",
    fr: "Des mains expertes coupent et assemblent chaque panneau, les mêmes ateliers depuis des années.",
    pt: "Mãos habilidosas cortam e montam cada painel, os mesmos ateliês há anos.",
  },
  stop_blurb_paris: {
    en: "The coat's most recent chapter, wherever you are, right now, wearing it.",
    fr: "Le dernier chapitre du manteau, où que vous soyez, en ce moment, en le portant.",
    pt: "O capítulo mais recente do casaco, onde quer que você esteja, agora, usando-o.",
  },
  viewed_times: { en: "This passport has been viewed", fr: "Ce passeport a été consulté", pt: "Este passaporte foi visualizado" },
  every_place_note: { en: "Every place adds to its story.", fr: "Chaque lieu enrichit son histoire.", pt: "Cada lugar acrescenta à sua história." },
  times_suffix: { en: "times", fr: "fois", pt: "vezes" },

  // Product overview
  dpp_verified: { en: "Signed record", fr: "Dossier signé", pt: "Registro assinado" },
  wool_jacket: { en: "Wool Jacket", fr: "Veste en Laine", pt: "Casaco de Lã" },
  tagline_coat: {
    en: "Considered materials, timeless style",
    fr: "Matériaux choisis avec soin, style intemporel",
    pt: "Materiais cuidadosamente escolhidos, estilo atemporal",
  },

  product_editorial_label: { en: "Crafted to Last", fr: "Conçu pour Durer", pt: "Feito para Durar" },
  product_editorial_headline: {
    en: "This coat was designed to become part of your life, not just your wardrobe.",
    fr: "Ce manteau a été conçu pour faire partie de votre vie, pas seulement de votre garde-robe.",
    pt: "Este casaco foi feito para fazer parte da sua vida, não apenas do seu guarda-roupa.",
  },
  product_editorial_copy_1: {
    en: "A timeless wool silhouette made from 70% recycled fibres,",
    fr: "Une silhouette intemporelle en laine composée à 70% de fibres recyclées,",
    pt: "Uma silhueta atemporal em lã feita com 70% de fibras recicladas,",
  },
  product_editorial_copy_2: {
    en: "crafted in Portugal using Italian-spun wool,",
    fr: "confectionnée au Portugal à partir de laine filée en Italie,",
    pt: "confeccionada em Portugal com lã fiada na Itália,",
  },
  product_editorial_copy_3: {
    en: "and designed to be repaired rather than replaced.",
    fr: "conçue pour être réparée plutôt que remplacée.",
    pt: "feita para ser reparada em vez de substituída.",
  },
  product_editorial_cta: { en: "Explore its journey", fr: "Découvrir son parcours", pt: "Explorar sua jornada" },
  material: { en: "Material", fr: "Matériau", pt: "Material" },
  made_in: { en: "Made in", fr: "Fabriqué en", pt: "Fabricado em" },
  certified: {
    en: "Certifications",
    fr: "Certifications",
    pt: "Certificações",
  },
  lifespan: { en: "Lifespan", fr: "Durée de vie", pt: "Vida útil" },
  repairability: { en: "Repairability", fr: "Réparabilité", pt: "Reparabilidade" },
  material_value: { en: "70% Recycled Wool", fr: "70% de laine recyclée", pt: "70% de lã reciclada" },
  product_name_l1: { en: "COS Black Wool", fr: "Manteau en Laine Noire", pt: "Casaco de Lã Preta" },
  product_name_l2: { en: "Funnel-Neck Coat", fr: "à Col Cheminée COS", pt: "com Gola Funil COS" },
  made_in_value: { en: "Italy & Portugal", fr: "Italie et Portugal", pt: "Itália e Portugal" },
  wears_5: { en: "5 wears", fr: "5 usages", pt: "5 usos" },
  wears_30: { en: "30 wears", fr: "30 usages", pt: "30 usos" },
  wears_100: { en: "100 wears", fr: "100 usages", pt: "100 usos" },
  impact_per_wear: { en: "Impact per wear", fr: "Impact par port", pt: "Impacto por uso" },
  atelier_title: { en: "The Atelier", fr: "L'Atelier", pt: "O Ateliê" },
  atelier_intro: {
    en: "Care is less about maintenance and more about preserving the shape, texture and character of a garment over time.",
    fr: "L'entretien est moins une question de maintenance que de préservation de la forme, de la texture et du caractère d'un vêtement au fil du temps.",
    pt: "Cuidar é menos sobre manutenção e mais sobre preservar a forma, a textura e o caráter de uma peça ao longo do tempo.",
  },
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
  owned_since_date: { en: "1 April 2026", fr: "1er avril 2026", pt: "1 de abril de 2026" },
  times_worn: { en: "Times worn", fr: "Fois porté", pt: "Vezes usado" },
  condition: { en: "Condition", fr: "État", pt: "Condição" },
  excellent: { en: "Excellent", fr: "Excellent", pt: "Excelente" },
  lifespan_value: { en: "8–10 years", fr: "8 à 10 ans", pt: "8–10 anos" },
  verified_date_value: { en: "5 April 2026", fr: "5 avril 2026", pt: "5 de abril de 2026" },
  story_date_value: { en: "5 April 2026", fr: "5 avril 2026", pt: "5 de abril de 2026" },
  blockchain_word: { en: "on Base", fr: "sur Base", pt: "na Base" },
  product_hero_alt: { en: "Black wool funnel-neck coat.", fr: "Manteau en laine noire à col cheminée.", pt: "Casaco de lã preta com gola funil." },

  // Product lifecycle
  lifecycle_eyebrow: { en: "Product Lifecycle", fr: "Cycle de Vie du Produit", pt: "Ciclo de Vida do Produto" },
  where_from: { en: "Where did it come from?", fr: "D'où vient-il ?", pt: "De onde ele veio?" },
  km_traveled: { en: "21,400 km from farm to your hands", fr: "21 400 km de la ferme à vos mains", pt: "21.400 km da fazenda até suas mãos" },
  more_details: { en: "More details", fr: "Plus de détails", pt: "Mais detalhes" },
  by_sea: { en: "by sea", fr: "par mer", pt: "por mar" },
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
  verified: {
    en: "Example",
    fr: "Exemple",
    pt: "Exemplo",
  },
  ai_reflection_label: {
    en: "An AI interpretation of what you wrote. Not a verified fact about this garment.",
    fr: "Une interprétation par IA de ce que vous avez écrit. Pas un fait vérifié sur ce vêtement.",
    pt: "Uma interpretação por IA do que você escreveu. Não é um fato verificado sobre esta peça.",
  },
  status_verified: { en: "Verified", fr: "Vérifié", pt: "Verificado" },
  status_manufacturer: { en: "Manufacturer-declared", fr: "Déclaré par le fabricant", pt: "Declarado pelo fabricante" },
  status_owner: { en: "Owner-provided", fr: "Fourni par le propriétaire", pt: "Fornecido pelo proprietário" },
  status_estimated: { en: "Estimated", fr: "Estimé", pt: "Estimado" },
  status_pending: { en: "Pending verification", fr: "En attente de vérification", pt: "Aguardando verificação" },
  status_unavailable: { en: "Not available", fr: "Non disponible", pt: "Não disponível" },
  audit_source_note: {
    en: "Cited reference BV-2025-09871 (Bureau Veritas) has not been checked against a source document. Evidence needed: the audit report or a certificate that can be confirmed with the issuer.",
    fr: "La référence citée BV-2025-09871 (Bureau Veritas) n'a pas été vérifiée par rapport à un document source. Preuve nécessaire : le rapport d'audit ou un certificat confirmable auprès de l'émetteur.",
    pt: "A referência citada BV-2025-09871 (Bureau Veritas) não foi conferida com um documento de origem. Evidência necessária: o relatório de auditoria ou um certificado que possa ser confirmado com o emissor.",
  },
  chemical_source_note: {
    en: "No restricted-substance test report is attached to this record. Evidence needed: a laboratory report or a manufacturer declaration of conformity.",
    fr: "Aucun rapport d'essai sur les substances restreintes n'est joint à ce dossier. Preuve nécessaire : un rapport de laboratoire ou une déclaration de conformité du fabricant.",
    pt: "Nenhum relatório de ensaio de substâncias restritas está anexado a este registro. Evidência necessária: um relatório laboratorial ou uma declaração de conformidade do fabricante.",
  },
  reach_info: { en: "REACH: restricted-substance status", fr: "REACH : statut des substances restreintes", pt: "REACH: status de substâncias restritas" },
  reach_info_value: { en: "No test report on file", fr: "Aucun rapport d'essai au dossier", pt: "Nenhum relatório de ensaio registrado" },
  ethical_audit: { en: "Ethical Audit", fr: "Audit Éthique", pt: "Auditoria Ética" },
  fair_wages: { en: "Fair wages", fr: "Salaires équitables", pt: "Salários justos" },
  health_safety: { en: "Health & safety", fr: "Santé et sécurité", pt: "Saúde e segurança" },
  no_forced_labour: { en: "No forced labour", fr: "Pas de travail forcé", pt: "Sem trabalho forçado" },
  passed: { en: "Passed", fr: "Réussi", pt: "Aprovado" },
  grade_a: { en: "Grade A", fr: "Note A", pt: "Nota A" },
  audited_by: { en: "Audited by Bureau Veritas · Cert #BV-2025-09871", fr: "Audité par Bureau Veritas · Cert n°BV-2025-09871", pt: "Auditado pela Bureau Veritas · Cert #BV-2025-09871" },
  audit_disclosure: {
    en: "Worn With Care is a prototype and does not audit or certify garments. Statuses show where each claim comes from.",
    fr: "Worn With Care est un prototype et n'audite ni ne certifie les vêtements. Les statuts indiquent l'origine de chaque affirmation.",
    pt: "A Worn With Care é um protótipo e não audita nem certifica peças. Os status mostram a origem de cada afirmação.",
  },
  chemical_compliance: { en: "Chemical Compliance", fr: "Conformité Chimique", pt: "Conformidade Química" },
  reach_compliant: { en: "REACH Compliant · No restricted substances detected", fr: "Conforme REACH · Aucune substance restreinte détectée", pt: "Conforme REACH · Nenhuma substância restrita detectada" },
  economic_operator: { en: "Economic Operator", fr: "Opérateur Économique", pt: "Operador Econômico" },
  economic_operator_value: {
    en: "Brand entity (placeholder)",
    fr: "Entité de la marque (fictive)",
    pt: "Entidade da marca (fictícia)",
  },
  economic_operator_note: {
    en: "In a real passport, the legal entity responsible for this product's compliance under EU regulation. Not provided in this prototype.",
    fr: "Dans un vrai passeport, l'entité juridique responsable de la conformité de ce produit selon la réglementation de l'UE. Non fournie dans ce prototype.",
    pt: "Em um passaporte real, a entidade legal responsável pela conformidade deste produto segundo a regulamentação da UE. Não fornecida neste protótipo.",
  },

  // Care guide
  designed_years: { en: "Designed for years, not seasons.", fr: "Conçu pour des années, pas des saisons.", pt: "Feito para durar anos, não estações." },
  care: { en: "Care", fr: "Entretien", pt: "Cuidado" },
  care_supporting_line: {
    en: "The small choices that keep it in rotation longer.",
    fr: "Les petits gestes qui le gardent en rotation plus longtemps.",
    pt: "As pequenas escolhas que o mantêm em uso por mais tempo.",
  },




  ritual_hand_washing_title: { en: "Hand Washing", fr: "Lavage à la Main", pt: "Lavagem à Mão" },
  ritual_hand_washing_line1: { en: "Cool water only", fr: "Eau froide uniquement", pt: "Somente água fria" },
  ritual_hand_washing_line2: { en: "30°C maximum", fr: "30°C maximum", pt: "30°C no máximo" },

  ritual_steaming_title: { en: "Steam", fr: "Vapeur", pt: "Vapor" },
  ritual_steaming_line1: { en: "Steam rather than iron.", fr: "Vapeur plutôt que fer à repasser.", pt: "Vapor em vez de ferro de passar." },

  ritual_brushing_title: { en: "Brush", fr: "Brosser", pt: "Escovar" },
  ritual_brushing_line1: { en: "Brush gently after wear.", fr: "Brosser doucement après le port.", pt: "Escovar suavemente após o uso." },

  ritual_folding_title: { en: "Fold", fr: "Plier", pt: "Dobrar" },
  ritual_folding_line1: { en: "Fold instead of hanging.", fr: "Plier plutôt que suspendre.", pt: "Dobrar em vez de pendurar." },

  ritual_storage_title: { en: "Store", fr: "Ranger", pt: "Guardar" },
  ritual_storage_line1: { en: "Store in breathable cotton.", fr: "Ranger dans du coton respirant.", pt: "Guardar em algodão respirável." },

  ritual_repair_title: { en: "Repair", fr: "Réparer", pt: "Reparar" },
  ritual_repair_line1: { en: "Repair loose stitches early.", fr: "Réparer les coutures lâches tôt.", pt: "Reparar costuras soltas cedo." },

  care_philosophy_title: { en: "Care Philosophy", fr: "Philosophie d'Entretien", pt: "Filosofia de Cuidado" },
  care_philosophy_line1: { en: "Designed to be repaired.", fr: "Conçu pour être réparé.", pt: "Feito para ser reparado." },
  care_philosophy_line2: { en: "Designed to be worn.", fr: "Conçu pour être porté.", pt: "Feito para ser usado." },
  care_philosophy_line3: { en: "Designed to stay with you.", fr: "Conçu pour rester avec vous.", pt: "Feito para ficar com você." },
  care_philosophy_maintenance_label: { en: "Estimated next maintenance", fr: "Prochain entretien estimé", pt: "Próxima manutenção estimada" },
  care_philosophy_wears_remaining: { en: "After approximately {n} more wears.", fr: "Après environ {n} ports supplémentaires.", pt: "Após aproximadamente mais {n} usos." },
  care_philosophy_quote: {
    en: "The garments we keep are the ones we care for.",
    fr: "Les vêtements que l'on garde sont ceux dont on prend soin.",
    pt: "As roupas que guardamos são as que cuidamos.",
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
  chapter_materials: { en: "Materials", fr: "Matériaux", pt: "Materiais" },
  chapter_environment: { en: "Environment", fr: "Environnement", pt: "Ambiente" },
  section_end: { en: "End", fr: "Fin", pt: "Fim" },

  wool_farming_card_title: { en: "About this wool farm", fr: "À propos de cette ferme", pt: "Sobre esta fazenda de lã" },
  wool_farming_cert_label: {
    en: "Certification (example)",
    fr: "Certification (exemple)",
    pt: "Certificação (exemplo)",
  },
  wool_farming_cert_value: { en: "Responsible Wool Standard", fr: "Norme de Laine Responsable", pt: "Padrão de Lã Responsável" },
  wool_farming_region_label: { en: "Region", fr: "Région", pt: "Região" },
  wool_farming_region_value: { en: "Canterbury Plains, New Zealand", fr: "Canterbury Plains, Nouvelle-Zélande", pt: "Canterbury Plains, Nova Zelândia" },
  wool_farming_climate_label: { en: "Climate", fr: "Climat", pt: "Clima" },
  wool_farming_climate_value: { en: "Temperate, ideal for merino", fr: "Tempéré, idéal pour le mérinos", pt: "Temperado, ideal para merino" },
  wool_farming_season_label: { en: "Shearing season", fr: "Saison de tonte", pt: "Temporada de tosquia" },
  wool_farming_season_value: { en: "Spring (Sept–Nov)", fr: "Printemps (sept.–nov.)", pt: "Primavera (set.–nov.)" },

  manufacturing_card_title: { en: "About this mill", fr: "À propos de cette filature", pt: "Sobre esta fábrica" },
  manufacturing_mill_label: { en: "Mill", fr: "Filature", pt: "Fábrica" },
  manufacturing_mill_value: { en: "Biella Wool Mill", fr: "Filature de Biella", pt: "Fábrica de Biella" },
  manufacturing_family_label: { en: "Family owned", fr: "Entreprise familiale", pt: "Empresa familiar" },
  manufacturing_family_value: { en: "Yes, 3rd generation", fr: "Oui, 3e génération", pt: "Sim, 3ª geração" },
  manufacturing_since_label: { en: "Operating since", fr: "En activité depuis", pt: "Em operação desde" },
  manufacturing_since_value: { en: "1938", fr: "1938", pt: "1938" },
  manufacturing_renewable_label: { en: "Renewable energy", fr: "Énergie renouvelable", pt: "Energia renovável" },
  manufacturing_renewable_value: { en: "65%", fr: "65%", pt: "65%" },

  learn_wool_farm: { en: "Learn about the wool farm", fr: "Découvrir la ferme de laine", pt: "Conhecer a fazenda de lã" },
  view_this_chapter: { en: "View this chapter", fr: "Voir ce chapitre", pt: "Ver este capítulo" },

  atelier_card_title: { en: "About this atelier", fr: "À propos de cet atelier", pt: "Sobre este ateliê" },
  atelier_name_label: { en: "Atelier", fr: "Atelier", pt: "Ateliê" },
  atelier_name_value: { en: "Porto Atelier", fr: "Atelier de Porto", pt: "Ateliê do Porto" },
  atelier_founded_label: { en: "Established", fr: "Fondé en", pt: "Fundado em" },
  atelier_founded_value: { en: "1962", fr: "1962", pt: "1962" },
  atelier_specialism_label: { en: "Specialism", fr: "Spécialité", pt: "Especialidade" },
  atelier_specialism_value: { en: "Precision tailoring & construction", fr: "Tailleur de précision et construction", pt: "Alfaiataria de precisão e construção" },
  atelier_hands_label: { en: "Hands per garment", fr: "Mains par vêtement", pt: "Mãos por peça" },
  atelier_hands_value: { en: "12", fr: "12", pt: "12" },

  chapter_card_title: { en: "About this chapter", fr: "À propos de ce chapitre", pt: "Sobre este capítulo" },
  chapter_status_label: { en: "Status", fr: "Statut", pt: "Status" },
  chapter_status_value: { en: "In active use", fr: "En usage actif", pt: "Em uso ativo" },
  chapter_verified_label: {
    en: "Logged",
    fr: "Enregistré",
    pt: "Registrado",
  },
  chapter_owner_label: { en: "Chapter", fr: "Chapitre", pt: "Capítulo" },
  chapter_owner_value: { en: "Ownership begins", fr: "Le début de la possession", pt: "O início da posse" },


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
  archive_framing_line: {
    en: "Your archive so far, plus what a well-cared-for coat's next few years might look like.",
    fr: "Vos archives à ce jour, ainsi qu'un aperçu des prochaines années d'un manteau bien entretenu.",
    pt: "Seu arquivo até agora, além de uma previsão dos próximos anos de um casaco bem cuidado.",
  },
  archive_projected_tag: { en: "Projected", fr: "Projeté", pt: "Projetado" },
  archive_cat_acquisition: { en: "Acquisition", fr: "Acquisition", pt: "Aquisição" },
  archive_title_acquisition: { en: "Purchased", fr: "Acheté", pt: "Comprado" },
  archive_desc_acquisition: { en: "Entered into your collection.", fr: "Entré dans votre collection.", pt: "Adicionado à sua coleção." },

  archive_cat_journey: { en: "First Journey", fr: "Premier Voyage", pt: "Primeira Jornada" },
  archive_title_journey: { en: "Weekend in Edinburgh", fr: "Week-end à Édimbourg", pt: "Fim de semana em Edimburgo" },
  archive_desc_journey: { en: "First memory recorded.", fr: "Premier souvenir enregistré.", pt: "Primeira memória registrada." },

  archive_cat_maintenance: { en: "Maintenance", fr: "Entretien", pt: "Manutenção" },
  archive_title_maintenance: { en: "Buttons may need professional repair", fr: "Les boutons pourraient nécessiter une réparation professionnelle", pt: "Os botões podem precisar de reparo profissional" },
  archive_desc_maintenance: { en: "Around year 2, based on typical wear.", fr: "Vers la 2e année, selon l'usure habituelle.", pt: "Por volta do ano 2, com base no desgaste típico." },

  archive_cat_milestone: { en: "Milestone", fr: "Étape Marquante", pt: "Marco" },
  archive_title_milestone: { en: "May reach 50 wears", fr: "Pourrait atteindre 50 ports", pt: "Pode alcançar 50 usos" },
  archive_desc_milestone: { en: "Around year 2, at typical wear frequency.", fr: "Vers la 2e année, à une fréquence d'usage habituelle.", pt: "Por volta do ano 2, em frequência de uso típica." },

  archive_cat_restoration: { en: "Restoration", fr: "Restauration", pt: "Restauração" },
  archive_title_restoration: { en: "Buttons may need replacing", fr: "Les boutons pourraient devoir être remplacés", pt: "Os botões podem precisar ser substituídos" },
  archive_desc_restoration: { en: "Around year 3, to extend service life.", fr: "Vers la 3e année, pour prolonger la durée de vie.", pt: "Por volta do ano 3, para prolongar a vida útil." },

  archive_cat_transfer: { en: "Transfer", fr: "Transfert", pt: "Transferência" },
  archive_title_transfer: { en: "Ownership may transfer", fr: "La propriété pourrait être transférée", pt: "A propriedade pode ser transferida" },
  archive_desc_transfer: { en: "If passed on, digital provenance would transfer with it.", fr: "Si transmis, la provenance numérique serait transférée avec lui.", pt: "Se repassada, a proveniência digital seria transferida junto." },

  // Curator's Notes
  curators_notes_title: { en: "Curator's Notes", fr: "Notes du Conservateur", pt: "Notas do Curador" },
  curators_notes_body: {
    en: "This garment has matured through four winters, travelled across three cities and remained in exceptional condition. Rather than being replaced, it has been maintained, repaired and continuously worn, an ownership pattern that reflects the principles of circular design. Its documented history suggests a product intended to endure well beyond the industry average.",
    fr: "Ce vêtement a mûri à travers quatre hivers, voyagé dans trois villes et est resté dans un état exceptionnel. Plutôt que d'être remplacé, il a été entretenu, réparé et porté continuellement, une habitude de possession qui reflète les principes du design circulaire. Son histoire documentée suggère un produit conçu pour durer bien au-delà de la moyenne du secteur.",
    pt: "Esta peça amadureceu ao longo de quatro invernos, viajou por três cidades e permaneceu em condição excepcional. Em vez de ser substituída, foi mantida, reparada e usada continuamente, um padrão de posse que reflete os princípios do design circular. Sua história documentada sugere um produto feito para durar muito além da média do setor.",
  },

  // Ownership Summary
  ownership_summary_title: { en: "Ownership Summary", fr: "Résumé de Propriété", pt: "Resumo de Propriedade" },
  recorded_wears: { en: "Recorded wears", fr: "Ports enregistrés", pt: "Usos registrados" },
  environmental_ranking: { en: "Environmental ranking", fr: "Classement Environnemental", pt: "Classificação Ambiental" },
  archive_entries_count: { en: "Archive entries", fr: "Entrées d'archives", pt: "Entradas no arquivo" },
  save_another_moment: { en: "+ Save another moment", fr: "+ Enregistrer un autre moment", pt: "+ Salvar outro momento" },

  // Today's Edit
  menu_edit_label: { en: "Today's Edit", fr: "Aujourd'hui", pt: "Hoje" },
  menu_tip_default: { en: "Wear it with care.", fr: "À porter avec soin.", pt: "Use com cuidado." },
  menu_tip_rain: { en: "Wear it buttoned.", fr: "À porter boutonné.", pt: "Use abotoado." },
  menu_tip_cold: { en: "Wear it closed.", fr: "À porter fermé.", pt: "Use fechado." },
  menu_tip_mild: { en: "Wear it open.", fr: "À porter ouvert.", pt: "Use aberto." },
  menu_tip_warm: { en: "Carry it, just in case.", fr: "À emporter, au cas où.", pt: "Leve-o, por via das dúvidas." },
  todays_edit_title: { en: "Today's Edit", fr: "La Sélection du Jour", pt: "A Seleção de Hoje" },
  ask_anything_placeholder: { en: "Ask anything about your wardrobe\u2026", fr: "Posez une question sur votre garde-robe\u2026", pt: "Pergunte algo sobre seu guarda-roupa\u2026" },
  ask_anything_fallback: {
    en: "I can help with questions like \u201cWhat should I wear today?\u201d, \u201cWhat haven't I worn in a while?\u201d, or \u201cWhat's ready to wear right now?\u201d",
    fr: "Je peux répondre à des questions comme \u00ab\u00a0Que devrais-je porter aujourd'hui\u00a0?\u00a0\u00bb, \u00ab\u00a0Qu'est-ce que je n'ai pas porté depuis longtemps\u00a0?\u00a0\u00bb, ou \u00ab\u00a0Qu'est-ce qui est prêt à porter maintenant\u00a0?\u00a0\u00bb",
    pt: "Posso ajudar com perguntas como \u201cO que devo vestir hoje?\u201d, \u201cO que não uso há um tempo?\u201d, ou \u201cO que está pronto para usar agora?\u201d",
  },
  ask_anything_not_worn_intro: { en: "It's been a while since you wore", fr: "Cela fait un moment que vous n'avez pas porté", pt: "Faz um tempo que você não usa" },
  ask_anything_empty_wardrobe: { en: "Add a piece to your wardrobe first, then ask again.", fr: "Ajoutez d'abord une pièce à votre garde-robe, puis reposez la question.", pt: "Adicione uma peça ao seu guarda-roupa primeiro e pergunte novamente." },
  attach_add_photo: { en: "Add a photo", fr: "Ajouter une photo", pt: "Adicionar uma foto" },
  attach_reference_garment: { en: "Reference a specific garment", fr: "Référencer une pièce précise", pt: "Referenciar uma peça específica" },
  attach_choose_garment: { en: "Choose a garment", fr: "Choisir une pièce", pt: "Escolher uma peça" },
  attach_remove_label: { en: "Remove", fr: "Supprimer", pt: "Remover" },
  mic_recording_label: { en: "Listening\u2026", fr: "Écoute en cours\u2026", pt: "Ouvindo\u2026" },
  mic_transcribing_label: { en: "Transcribing\u2026", fr: "Transcription en cours\u2026", pt: "Transcrevendo\u2026" },
  mic_transcription_failed: { en: "Couldn't hear that, try typing instead.", fr: "Impossible de comprendre, essayez de taper.", pt: "Não foi possível entender, tente digitar." },
  ask_anything_about_item: { en: "About", fr: "\u00c0 propos de", pt: "Sobre" },
  ask_anything_days_since_worn: { en: "It's been {n} days since you last wore", fr: "Cela fait {n} jours que vous n'avez pas porté", pt: "Faz {n} dias que você não usa" },
  ask_anything_never_logged: { en: "hasn't been logged as worn yet", fr: "n'a pas encore été enregistré comme porté", pt: "ainda não foi registrado como usado" },
  your_prefix: { en: "your", fr: "votre", pt: "seu" },

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
  recording_label: { en: "Recording…", fr: "Enregistrement…", pt: "Gravando…" },
  play_note_label: { en: "Play note", fr: "Lire la note", pt: "Ouvir nota" },
  note_saved_label: { en: "Saved", fr: "Enregistré", pt: "Salvo" },
  re_record_label: { en: "Re-record", fr: "Réenregistrer", pt: "Regravar" },
  delete_note_label: { en: "Delete", fr: "Supprimer", pt: "Excluir" },
  mic_unavailable: { en: "Microphone isn't available in this browser.", fr: "Le microphone n'est pas disponible dans ce navigateur.", pt: "O microfone não está disponível neste navegador." },
  mic_permission_denied: { en: "Microphone access was denied.", fr: "L'accès au microphone a été refusé.", pt: "O acesso ao microfone foi negado." },
  voice_note_transcript_label: { en: "Transcript", fr: "Transcription", pt: "Transcrição" },

  alternatives_title: { en: "Also Consider", fr: "À Considérer Aussi", pt: "Considere Também" },

  readiness_title: { en: "Garment Readiness", fr: "État de Préparation", pt: "Prontidão da Peça" },

  interlude_title: { en: "Interlude", fr: "Interlude", pt: "Interlúdio" },
  interlude_supporting: {
    en: "A quiet accompaniment to today's recommendation.",
    fr: "Un accompagnement discret à la recommandation du jour.",
    pt: "Um acompanhamento discreto para a recomendação de hoje.",
  },

  atmosphere_after_rain_title: { en: "After Rain", fr: "Après la Pluie", pt: "Depois da Chuva" },
  atmosphere_after_rain_desc_1: { en: "A cool city after rainfall.", fr: "Une ville fraîche après la pluie.", pt: "Uma cidade fresca após a chuva." },
  atmosphere_after_rain_desc_2: { en: "Soft tailoring. Quiet galleries.", fr: "Une coupe douce. Des galeries silencieuses.", pt: "Alfaiataria suave. Galerias silenciosas." },
  atmosphere_after_rain_desc_3: { en: "The sound of footsteps on old stone.", fr: "Le bruit des pas sur une pierre ancienne.", pt: "O som de passos sobre pedra antiga." },

  atmosphere_first_espresso_title: { en: "First Espresso", fr: "Premier Espresso", pt: "Primeiro Espresso" },
  atmosphere_first_espresso_desc_1: { en: "The city still half-asleep.", fr: "La ville encore à moitié endormie.", pt: "A cidade ainda meio adormecida." },
  atmosphere_first_espresso_desc_2: { en: "Steam rising from a small cup.", fr: "De la vapeur s'élevant d'une petite tasse.", pt: "Vapor subindo de uma xícara pequena." },
  atmosphere_first_espresso_desc_3: { en: "A day not yet decided.", fr: "Une journée pas encore décidée.", pt: "Um dia ainda não decidido." },

  atmosphere_north_window_title: { en: "North Window", fr: "Fenêtre Nord", pt: "Janela Norte" },
  atmosphere_north_window_desc_1: { en: "Grey light through tall glass.", fr: "Une lumière grise à travers de hautes vitres.", pt: "Luz cinzenta através de vidros altos." },
  atmosphere_north_window_desc_2: { en: "A room that asks for nothing.", fr: "Une pièce qui ne demande rien.", pt: "Um cômodo que não pede nada." },
  atmosphere_north_window_desc_3: { en: "Wool, wood smoke, and long silences.", fr: "Laine, fumée de bois et longs silences.", pt: "Lã, fumaça de lenha e longos silêncios." },

  atmosphere_winter_sun_title: { en: "Winter Sun", fr: "Soleil d'Hiver", pt: "Sol de Inverno" },
  atmosphere_winter_sun_desc_1: { en: "Low light across bare branches.", fr: "Une lumière basse sur des branches nues.", pt: "Luz baixa sobre galhos nus." },
  atmosphere_winter_sun_desc_2: { en: "A coat worth stepping out in.", fr: "Un manteau qui mérite qu'on sorte.", pt: "Um casaco que vale a pena vestir para sair." },
  atmosphere_winter_sun_desc_3: { en: "The particular clarity of cold, bright air.", fr: "La clarté particulière d'un air froid et lumineux.", pt: "A clareza particular do ar frio e luminoso." },

  atmosphere_between_seasons_title: { en: "Between Seasons", fr: "Entre les Saisons", pt: "Entre Estações" },
  atmosphere_between_seasons_desc_1: { en: "Neither warm nor cold.", fr: "Ni chaud ni froid.", pt: "Nem quente nem frio." },
  atmosphere_between_seasons_desc_2: { en: "A wardrobe caught between two seasons.", fr: "Une garde-robe prise entre deux saisons.", pt: "Um guarda-roupa entre duas estações." },
  atmosphere_between_seasons_desc_3: { en: "Light that changes its mind by the hour.", fr: "Une lumière qui change d'avis à chaque heure.", pt: "Uma luz que muda de ideia a cada hora." },

  atmosphere_quiet_modernism_title: { en: "Quiet Modernism", fr: "Modernisme Discret", pt: "Modernismo Discreto" },
  atmosphere_quiet_modernism_desc_1: { en: "Clean lines. Warm concrete.", fr: "Des lignes épurées. Du béton chaleureux.", pt: "Linhas limpas. Concreto acolhedor." },
  atmosphere_quiet_modernism_desc_2: { en: "A room that says little and means it.", fr: "Une pièce qui dit peu et le pense vraiment.", pt: "Um cômodo que diz pouco e é sincero." },
  atmosphere_quiet_modernism_desc_3: { en: "Evening arriving without announcement.", fr: "Le soir arrivant sans prévenir.", pt: "A noite chegando sem aviso." },

  atmosphere_glasshouse_title: { en: "Glasshouse", fr: "Serre de Verre", pt: "Casa de Vidro" },
  atmosphere_glasshouse_desc_1: { en: "Warm air through an open window.", fr: "Un air chaud à travers une fenêtre ouverte.", pt: "Ar quente por uma janela aberta." },
  atmosphere_glasshouse_desc_2: { en: "Green light through glass and leaves.", fr: "Une lumière verte à travers le verre et les feuilles.", pt: "Luz verde através do vidro e das folhas." },
  atmosphere_glasshouse_desc_3: { en: "A held breath before evening.", fr: "Un souffle retenu avant le soir.", pt: "Uma respiração suspensa antes do entardecer." },

  atmosphere_late_afternoon_title: { en: "Late Afternoon", fr: "Fin d'Après-midi", pt: "Fim de Tarde" },
  atmosphere_late_afternoon_desc_1: { en: "Long shadows across the room.", fr: "De longues ombres traversant la pièce.", pt: "Longas sombras atravessando o cômodo." },
  atmosphere_late_afternoon_desc_2: { en: "The day slowing down before it ends.", fr: "La journée qui ralentit avant de finir.", pt: "O dia desacelerando antes de terminar." },
  atmosphere_late_afternoon_desc_3: { en: "Coffee gone cold, forgotten mid-thought.", fr: "Un café refroidi, oublié en pleine pensée.", pt: "Um café frio, esquecido no meio de um pensamento." },

  book_note_flights: { en: "Fragments that drift like weather.", fr: "Des fragments qui dérivent comme le temps.", pt: "Fragmentos que vagam como o clima." },
  book_note_on_earth: { en: "Tender, unhurried, and quietly devastating.", fr: "Tendre, posé, et discrètement bouleversant.", pt: "Terno, sem pressa, e discretamente devastador." },
  book_note_ongoingness: { en: "Brief, exact, and quietly profound.", fr: "Bref, précis, et discrètement profond.", pt: "Breve, exato, e discretamente profundo." },
  book_note_m_train: { en: "A wandering, unhurried kind of memoir.", fr: "Un mémoire vagabond, sans hâte.", pt: "Uma memória errante, sem pressa." },
  book_note_copenhagen_trilogy: { en: "Spare, unflinching, and quietly devastating.", fr: "Sobre, sans détour, et discrètement bouleversant.", pt: "Contido, direto, e discretamente devastador." },
  book_note_a_mans_place: { en: "Precise, restrained, and deeply felt.", fr: "Précis, retenu, et profondément ressenti.", pt: "Preciso, contido, e profundamente sentido." },
  book_note_where_reasons_end: { en: "Spare and devastating in equal measure.", fr: "Sobre et bouleversant à parts égales.", pt: "Contido e devastador em igual medida." },
  book_note_outline: { en: "Observant, restrained and quietly human.", fr: "Observateur, retenu et discrètement humain.", pt: "Observador, contido e discretamente humano." },
  book_note_cost_of_living: {
    en: "A thoughtful companion for slow afternoons and changing light.",
    fr: "Une compagnie précieuse pour les après-midis lents et la lumière changeante.",
    pt: "Uma companhia pensativa para tardes lentas e luz em mudança.",
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

  // Editorial weather observations: no percentages, no technical terms
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
    en: "Thrift and Repair open a nearby-places search. Your browser may ask for location access.",
    fr: "Donner et Réparer ouvrent une recherche à proximité. Votre navigateur peut demander l'accès à votre position.",
    pt: "Doar e Consertar abrem uma busca de locais próximos. Seu navegador pode pedir acesso à localização.",
  },
  why_brands_participate: { en: "Why COS participates", fr: "Pourquoi COS participe", pt: "Por que a COS participa" },
  brand_incentive_note: {
    en: "Every resell, repair, or return routed through this passport gives COS a repeat touchpoint with you, and first right of refusal when the garment eventually leaves your closet.",
    fr: "Chaque revente, réparation ou retour effectué via ce passeport donne à COS un point de contact récurrent avec vous, et la priorité lorsque le vêtement quittera votre garde-robe.",
    pt: "Cada revenda, reparo ou devolução feito através deste passaporte dá à COS um ponto de contato recorrente com você, e prioridade quando a peça eventualmente sair do seu guarda-roupa.",
  },

  // Story
  story_behind_it: { en: "The story behind it", fr: "L'histoire derrière", pt: "A história por trás" },
  story_sentence_1: {
    en: "Your coat began on sheep farms in New Zealand,",
    fr: "Votre manteau a commencé dans des fermes ovines en Nouvelle-Zélande,",
    pt: "Seu casaco começou em fazendas de ovelhas na Nova Zelândia,",
  },
  story_sentence_2: {
    en: "before moving through European mills and into skilled hands in Portugal,",
    fr: "avant de passer par des filatures européennes puis entre des mains expertes au Portugal,",
    pt: "passou por fábricas europeias e chegou a mãos habilidosas em Portugal,",
  },
  story_sentence_3: {
    en: "designed to be worn, repaired, and passed on.",
    fr: "conçu pour être porté, réparé et transmis.",
    pt: "feito para ser usado, reparado e repassado.",
  },
  story_p2: {
    en: "Crafted from 70% recycled merino, it carries a lower footprint than 90% of comparable wool coats.",
    fr: "Confectionné à partir de 70% de mérinos recyclé, son empreinte est inférieure à 90% des manteaux en laine comparables.",
    pt: "Feito com 70% de merino reciclado, tem uma pegada menor que 90% dos casacos de lã comparáveis.",
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
  save_disclaimer: {
    en: "Changes are securely saved and may take a few moments to refresh throughout your Digital Product Passport.",
    fr: "Les modifications sont enregistrées en toute sécurité et peuvent prendre quelques instants à se refléter dans votre passeport numérique.",
    pt: "As alterações são salvas com segurança e podem levar alguns instantes para atualizar em todo o seu Passaporte Digital do Produto.",
  },
  saved_confirmation: { en: "Saved", fr: "Enregistré", pt: "Salvo" },
  footer_copyright: { en: "© 2026 Worn With Care", fr: "© 2026 Worn With Care", pt: "© 2026 Worn With Care" },
  footer_privacy: { en: "Privacy Policy", fr: "Politique de Confidentialité", pt: "Política de Privacidade" },
  footer_terms: { en: "Terms of Use", fr: "Conditions d'Utilisation", pt: "Termos de Uso" },
  legal_back: { en: "Back", fr: "Retour", pt: "Voltar" },
  close_label: { en: "Close", fr: "Fermer", pt: "Fechar" },
  footer_hide: { en: "Hide footer", fr: "Masquer le pied de page", pt: "Ocultar rodapé" },
  footer_show: { en: "Show footer", fr: "Afficher le pied de page", pt: "Mostrar rodapé" },
  menu_legal: { en: "About & legal", fr: "À propos et mentions", pt: "Sobre e avisos legais" },
  verification_panel_title: { en: "Verify this passport", fr: "Vérifier ce passeport", pt: "Verificar este passaporte" },
  verification_panel_body_pending: {
    en: "This passport's record is ready to be signed and published on Base, a public blockchain. Once it is, anyone can check that it hasn't changed since. The garment details and figures are demonstration data.",
    fr: "Le dossier de ce passeport est prêt à être signé et publié sur Base, une blockchain publique. Une fois publié, chacun pourra vérifier qu'il n'a pas changé depuis. Les détails du vêtement et les chiffres sont des données de démonstration.",
    pt: "O registro deste passaporte está pronto para ser assinado e publicado na Base, uma blockchain pública. Depois disso, qualquer pessoa poderá verificar que ele não mudou. Os detalhes da peça e os números são dados de demonstração.",
  },
  verification_panel_body: {
    en: "This passport's record is signed by its publisher and published on Base, a public blockchain. Anyone can check that it hasn't changed since it was signed. The garment details and figures are demonstration data.",
    fr: "Le dossier de ce passeport est signé par son éditeur et publié sur Base, une blockchain publique. Chacun peut vérifier qu'il n'a pas changé depuis sa signature. Les détails du vêtement et les chiffres sont des données de démonstration.",
    pt: "O registro deste passaporte é assinado por quem o publica e publicado na Base, uma blockchain pública. Qualquer pessoa pode verificar que ele não mudou desde a assinatura. Os detalhes da peça e os números são dados de demonstração.",
  },

  vr_checking: { en: "Checking the published record…", fr: "Vérification du dossier publié…", pt: "Verificando o registro publicado…" },
  vr_match_title: { en: "Signed record, published on Base", fr: "Dossier signé, publié sur Base", pt: "Registro assinado, publicado na Base" },
  vr_match_line: { en: "This page matches the published record", fr: "Cette page correspond au dossier publié", pt: "Esta página corresponde ao registro publicado" },
  vr_unpublished_title: { en: "Not yet published", fr: "Pas encore publié", pt: "Ainda não publicado" },
  vr_unpublished_sub: { en: "The record's fingerprint is ready but hasn't been published on Base yet.", fr: "L'empreinte du dossier est prête mais n'a pas encore été publiée sur Base.", pt: "A impressão digital do registro está pronta, mas ainda não foi publicada na Base." },
  vr_mismatch_title: { en: "This page doesn't match the published record", fr: "Cette page ne correspond pas au dossier publié", pt: "Esta página não corresponde ao registro publicado" },
  vr_mismatch_sub: { en: "The details shown here may have changed since the record was signed.", fr: "Les détails affichés ont peut-être changé depuis la signature du dossier.", pt: "Os detalhes mostrados podem ter mudado desde a assinatura do registro." },
  vr_revoked_title: { en: "This record was withdrawn", fr: "Ce dossier a été retiré", pt: "Este registro foi retirado" },
  vr_revoked_sub: { en: "Its publisher has revoked it on Base.", fr: "Son éditeur l'a révoqué sur Base.", pt: "Quem o publicou o revogou na Base." },
  vr_unreachable_title: { en: "Couldn't reach Base just now", fr: "Impossible de joindre Base pour le moment", pt: "Não foi possível acessar a Base agora" },
  vr_unreachable_sub: { en: "You can still check the public record yourself.", fr: "Vous pouvez tout de même consulter le dossier public.", pt: "Você ainda pode conferir o registro público." },
  vr_publisher: { en: "Publisher", fr: "Éditeur", pt: "Publicado por" },
  vr_publisher_value: { en: "Worn With Care (prototype)", fr: "Worn With Care (prototype)", pt: "Worn With Care (protótipo)" },
  vr_passport: { en: "Passport", fr: "Passeport", pt: "Passaporte" },
  vr_fingerprint: { en: "Fingerprint", fr: "Empreinte", pt: "Impressão digital" },
  vr_published: { en: "Published", fr: "Publié", pt: "Publicado" },
  vr_network: { en: "Network", fr: "Réseau", pt: "Rede" },
  vr_view_record: { en: "View public record", fr: "Voir le dossier public", pt: "Ver o registro público" },
  vr_view_data: { en: "See the signed data", fr: "Voir les données signées", pt: "Ver os dados assinados" },
  vr_demo_tag: { en: "Demonstration data", fr: "Données de démonstration", pt: "Dados de demonstração" },
  vr_resale: { en: "If this coat is resold, the next owner can check the same record.", fr: "Si ce manteau est revendu, le prochain propriétaire pourra vérifier le même dossier.", pt: "Se este casaco for revendido, o próximo dono poderá conferir o mesmo registro." },
  vr_proves: { en: "What this proves:", fr: "Ce que cela prouve :", pt: "O que isso prova:" },
  vr_proves_body: { en: "who published this record, and that it hasn't changed since.", fr: "qui a publié ce dossier, et qu'il n'a pas changé depuis.", pt: "quem publicou este registro e que ele não mudou desde então." },
  vr_not_proves: { en: "What it doesn't:", fr: "Ce que cela ne prouve pas :", pt: "O que isso não prova:" },
  vr_not_proves_body: { en: "that the details are true, or that a physical coat is this one. That takes independent audits and a secure chip in the label.", fr: "que les détails sont exacts, ni qu'un manteau physique est bien celui-ci. Il faudrait des audits indépendants et une puce sécurisée dans l'étiquette.", pt: "que os detalhes são verdadeiros, nem que um casaco físico é este. Isso exige auditorias independentes e um chip seguro na etiqueta." },
  dpp_record_pending: { en: "Passport record", fr: "Dossier du passeport", pt: "Registro do passaporte" },
  passport_record_pending: { en: "Passport Record", fr: "Dossier du passeport", pt: "Registro do passaporte" },
  vr_view_data_pending: { en: "See the record data", fr: "Voir les données du dossier", pt: "Ver os dados do registro" },
  sr_title: { en: "Part of this passport’s signed record", fr: "Fait partie du dossier signé de ce passeport", pt: "Faz parte do registro assinado deste passaporte" },
  sr_title_pending: { en: "Part of this passport’s record", fr: "Fait partie du dossier de ce passeport", pt: "Faz parte do registro deste passaporte" },
  sr_sub_materials: { en: "The stages, audits and figures on this page are in the record. Audits stay pending verification.", fr: "Les étapes, audits et chiffres de cette page figurent dans le dossier. Les audits restent en attente de vérification.", pt: "As etapas, auditorias e números desta página estão no registro. As auditorias continuam aguardando verificação." },
  sr_sub_environment: { en: "The figures on this page are in the record. They are illustrative estimates.", fr: "Les chiffres de cette page figurent dans le dossier. Ce sont des estimations illustratives.", pt: "Os números desta página estão no registro. São estimativas ilustrativas." },
  record_on_base: { en: "Published on Base", fr: "Publié sur Base", pt: "Publicado na Base" },
  record_not_published_short: { en: "Not yet published", fr: "Pas encore publié", pt: "Ainda não publicado" },

  privacy_eyebrow: { en: "Privacy", fr: "Confidentialité", pt: "Privacidade" },
  privacy_title: { en: "Your wardrobe belongs to you.", fr: "Votre garde-robe vous appartient.", pt: "Seu guarda-roupa pertence a você." },
  privacy_subtitle: {
    en: "This is a demo with no accounts. What you save stays in your own browser, and nothing you write is sold. Here is exactly what happens to it.",
    fr: "Ceci est une démo sans comptes. Ce que vous enregistrez reste dans votre propre navigateur, et rien de ce que vous écrivez n'est vendu. Voici ce qui se passe exactement.",
    pt: "Esta é uma demonstração sem contas. O que você salva fica no seu próprio navegador, e nada do que você escreve é vendido. Veja exatamente o que acontece.",
  },
  privacy_s1_title: {
    en: "Stays on your device",
    fr: "Reste sur votre appareil",
    pt: "Fica no seu dispositivo",
  },
  privacy_s1_a: {
    en: "Saved moments, wardrobe items, photos, voice notes and ownership notes are stored only in this browser, on this device.",
    fr: "Les moments, les vêtements, les photos, les notes vocales et les notes de propriété enregistrés sont stockés uniquement dans ce navigateur, sur cet appareil.",
    pt: "Momentos, peças, fotos, notas de voz e notas de propriedade salvos ficam armazenados apenas neste navegador, neste dispositivo.",
  },
  privacy_s1_b: {
    en: "They are not uploaded to a Worn With Care server and do not sync to other devices.",
    fr: "Ils ne sont pas envoyés à un serveur Worn With Care et ne se synchronisent pas avec d'autres appareils.",
    pt: "Eles não são enviados a um servidor da Worn With Care e não sincronizam com outros dispositivos.",
  },
  privacy_s1_c: {
    en: "Clearing your browser data deletes them.",
    fr: "Effacer les données de votre navigateur les supprime.",
    pt: "Limpar os dados do navegador os apaga.",
  },
  privacy_s2_title: {
    en: "Sent to other services, only when you use the feature",
    fr: "Envoyé à d'autres services, seulement quand vous utilisez la fonction",
    pt: "Enviado a outros serviços, apenas quando você usa o recurso",
  },
  privacy_s2_a: {
    en: "AI reflections and summaries: the text you write is sent to an AI provider (Google Gemini, with Anthropic as a backup) to write a response.",
    fr: "Réflexions et résumés par IA : le texte que vous écrivez est envoyé à un fournisseur d'IA (Google Gemini, avec Anthropic en secours) pour rédiger une réponse.",
    pt: "Reflexões e resumos de IA: o texto que você escreve é enviado a um provedor de IA (Google Gemini, com Anthropic como reserva) para escrever uma resposta.",
  },
  privacy_s2_b: {
    en: "Spoken narration: the text being read aloud is sent to ElevenLabs to create the audio.",
    fr: "Narration audio : le texte lu à voix haute est envoyé à ElevenLabs pour créer l'audio.",
    pt: "Narração em áudio: o texto lido em voz alta é enviado à ElevenLabs para criar o áudio.",
  },
  privacy_s2_c: {
    en: "Voice note transcripts: your recording is sent to ElevenLabs to turn it into text.",
    fr: "Transcription des notes vocales : votre enregistrement est envoyé à ElevenLabs pour être transformé en texte.",
    pt: "Transcrição de notas de voz: sua gravação é enviada à ElevenLabs para virar texto.",
  },
  privacy_s2_d: {
    en: "We do not add your name or email to these requests, because the app has no accounts. Photos stay on your device.",
    fr: "Nous n'ajoutons ni votre nom ni votre e-mail à ces requêtes, car l'application n'a pas de comptes. Les photos restent sur votre appareil.",
    pt: "Não adicionamos seu nome nem seu e-mail a essas solicitações, porque o app não tem contas. As fotos ficam no seu dispositivo.",
  },
  privacy_s3_title: {
    en: "Your control",
    fr: "Votre contrôle",
    pt: "Seu controle",
  },
  privacy_s3_a: {
    en: "You can delete your items inside the app, or clear this site's data in your browser, at any time.",
    fr: "Vous pouvez supprimer vos éléments dans l'application, ou effacer les données de ce site dans votre navigateur, à tout moment.",
    pt: "Você pode excluir seus itens no app, ou limpar os dados deste site no navegador, a qualquer momento.",
  },
  privacy_s3_b: {
    en: "We do not sell your data.",
    fr: "Nous ne vendons pas vos données.",
    pt: "Não vendemos seus dados.",
  },
  privacy_s3_c: {
    en: "This is a prototype, not a production service. Do not enter anything you would not want processed by the services above.",
    fr: "Ceci est un prototype, pas un service en production. N'entrez rien que vous ne voudriez pas voir traité par les services ci-dessus.",
    pt: "Este é um protótipo, não um serviço em produção. Não insira nada que você não queira que seja processado pelos serviços acima.",
  },
  privacy_s4_title: {
    en: "Limits to know about",
    fr: "Limites à connaître",
    pt: "Limites que você deve conhecer",
  },
  privacy_s4_a: {
    en: "This prototype does not encrypt the storage in your browser.",
    fr: "Ce prototype ne chiffre pas le stockage de votre navigateur.",
    pt: "Este protótipo não criptografa o armazenamento do seu navegador.",
  },
  privacy_s4_b: {
    en: "There are no accounts or cloud backups, so a lost device or a cleared browser means lost data.",
    fr: "Il n'y a ni comptes ni sauvegardes dans le cloud : un appareil perdu ou un navigateur vidé signifie des données perdues.",
    pt: "Não há contas nem backups na nuvem: um dispositivo perdido ou um navegador limpo significa dados perdidos.",
  },
  privacy_closing_quote: { en: "Kept simple, and kept on your device.", fr: "Simple, et gardé sur votre appareil.", pt: "Simples, e guardado no seu dispositivo." },

  terms_eyebrow: { en: "Terms", fr: "Conditions", pt: "Termos" },
  terms_title: { en: "Designed to last. Built to be trusted.", fr: "Conçu pour durer. Bâti pour inspirer confiance.", pt: "Feito para durar. Construído para inspirar confiança." },
  terms_subtitle: {
    en: "By using this Digital Product Passport, you agree to use the platform responsibly while preserving accurate ownership and garment information.",
    fr: "En utilisant ce passeport numérique, vous acceptez d'utiliser la plateforme de manière responsable tout en préservant des informations exactes sur la propriété et le vêtement.",
    pt: "Ao usar este Passaporte Digital do Produto, você concorda em usar a plataforma de forma responsável, mantendo informações precisas de propriedade e da peça.",
  },
  terms_section1_title: { en: "Ownership Records", fr: "Registres de Propriété", pt: "Registros de Propriedade" },
  terms_ownership_edit: { en: "Edit", fr: "Modifier", pt: "Editar" },
  terms_ownership_update: { en: "Update", fr: "Mettre à jour", pt: "Atualizar" },
  terms_ownership_transfer: { en: "Transfer ownership", fr: "Transférer la propriété", pt: "Transferir a propriedade" },
  terms_ownership_note: {
    en: "Users may edit, update, or transfer ownership, but should maintain accurate information.",
    fr: "Les utilisateurs peuvent modifier, mettre à jour ou transférer la propriété, mais doivent maintenir des informations exactes.",
    pt: "Os usuários podem editar, atualizar ou transferir a propriedade, mas devem manter informações precisas.",
  },
  terms_section2_title: { en: "Product Information", fr: "Informations sur le Produit", pt: "Informações do Produto" },
  terms_product_info: {
    en: "Sustainability information, certifications, repair guidance, and manufacturing details are provided for educational purposes and may evolve as new information becomes available.",
    fr: "Les informations sur la durabilité, les certifications, les conseils de réparation et les détails de fabrication sont fournis à des fins éducatives et peuvent évoluer à mesure que de nouvelles informations deviennent disponibles.",
    pt: "As informações de sustentabilidade, certificações, orientações de reparo e detalhes de fabricação são fornecidas para fins educacionais e podem evoluir à medida que novas informações se tornam disponíveis.",
  },
  terms_section3_title: { en: "User Content", fr: "Contenu de l'Utilisateur", pt: "Conteúdo do Usuário" },
  terms_user_content: {
    en: "Photos, notes, and wardrobe information remain the property of the user.",
    fr: "Les photos, notes et informations sur la garde-robe demeurent la propriété de l'utilisateur.",
    pt: "Fotos, notas e informações do guarda-roupa permanecem propriedade do usuário.",
  },
  terms_section4_title: { en: "Availability", fr: "Disponibilité", pt: "Disponibilidade" },
  terms_availability: {
    en: "The platform may receive updates and improvements over time. Some Digital Product Passport features may evolve as standards mature.",
    fr: "La plateforme peut recevoir des mises à jour et des améliorations au fil du temps. Certaines fonctionnalités du passeport numérique peuvent évoluer à mesure que les normes mûrissent.",
    pt: "A plataforma pode receber atualizações e melhorias ao longo do tempo. Alguns recursos do Passaporte Digital do Produto podem evoluir à medida que os padrões amadurecem.",
  },
  terms_closing_quote: { en: "Built for today. Designed for the future.", fr: "Conçu pour aujourd'hui. Pensé pour l'avenir.", pt: "Construído para hoje. Pensado para o futuro." },

  footer_accessibility: { en: "Accessibility", fr: "Accessibilité", pt: "Acessibilidade" },
  footer_release_notes: { en: "Release Notes", fr: "Notes de Version", pt: "Notas de Versão" },
  footer_about_passport: { en: "About this Passport", fr: "À propos de ce Passeport", pt: "Sobre este Passaporte" },

  about_passport_eyebrow: { en: "About this Passport", fr: "À propos de ce Passeport", pt: "Sobre este Passaporte" },
  about_passport_title: { en: "A living record of craftsmanship.", fr: "Un registre vivant du savoir-faire.", pt: "Um registro vivo do artesanato." },
  about_passport_p1: {
    en: "This Digital Product Passport brings together product information, ownership history, care guidance, repair records and lifecycle information to help extend the life of every garment.",
    fr: "Ce passeport numérique réunit des informations produit, l'historique de propriété, des conseils d'entretien, des registres de réparation et des informations sur le cycle de vie, afin de prolonger la vie de chaque vêtement.",
    pt: "Este Passaporte Digital do Produto reúne informações do produto, histórico de propriedade, orientações de cuidado, registros de reparo e informações de ciclo de vida para ajudar a prolongar a vida de cada peça.",
  },
  about_passport_p2: {
    en: "Information may be provided by the brand, manufacturing partners and the garment owner, evolving as new information becomes available throughout the product's lifetime.",
    fr: "Les informations peuvent être fournies par la marque, les partenaires de fabrication et le propriétaire du vêtement, évoluant à mesure que de nouvelles informations deviennent disponibles tout au long de la vie du produit.",
    pt: "As informações podem ser fornecidas pela marca, parceiros de fabricação e pelo proprietário da peça, evoluindo à medida que novas informações se tornam disponíveis ao longo da vida do produto.",
  },
  about_passport_p3: {
    en: "Designed with emerging Digital Product Passport standards in mind. This prototype does not claim compliance with any standard or interoperability with other services.",
    fr: "Conçu en tenant compte des normes émergentes de passeport numérique. Ce prototype ne revendique aucune conformité à une norme ni interopérabilité avec d'autres services.",
    pt: "Feito com os padrões emergentes de Passaporte Digital do Produto em mente. Este protótipo não alega conformidade com nenhum padrão nem interoperabilidade com outros serviços.",
  },
  about_passport_p4: {
    en: "Worn With Care is an independent prototype by Elizabeth Xu. The COS Black Wool Funnel-Neck Coat is used only as an example garment. COS is not affiliated with this project and has not endorsed it, and all product, supply chain and sustainability values shown are illustrative.",
    fr: "Worn With Care est un prototype indépendant créé par Elizabeth Xu. Le manteau en laine noire à col cheminée COS n'est utilisé que comme vêtement d'exemple. COS n'est pas affilié à ce projet et ne l'a pas approuvé, et toutes les valeurs de produit, de chaîne d'approvisionnement et de durabilité affichées sont illustratives.",
    pt: "Worn With Care é um protótipo independente de Elizabeth Xu. O casaco de lã preta com gola funil COS é usado apenas como peça de exemplo. A COS não é afiliada a este projeto nem o endossou, e todos os valores de produto, cadeia de suprimentos e sustentabilidade exibidos são ilustrativos.",
  },

  data_sources_title: { en: "Data Sources", fr: "Sources de Données", pt: "Fontes de Dados" },
  data_source_brand_label: {
    en: "Brand-Provided Data",
    fr: "Données fournies par la marque",
    pt: "Dados fornecidos pela marca",
  },
  data_source_manufacturing_label: {
    en: "Manufacturer-Provided Data",
    fr: "Données fournies par le fabricant",
    pt: "Dados fornecidos pelo fabricante",
  },
  data_source_owner_label: { en: "Owner Contributions", fr: "Contributions du Propriétaire", pt: "Contribuições do Proprietário" },
  data_source_updated_label: { en: "Last Updated", fr: "Dernière Mise à Jour", pt: "Última Atualização" },
  about_passport_last_updated_value: { en: "August 2026", fr: "août 2026", pt: "agosto de 2026" },
  data_source_verified_value: {
    en: "Illustrative",
    fr: "Illustratif",
    pt: "Ilustrativo",
  },
  data_source_active_value: { en: "Active", fr: "Actif", pt: "Ativo" },

  data_confidence_title: { en: "Data Confidence", fr: "Fiabilité des Données", pt: "Confiabilidade dos Dados" },
  confidence_verified_title: {
    en: "Brand and manufacturer provided",
    fr: "Fourni par la marque et le fabricant",
    pt: "Fornecido pela marca e pelo fabricante",
  },
  confidence_verified_desc: {
    en: "Product, material and supply chain details supplied by the brand or manufacturer. Illustrative in this demo.",
    fr: "Détails du produit, des matériaux et de la chaîne d'approvisionnement fournis par la marque ou le fabricant. Illustratifs dans cette démo.",
    pt: "Detalhes do produto, dos materiais e da cadeia de suprimentos fornecidos pela marca ou pelo fabricante. Ilustrativos nesta demonstração.",
  },
  confidence_estimated_title: { en: "Estimated", fr: "Estimé", pt: "Estimado" },
  confidence_estimated_desc: {
    en: "Calculated sustainability metrics based on available product data. Estimates are not measurements.",
    fr: "Indicateurs de durabilité calculés à partir des données produit disponibles. Les estimations ne sont pas des mesures.",
    pt: "Métricas de sustentabilidade calculadas com base nos dados disponíveis do produto. Estimativas não são medições.",
  },
  confidence_owner_title: { en: "Owner Contributed", fr: "Contribué par le Propriétaire", pt: "Contribuído pelo Proprietário" },
  confidence_owner_desc: {
    en: "Ownership history, wear, care and repair records.",
    fr: "Historique de propriété, usure, entretien et registres de réparation.",
    pt: "Histórico de propriedade, uso, cuidado e registros de reparo.",
  },
  confidence_illustrative_title: {
    en: "Illustrative demo values",
    fr: "Valeurs de démonstration illustratives",
    pt: "Valores de demonstração ilustrativos",
  },
  confidence_illustrative_desc: {
    en: "Placeholder values created for this prototype. They do not describe a real garment or a real audit.",
    fr: "Valeurs fictives créées pour ce prototype. Elles ne décrivent ni un vrai vêtement ni un vrai audit.",
    pt: "Valores fictícios criados para este protótipo. Eles não descrevem uma peça real nem uma auditoria real.",
  },

  passport_sharing_title: { en: "Passport Sharing", fr: "Partage du Passeport", pt: "Compartilhamento do Passaporte" },
  sharing_pdf_title: { en: "Editorial PDF", fr: "PDF Éditorial", pt: "PDF Editorial" },
  sharing_pdf_desc: { en: "Beautifully formatted multi-page passport.", fr: "Passeport multi-pages joliment mis en forme.", pt: "Passaporte de várias páginas lindamente formatado." },
  sharing_qr_title: { en: "QR Code", fr: "Code QR", pt: "Código QR" },
  sharing_qr_desc: { en: "Instantly share this garment.", fr: "Partagez cette pièce instantanément.", pt: "Compartilhe esta peça instantaneamente." },
  sharing_link_title: { en: "Digital Passport Link", fr: "Lien du Passeport Numérique", pt: "Link do Passaporte Digital" },
  sharing_link_desc: {
    en: "Always reflects the latest version of this passport.",
    fr: "Reflète toujours la dernière version de ce passeport.",
    pt: "Sempre reflete a versão mais recente deste passaporte.",
  },
  about_passport_closing: { en: "Crafted to last. Designed to evolve.", fr: "Conçu pour durer. Pensé pour évoluer.", pt: "Feito para durar. Pensado para evoluir." },

  share_sheet_title: { en: "Share Passport", fr: "Partager le Passeport", pt: "Compartilhar Passaporte" },
  share_sheet_subtitle: { en: "Choose how you'd like to share this passport.", fr: "Choisissez comment partager ce passeport.", pt: "Escolha como deseja compartilhar este passaporte." },
  share_sheet_pdf_desc: { en: "A beautifully formatted passport suitable for printing or sharing.", fr: "Un passeport joliment mis en forme, adapté à l'impression ou au partage.", pt: "Um passaporte lindamente formatado, adequado para impressão ou compartilhamento." },
  share_sheet_pdf_action: { en: "Generate PDF", fr: "Générer le PDF", pt: "Gerar PDF" },
  pdf_preparing_label: { en: "Preparing your passport...", fr: "Préparation de votre passeport...", pt: "Preparando seu passaporte..." },
  pdf_ready_label: { en: "Passport ready.", fr: "Passeport prêt.", pt: "Passaporte pronto." },
  pdf_error_label: { en: "Couldn't generate the PDF, try again", fr: "Impossible de générer le PDF, réessayer", pt: "Não foi possível gerar o PDF, tentar novamente" },
  share_sheet_qr_desc: { en: "Open this passport on another device.", fr: "Ouvrez ce passeport sur un autre appareil.", pt: "Abra este passaporte em outro dispositivo." },
  share_sheet_qr_action: { en: "Generate QR Code", fr: "Générer le Code QR", pt: "Gerar Código QR" },
  share_sheet_link_desc: {
    en: "Always points to the latest version.",
    fr: "Pointe toujours vers la dernière version.",
    pt: "Sempre aponta para a versão mais recente.",
  },
  share_sheet_link_action: { en: "Copy Link", fr: "Copier le Lien", pt: "Copiar Link" },
  share_sheet_footer_note: {
    en: "Shared passports always reference the latest version of this passport.",
    fr: "Les passeports partagés font toujours référence à la dernière version de ce passeport.",
    pt: "Passaportes compartilhados sempre fazem referência à versão mais recente deste passaporte.",
  },
  cancel_label: { en: "Cancel", fr: "Annuler", pt: "Cancelar" },
  link_copied_confirmation: { en: "Link copied", fr: "Lien copié", pt: "Link copiado" },
  scan_qr_hint: { en: "Scan to open on another device", fr: "Scannez pour ouvrir sur un autre appareil", pt: "Escaneie para abrir em outro dispositivo" },

  accessibility_eyebrow: { en: "Accessibility", fr: "Accessibilité", pt: "Acessibilidade" },
  accessibility_title: { en: "Designed to be inclusive.", fr: "Conçu pour être inclusif.", pt: "Feito para ser inclusivo." },
  accessibility_subtitle: {
    en: "wornwith.care is designed so everyone can experience and care for their wardrobe with confidence. Accessibility is considered throughout every interaction.",
    fr: "wornwith.care est conçu pour que chacun puisse découvrir et entretenir sa garde-robe en toute confiance. L'accessibilité est prise en compte dans chaque interaction.",
    pt: "wornwith.care é feito para que todos possam experimentar e cuidar de seu guarda-roupa com confiança. A acessibilidade é considerada em cada interação.",
  },
  accessibility_section1_title: { en: "Inclusive Design", fr: "Conception Inclusive", pt: "Design Inclusivo" },
  a11y_high_contrast: { en: "High-contrast typography", fr: "Typographie à fort contraste", pt: "Tipografia de alto contraste" },
  a11y_clear_nav: { en: "Clear navigation", fr: "Navigation claire", pt: "Navegação clara" },
  a11y_responsive: { en: "Responsive layouts", fr: "Mises en page responsives", pt: "Layouts responsivos" },
  a11y_keyboard: { en: "Keyboard accessibility", fr: "Accessibilité au clavier", pt: "Acessibilidade por teclado" },
  a11y_screen_reader: { en: "Screen reader compatibility", fr: "Compatibilité avec les lecteurs d'écran", pt: "Compatibilidade com leitores de tela" },
  a11y_reduced_motion: { en: "Reduced motion support", fr: "Prise en charge des animations réduites", pt: "Suporte a movimento reduzido" },
  a11y_readable_type: { en: "Readable typography", fr: "Typographie lisible", pt: "Tipografia legível" },
  a11y_color_contrast: { en: "Accessible color contrast", fr: "Contraste de couleurs accessible", pt: "Contraste de cores acessível" },
  accessibility_section2_title: { en: "Motion", fr: "Mouvement", pt: "Movimento" },
  accessibility_motion_text: {
    en: "Users who prefer reduced motion automatically receive simplified transitions while preserving the experience.",
    fr: "Les utilisateurs préférant des animations réduites reçoivent automatiquement des transitions simplifiées, sans compromettre l'expérience.",
    pt: "Usuários que preferem movimento reduzido recebem automaticamente transições simplificadas, preservando a experiência.",
  },
  accessibility_section3_title: { en: "Continuous Improvements", fr: "Améliorations Continues", pt: "Melhorias Contínuas" },
  accessibility_improvements_text: {
    en: "Accessibility is continuously reviewed and improved as the Digital Product Passport evolves.",
    fr: "L'accessibilité est continuellement révisée et améliorée à mesure que le passeport numérique évolue.",
    pt: "A acessibilidade é continuamente revisada e aprimorada à medida que o Passaporte Digital do Produto evolui.",
  },
  accessibility_closing_quote: {
    en: "Beautiful experiences should be accessible to everyone.",
    fr: "Les belles expériences devraient être accessibles à tous.",
    pt: "Experiências bonitas devem ser acessíveis a todos.",
  },

  release_notes_eyebrow: { en: "Release Notes", fr: "Notes de Version", pt: "Notas de Versão" },
  release_notes_title: { en: "Edition 1.0", fr: "Édition 1.0", pt: "Edição 1.0" },
  release_notes_subtitle: {
    en: "The first complete Digital Product Passport experience, designed to celebrate craftsmanship, transparency, and longevity.",
    fr: "La première expérience complète de passeport numérique, conçue pour célébrer le savoir-faire, la transparence et la longévité.",
    pt: "A primeira experiência completa de Passaporte Digital do Produto, feita para celebrar o artesanato, a transparência e a longevidade.",
  },
  release_notes_date: { en: "July 2026", fr: "Juillet 2026", pt: "Julho de 2026" },
  release_notes_version: { en: "Version 1.0 • Build 2026.1", fr: "Version 1.0 • Build 2026.1", pt: "Versão 1.0 • Build 2026.1" },
  whats_new_title: { en: "What's New", fr: "Nouveautés", pt: "Novidades" },

  rn12_title: { en: "Edition 1.2", fr: "Édition 1.2", pt: "Edição 1.2" },
  rn12_date: { en: "October 2026", fr: "Octobre 2026", pt: "Outubro de 2026" },
  rn12_version: { en: "Version 1.2", fr: "Version 1.2", pt: "Versão 1.2" },
  rn12_subtitle: {
    en: "A steadier passport: every claim shows where it comes from, reflections fail gracefully, and small text is easier to read.",
    fr: "Un passeport plus fiable : chaque affirmation indique sa source, les réflexions échouent proprement et les petits textes sont plus lisibles.",
    pt: "Um passaporte mais estável: cada afirmação mostra sua origem, as reflexões falham com elegância e os textos pequenos ficam mais legíveis.",
  },
  rn12_claims_title: { en: "Claims", fr: "Affirmations", pt: "Afirmações" },
  rn12_claims_1: { en: "Audit and chemical claims show a status such as Pending verification, with the evidence needed", fr: "Les affirmations d'audit et de chimie affichent un statut, comme En attente de vérification, avec la preuve requise", pt: "Afirmações de auditoria e químicas mostram um status, como Aguardando verificação, com a evidência necessária" },
  rn12_claims_2: { en: "A cited reference is shown as cited, not as verified", fr: "Une référence citée est présentée comme citée, pas comme vérifiée", pt: "Uma referência citada aparece como citada, não como verificada" },
  rn12_reliability_title: { en: "Reliability", fr: "Fiabilité", pt: "Confiabilidade" },
  rn12_reliability_1: { en: "AI reflections retry safely and show a clear message if they fail", fr: "Les réflexions IA réessaient en toute sécurité et affichent un message clair en cas d'échec", pt: "As reflexões de IA tentam novamente com segurança e mostram uma mensagem clara se falharem" },
  rn12_reliability_2: { en: "Reflections are labelled as an interpretation, not a verified fact", fr: "Les réflexions sont indiquées comme une interprétation, pas un fait vérifié", pt: "As reflexões são indicadas como interpretação, não como fato verificado" },
  rn12_reliability_3: { en: "Damaged or edited saved data is ignored instead of breaking the app", fr: "Les données enregistrées endommagées ou modifiées sont ignorées au lieu de casser l'application", pt: "Dados salvos danificados ou editados são ignorados em vez de quebrar o aplicativo" },
  rn12_sharing_title: { en: "Sharing", fr: "Partage", pt: "Compartilhamento" },
  rn12_sharing_1: { en: "Share links and the printed tag QR use one clean address in your language", fr: "Les liens de partage et le QR de l'étiquette utilisent une seule adresse propre dans votre langue", pt: "Links de compartilhamento e o QR da etiqueta usam um único endereço limpo no seu idioma" },
  rn12_access_title: { en: "Accessibility", fr: "Accessibilité", pt: "Acessibilidade" },
  rn12_access_1: { en: "Higher contrast for small text and larger tap targets", fr: "Contraste plus élevé pour les petits textes et zones de toucher plus grandes", pt: "Maior contraste para textos pequenos e áreas de toque maiores" },
  rn12_access_2: { en: "Clearer names for screen readers on buttons and dialogs", fr: "Noms plus clairs pour les lecteurs d'écran sur les boutons et les boîtes de dialogue", pt: "Nomes mais claros para leitores de tela em botões e diálogos" },

  rn11_title: { en: "Edition 1.1", fr: "Édition 1.1", pt: "Edição 1.1" },
  rn11_date: { en: "October 2026", fr: "Octobre 2026", pt: "Outubro de 2026" },
  rn11_version: { en: "Version 1.1", fr: "Version 1.1", pt: "Versão 1.1" },
  rn11_subtitle: {
    en: "Sharper sharing, a passport that opens in your language, and clearer labels on what is illustrative.",
    fr: "Un partage plus net, un passeport qui s'ouvre dans votre langue, et des mentions plus claires sur ce qui est illustratif.",
    pt: "Compartilhamento mais claro, um passaporte que abre no seu idioma e avisos mais claros sobre o que é ilustrativo.",
  },
  rn11_language_title: { en: "Languages and links", fr: "Langues et liens", pt: "Idiomas e links" },
  rn11_language_1: { en: "Your language is part of the web address: wornwith.care/en, /fr and /pt", fr: "Votre langue fait partie de l'adresse web : wornwith.care/en, /fr et /pt", pt: "Seu idioma faz parte do endereço: wornwith.care/en, /fr e /pt" },
  rn11_language_2: { en: "Shared links open the passport in the same language", fr: "Les liens partagés ouvrent le passeport dans la même langue", pt: "Links compartilhados abrem o passaporte no mesmo idioma" },
  rn11_language_3: { en: "The live passport is the default on phone and desktop", fr: "Le passeport en direct est l'affichage par défaut sur mobile et ordinateur", pt: "O passaporte ao vivo é o padrão no celular e no computador" },
  rn11_brand_title: { en: "Brand", fr: "Marque", pt: "Marca" },
  rn11_brand_1: { en: "New icon set for browser tabs and home screens", fr: "Nouveau jeu d'icônes pour les onglets et les écrans d'accueil", pt: "Novo conjunto de ícones para abas e telas iniciais" },
  rn11_brand_2: { en: "A share image for link previews", fr: "Une image de partage pour les aperçus de liens", pt: "Uma imagem de compartilhamento para prévias de links" },
  rn11_passport_title: { en: "Passport", fr: "Passeport", pt: "Passaporte" },
  rn11_passport_1: { en: "Multi-page PDF generated from the live passport", fr: "PDF de plusieurs pages généré à partir du passeport en direct", pt: "PDF de várias páginas gerado a partir do passaporte ao vivo" },
  rn11_passport_2: { en: "Ask anything on the Wardrobe page, with working plus and mic buttons", fr: "Posez une question sur la page Garde-robe, avec boutons plus et micro fonctionnels", pt: "Pergunte qualquer coisa na página Guarda-roupa, com botões de mais e microfone funcionais" },
  rn11_passport_3: { en: "Restored Journey audit labels with a plain note that values are illustrative", fr: "Libellés d'audit du Parcours rétablis avec une note claire indiquant que les valeurs sont illustratives", pt: "Rótulos de auditoria da Jornada restaurados, com aviso claro de que os valores são ilustrativos" },

  rn_editorial_title: { en: "Editorial Storytelling", fr: "Récit Éditorial", pt: "Narrativa Editorial" },
  rn_editorial_1: { en: "Introduced animated Crafted to Last editorial reveal", fr: "Introduction de la révélation éditoriale animée « Conçu pour Durer »", pt: "Introdução da revelação editorial animada Feito para Durar" },
  rn_editorial_2: { en: "Added cinematic Story page animations", fr: "Ajout d'animations cinématographiques à la page Histoire", pt: "Adição de animações cinematográficas à página História" },
  rn_editorial_3: { en: "Enhanced ownership storytelling", fr: "Amélioration du récit de propriété", pt: "Narrativa de propriedade aprimorada" },

  rn_wardrobe_title: { en: "Wardrobe", fr: "Garde-robe", pt: "Guarda-roupa" },
  rn_wardrobe_1: { en: "Editable garment photos", fr: "Photos de vêtements modifiables", pt: "Fotos de peças editáveis" },
  rn_wardrobe_2: { en: "Wardrobe notes", fr: "Notes de garde-robe", pt: "Notas do guarda-roupa" },
  rn_wardrobe_3: { en: "Improved photo management", fr: "Gestion des photos améliorée", pt: "Gerenciamento de fotos aprimorado" },
  rn_wardrobe_4: { en: "Ownership repository", fr: "Registre de propriété", pt: "Repositório de propriedade" },

  rn_care_title: { en: "Care", fr: "Entretien", pt: "Cuidado" },
  rn_care_1: { en: "Simplified luxury editorial layout", fr: "Mise en page éditoriale de luxe simplifiée", pt: "Layout editorial de luxo simplificado" },
  rn_care_2: { en: "Removed placeholder media", fr: "Suppression des médias temporaires", pt: "Remoção de mídia temporária" },
  rn_care_3: { en: "Refined care guidance", fr: "Conseils d'entretien affinés", pt: "Orientação de cuidados refinada" },
  rn_care_4: { en: "Improved interactions", fr: "Interactions améliorées", pt: "Interações aprimoradas" },

  rn_product_title: { en: "Product", fr: "Produit", pt: "Produto" },
  rn_product_1: { en: "Crafted to Last editorial experience", fr: "Expérience éditoriale « Conçu pour Durer »", pt: "Experiência editorial Feito para Durar" },
  rn_product_2: { en: "Improved product details", fr: "Détails produit améliorés", pt: "Detalhes do produto aprimorados" },
  rn_product_3: { en: "Better responsive layouts", fr: "Meilleures mises en page responsives", pt: "Melhores layouts responsivos" },
  rn_product_4: { en: "Enhanced typography", fr: "Typographie améliorée", pt: "Tipografia aprimorada" },

  rn_general_title: { en: "General Improvements", fr: "Améliorations Générales", pt: "Melhorias Gerais" },
  rn_general_1: { en: "Privacy Policy", fr: "Politique de Confidentialité", pt: "Política de Privacidade" },
  rn_general_2: { en: "Terms of Use", fr: "Conditions d'Utilisation", pt: "Termos de Uso" },
  rn_general_3: { en: "Accessibility Statement", fr: "Déclaration d'Accessibilité", pt: "Declaração de Acessibilidade" },
  rn_general_4: { en: "Data refresh notifications", fr: "Notifications d'actualisation des données", pt: "Notificações de atualização de dados" },
  rn_general_5: { en: "Performance improvements", fr: "Améliorations de performance", pt: "Melhorias de desempenho" },
  rn_general_6: { en: "Refined animations", fr: "Animations affinées", pt: "Animações refinadas" },
  rn_general_7: { en: "Improved responsive behaviour", fr: "Comportement responsive amélioré", pt: "Comportamento responsivo aprimorado" },

  release_notes_closing: {
    en: "wornwith.care will continue to evolve alongside every garment, every repair, every memory, and every story yet to come.",
    fr: "wornwith.care continuera d'évoluer aux côtés de chaque vêtement, chaque réparation, chaque souvenir et chaque histoire à venir.",
    pt: "wornwith.care continuará a evoluir junto com cada peça, cada reparo, cada memória e cada história ainda por vir.",
  },
  photo_options_title: { en: "Photo", fr: "Photo", pt: "Foto" },
  upload_photo_label: { en: "Upload photo", fr: "Téléverser une photo", pt: "Enviar foto" },
  replace_photo_label: { en: "Replace photo", fr: "Remplacer la photo", pt: "Substituir foto" },
  remove_photo_label: { en: "Remove photo", fr: "Supprimer la photo", pt: "Remover foto" },
  uploading_label: { en: "Uploading…", fr: "Téléversement…", pt: "Enviando…" },
  title_field_label: { en: "Title", fr: "Titre", pt: "Título" },
  description_field_label: { en: "Description", fr: "Description", pt: "Descrição" },
  occasion_field_label: { en: "Occasion", fr: "Occasion", pt: "Ocasião" },
  season_field_label: { en: "Season", fr: "Saison", pt: "Estação" },
  favorite_notes_field_label: { en: "Favourite Outfit Notes", fr: "Notes de Tenue Préférée", pt: "Notas do Look Favorito" },
  occasion_placeholder: { en: "e.g. Weekend, Work, Travel", fr: "ex. Week-end, Travail, Voyage", pt: "ex. Fim de semana, Trabalho, Viagem" },
  season_placeholder: { en: "e.g. Autumn, Winter", fr: "ex. Automne, Hiver", pt: "ex. Outono, Inverno" },
  favorite_notes_placeholder: { en: "What made this outfit work?", fr: "Qu'est-ce qui a rendu cette tenue réussie ?", pt: "O que fez essa combinação funcionar?" },

  ownership_record_title: { en: "Ownership Record", fr: "Registre de Propriété", pt: "Registro de Propriedade" },
  ownership_record_subtitle: {
    en: "A private, persistent record of this garment's provenance, yours to complete over time.",
    fr: "Un registre privé et permanent de la provenance de ce vêtement, à compléter au fil du temps.",
    pt: "Um registro privado e permanente da proveniência desta peça, para completar ao longo do tempo.",
  },
  field_owner: { en: "Owner", fr: "Propriétaire", pt: "Proprietário" },
  field_purchase_date: { en: "Purchase Date", fr: "Date d'Achat", pt: "Data de Compra" },
  field_purchase_location: { en: "Purchase Location", fr: "Lieu d'Achat", pt: "Local de Compra" },
  field_purchase_price: { en: "Purchase Price", fr: "Prix d'Achat", pt: "Preço de Compra" },
  field_original_retailer: { en: "Original Retailer", fr: "Détaillant d'Origine", pt: "Varejista Original" },
  field_condition: { en: "Condition", fr: "État", pt: "Condição" },
  field_repair_history: { en: "Repair History", fr: "Historique des Réparations", pt: "Histórico de Reparos" },
  field_wear_count: { en: "Wear Count", fr: "Nombre de Ports", pt: "Contagem de Usos" },
  field_favorite_memories: { en: "Favourite Memories", fr: "Souvenirs Préférés", pt: "Memórias Favoritas" },
  field_travel_history: { en: "Travel History", fr: "Historique de Voyage", pt: "Histórico de Viagens" },
  field_notes: { en: "Notes", fr: "Notes", pt: "Notas" },
  field_not_added: { en: "Not added yet", fr: "Pas encore ajouté", pt: "Ainda não adicionado" },
  purchase_details_title: { en: "Purchase Details", fr: "Détails d'Achat", pt: "Detalhes da Compra" },
  ownership_narrative_hint: {
    en: "Repairs, memories and travel history build up over time through the moments you save above.",
    fr: "Les réparations, souvenirs et voyages s'accumulent au fil du temps grâce aux moments que vous enregistrez ci-dessus.",
    pt: "Reparos, memórias e viagens se acumulam com o tempo através dos momentos que você salva acima.",
  },

  // Wardrobe
  my_wardrobe: { en: "My Wardrobe", fr: "Ma Garde-robe", pt: "Meu Guarda-roupa" },
  pieces: { en: "pieces", fr: "pièces", pt: "peças" },
  brands: { en: "brands", fr: "marques", pt: "marcas" },
  resold: { en: "resold", fr: "revendues", pt: "revendidas" },
  items_label: { en: "items", fr: "articles", pt: "itens" },
  worn_label: { en: "Worn", fr: "Porté", pt: "Usado" },
  what_is_it: { en: "What is it? e.g. Wool Trench Coat", fr: "Qu'est-ce que c'est ? ex. Trench en laine", pt: "O que é? ex. Trench de lã" },
  memory_placeholder: { en: "The memory: where, when, why it mattered", fr: "Le souvenir : où, quand, pourquoi c'était important", pt: "A memória: onde, quando, por que importou" },
  save_memory: { en: "Save memory", fr: "Enregistrer le souvenir", pt: "Salvar memória" },
  cancel: { en: "Cancel", fr: "Annuler", pt: "Cancelar" },
  log_a_memory: { en: "+ Log a memory", fr: "+ Ajouter un souvenir", pt: "+ Registrar uma memória" },
  seed_name_marais: { en: "The Marais Coat", fr: "Le Manteau Marais", pt: "O Casaco Marais" },
  seed_name_silk: { en: "Silk Slip Dress", fr: "Robe Nuisette en Soie", pt: "Vestido Slip de Seda" },
  seed_name_linen: { en: "Linen Trousers", fr: "Pantalon en Lin", pt: "Calça de Linho" },
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
  wardrobe_empty_title: { en: "Nothing here yet", fr: "Rien ici pour l'instant", pt: "Nada aqui ainda" },
  wardrobe_empty_subtitle: {
    en: "Scan a tag to add the first piece, and the first memory that comes with it.",
    fr: "Scannez une étiquette pour ajouter la première pièce, et le premier souvenir qui l'accompagne.",
    pt: "Escaneie uma etiqueta para adicionar a primeira peça, e a primeira memória que vem com ela.",
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
  photo_added_hint: { en: "Photo added, tap to change", fr: "Photo ajoutée, touchez pour changer", pt: "Foto adicionada, toque para alterar" },
  generating_reflection: { en: "Generating a reflection…", fr: "Génération d'une réflexion…", pt: "Gerando uma reflexão…" },
  reflection_failed: { en: "Couldn't generate a reflection, try again", fr: "Impossible de générer une réflexion, réessayer", pt: "Não foi possível gerar uma reflexão, tentar novamente" },
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

// The language lives in the URL (wornwith.care/en, /fr, /pt) so a link always
// opens in the right language. Order: URL, then the last saved choice, then English.
// The pure parts live in ./langUrl so they can be tested on their own.
function langFromPath(): Lang | null {
  return langFromPathname(window.location.pathname);
}

function writeLangToUrl(l: Lang, mode: "push" | "replace") {
  const { pathname, search, hash } = window.location;
  const next = localizedUrl(l, { pathname, search, hash });
  if (next === `${pathname}${search}${hash}`) return;
  try {
    if (mode === "push") window.history.pushState(null, "", next);
    else window.history.replaceState(null, "", next);
  } catch {
    // ignore
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const fromUrl = langFromPath();
    if (fromUrl) return fromUrl;
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang;
      return isLang(saved) ? saved : "en";
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
    // Keep the address bar in step (adds /en on first load without a new history entry).
    writeLangToUrl(lang, "replace");
    document.documentElement.lang = lang;
  }, [lang]);

  // Back and forward between language URLs.
  useEffect(() => {
    const onPop = () => {
      const l = langFromPath();
      if (l) setLangState(l);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setLang = (l: Lang) => {
    writeLangToUrl(l, "push");
    setLangState(l);
  };
  const t = (key: TranslationKey) => {
    const entry = dict[key];
    if (!entry) {
      // A missing dictionary entry is a real bug (like the accidentally-
      // deleted care_tier_excellent key), but the raw key name (e.g.
      // "care_tier_excellent") must never render as visible copy. Warn
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
