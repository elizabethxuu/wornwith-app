// Each feature gets a maxTokens budget and a build(context) function that
// returns the feature-specific instruction. The editorial system prompt is
// prepended by the caller (api/ai.js), never duplicated here — this is the
// "one place per prompt" the architecture is meant to guarantee.

export const FEATURES = {
  reflection: {
    maxTokens: 60,
    build: (ctx) =>
      `Someone just wrote this about when they imagine wearing a coat they own: "${String(ctx.momentText || "").slice(0, 300)}"\n\nWrite exactly one short, warm sentence (under 18 words) reflecting back this specific moment — like a thoughtful friend noticing something true about it. No quotation marks, no preamble.`,
  },

  curatorsNotes: {
    maxTokens: 160,
    build: (ctx) =>
      `Write a curator's note (2–3 sentences, under 70 words) about a ${ctx.garmentName || "garment"} owned since ${ctx.ownedSince || "recently"}, worn approximately ${ctx.timesWorn || "several"} times, currently in ${ctx.condition || "excellent"} condition, with an estimated ${ctx.yearsRemaining || "several"} years of remaining service life. Write it the way a museum or auction catalogue would describe an object's provenance and care history — not a product description.`,
  },

  archiveSummary: {
    maxTokens: 80,
    build: (ctx) =>
      `In one sentence (under 25 words), summarize this garment's ownership archive: ${ctx.entriesSummary || "acquired, maintained, and kept in active use"}.`,
  },

  story: {
    maxTokens: 140,
    build: (ctx) =>
      `Write a short passage (2–3 sentences, under 80 words) about the origin and journey of a ${ctx.garmentName || "garment"} made from ${ctx.material || "natural materials"}, produced across ${ctx.originCountries || "Europe"}. Ground it in the specific materials and places given, not generic imagery.`,
  },

  todaysEdit: {
    maxTokens: 50,
    build: (ctx) =>
      `In one short editorial sentence (under 20 words), explain why a ${ctx.garmentName || "garment"} suits today's conditions, described plainly as: ${ctx.weatherDescription || "mild weather"}. Do not mention percentages, degrees, or technical weather terms — translate them into the feeling of the day.`,
  },

  environmentalPerformance: {
    maxTokens: 120,
    build: (ctx) =>
      `Write a short paragraph (2–3 sentences, under 70 words) describing a garment's environmental performance, using only these real figures: ${ctx.metricsSummary || "above-average performance across standard sustainability measures"}. Write it like the explanatory note beside a sustainability report's data table, not a marketing claim.`,
  },
};
