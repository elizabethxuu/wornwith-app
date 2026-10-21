# PRD: wornwith.care

### Digital Product Passport: Consumer Experience Layer

|  |  |
| --- | --- |
| **Author** | Elizabeth Xu |
| **Status** | Web App / Portfolio Project |
| **Last Updated** | October 2026 |
| **Stakeholders** | N/A (independent project) |

---

### North Star

Design a mobile-first DPP prototype that makes fashion product transparency accessible and human-centered, leveraging Figma for design and Claude Code for AI-assisted content and logic.

---

## 1. Executive Summary

The EU's Ecodesign for Sustainable Products Regulation (ESPR) entered into force in July 2024 and sets up Digital Product Passports (DPPs) across many product groups. The detailed requirements for each group, including textiles, come later through delegated acts that are not final, so timelines for fashion should be checked against the European Commission's ESPR working plan. Brands are expected to have to disclose material origin, supply chain data, care guidance, and end-of-life pathways, not just at checkout, but for the life of the product.

The regulation defines *what* to disclose. It says nothing about how it should *feel*. Left unaddressed, the default outcome is predictable: a static PDF, a buried compliance page, a mandatory customer touchpoint treated as a cost center instead of a lever. In my research I did not find a brand or platform that treats the DPP as a product surface; the category still looks open for someone to define the standard.

**wornwith.care is that definition. A DPP built end-to-end as an actual product experience, not a compliance artifact but one that satisfies the regulation while giving brands a real, durable channel to the customer for the life of the garment.**

### 1.1 Background: What Is a Digital Product Passport?

A DPP is a mandatory electronic record built to drive the circular economy forward. It ensures products meet sustainability and transparency requirements and gives consumers real visibility into where their clothes came from and the history behind them. Done right, it can cut down on greenwashing by making it clear where each piece of data comes from and whether anyone has checked it. Some implementations may add tamper-evident record-keeping, but this prototype does not.

A DPP isn't a marketing surface. It's a trust mechanism first. Everything in this document is built to earn that standard, not just satisfy the letter of the regulation.

---

## 2. Problem Statement

- Brands will face passport requirements for textiles once the delegated act is final, and there is no established UX pattern to work from. This looks like greenfield.
- The default path (PDFs, static disclosure pages) creates friction without upside and leaves real engagement and first-party data on the table.
- I did not find a reference implementation that treats the DPP as a product, not a legal checkbox. The company that defines this pattern first could set the standard everyone else gets measured against.

---

## 3. Objectives

| Objective | Description |
| --- | --- |
| O1 | Design a complete DPP experience covering the full regulatory disclosure scope: origin, supply chain, care, impact, end-of-life |
| O2 | Prove that compliance-driven UX can also drive real engagement: read-through, return visits, first-party data capture |
| O3 | Establish a mechanism for post-purchase, first-party data capture (ownership logging) that gives brands ongoing value past the transaction |
| O4 | Ship a credible reference implementation ahead of market and regulatory demand, as a candidate for what people point to when this becomes a category |

### Out of Scope

- Brand-side content management / authoring tools
- Multi-SKU, multi-brand data architecture (see Section 8, Risks)
- Legal certification against final ESPR technical standards: not finalized yet
- Commerce or transactional functionality

---

## 4. Target Users

| User | Description | Primary Need |
| --- | --- | --- |
| **Primary: The Conscious Shopper** | Buys considered, durable goods. Cares about quality, ethics, and longevity. Currently gets either nothing or a disclosure experience that reads like a warranty card | Transparency and confidence at the point of purchase; real utility (care, resale) after |
| **Secondary: Brand** | Fashion brand on the hook for ESPR compliance | Turn a legal requirement into a customer relationship and a first-party data asset |

**Who this isn't for:** the price-driven, low-consideration shopper. The bet is that engagement value concentrates in customers who already care about durability and provenance, not everyone, on purpose.

---

## 5. Requirements

### 5.1 Functional Requirements (P0: built in current prototype)

| # | Requirement | Notes |
| --- | --- | --- |
| FR1 | QR-code entry point from physical product tag | Primary acquisition channel |
| FR2 | Product overview: identity, material composition, certifications | Core disclosure requirement |
| FR3 | Supply chain visualization: origin through retail, with location and audit metadata | Sequential, stage-based UI |
| FR4 | Compliance module: ethical audit results, chemical compliance status, named economic operator | Direct regulatory requirement (EU Economic Operator designation) |
| FR5 | Care guidance, indexed to wear frequency and lifecycle stage | Includes maintenance forecasting |
| FR6 | Environmental impact metrics, benchmarked against category average | CO2, water, recyclability, renewable energy |
| FR7 | End-of-life routing: resale, donation, repair, recycling partner integrations | |
| FR8 | Post-purchase ownership tracking: purchase details, condition, wear count, free-text moment logging | Primary first-party data capture mechanism |
| FR9 | Localization: EN / FR / PT, validated by native speakers | Not machine-translated and shipped blind |
| FR10 | Multi-item wardrobe view with contextual recommendations (condition, weather, recency) | Retention/re-engagement surface |

### 5.2 Explored, Not Prioritized (P2)

| Feature | Status | Rationale |
| --- | --- | --- |
| Secondary discovery/mood layer ("Glasshouse") | Built, not integrated into core flow | Tests whether passport data can power engagement beyond compliance: a deliberate scope call, not a limitation |
| AI-generated ownership summaries | Early-stage | Needs further development before production-ready |

---

## 6. Success Metrics

No production deployment yet: here's what I'd track from day one of a live pilot:

| Metric | Definition | Why it matters |
| --- | --- | --- |
| Scan-to-read-through rate | % of sessions progressing past the product overview screen | Tells you if the experience earns attention past the first tap |
| Moment-logging rate | % of owners completing the post-purchase ownership prompt | The real signal: emotional buy-in, not a vanity click |
| Return visit rate | % of owners reopening the passport post-purchase | Retention value beyond the point of sale |
| First-party data yield | Volume/quality of structured data (moments, repair events, resale intent) captured per SKU | The actual business case for brand investment beyond legal minimum |

---

## 7. Risks & Open Questions

| Risk | Description | Mitigation / Next Step |
| --- | --- | --- |
| Data provenance methodology | Environmental and logistics metrics (distance traveled, CO2 saved) are illustrative right now | Needs a defensible sourcing methodology and a clear liability model before production |
| Scalability of data model | Current build assumes one SKU, one journey. A real brand catalog means multiple mills, multiple certifications, versioned supply chains | Materially harder backend problem than the prototype implies: the next real build target |
| Regulatory uncertainty | ESPR technical standards for textiles aren't finalized | Treat current requirement set as directional; monitor regulatory development |
| Unvalidated brand incentive model | The claim that resale/repair routing earns a brand a "repeat touchpoint" is a hypothesis | Needs validation against a real brand's growth or sustainability numbers |

---

## 8. Testing & Validation

- Full end-to-end QA across every screen, multiple passes: caught and fixed real bugs (broken routing, a save that wasn't persisting).
- French and Portuguese translations verified by native speakers, not shipped on machine translation alone.
- Edge case testing: offline state, empty wardrobe, failed scan.
- Usability testing with people outside the project: findings fed directly back into iteration, not filed away.

---

## 9. Release History

### Edition 1.2

October 2026

*A steadier passport: every claim shows where it comes from, reflections fail gracefully, and small text is easier to read.*

**Claims**

- Audit and chemical claims show a status such as Pending verification, with the evidence needed
- A cited reference is shown as cited, not as verified

**Reliability**

- AI reflections retry safely and show a clear message if they fail
- Reflections are labelled as an interpretation, not a verified fact
- Damaged or edited saved data is ignored instead of breaking the app

**Sharing and accessibility**

- Share links and the printed tag QR use one clean address in the reader's language
- Higher contrast for small text, larger tap targets, clearer names for screen readers

### Edition 1.1

October 2026

*Sharper sharing, a passport that opens in your language, and clearer labels on what is illustrative.*

- Language in the web address: wornwith.care/en, /fr and /pt
- New icon set and share image
- Multi-page PDF generated from the live passport
- "Ask anything" on the Wardrobe page
- Restored Journey audit labels with a note that values are illustrative

### Edition 1.0

July 2026

*The first complete Digital Product Passport experience, designed to celebrate craftsmanship, transparency, and longevity.*

**Editorial Storytelling**

- Introduced animated "Crafted to Last" editorial reveal
- Added cinematic Story page animations
- Enhanced ownership storytelling

**Wardrobe**

- Editable garment photos
- Wardrobe notes
- Improved photo management
- Ownership repository

**Care**

- Simplified luxury editorial layout
- Removed placeholder media
- Refined care guidance
- Improved interactions

**Product**

- "Crafted to Last" editorial experience
- Improved product details
- Better responsive layouts
- Enhanced typography

**General Improvements**

- Privacy Policy, Terms of Use, Accessibility Statement published
- Data refresh notifications
- Performance improvements
- Refined animations
- Improved responsive behaviour

*wornwith.care will continue to evolve alongside every garment, every repair, every memory, and every story yet to come.*

---

## 10. Technical Notes

Designed in Figma, with Claude used for UX planning and design iteration. Implemented in Cursor. Deployed on Vercel. Live at wornwith.care.

---

## 11. Why This Matters

This is how I approach problems with no playbook.

I could not find an established pattern for what a Digital Product Passport should feel like, and no precedent I could copy. So I built the reference implementation myself: strategy, UX, content, and a working deployed product, solo, start to finish, in weeks.

That's the actual capability on display here, and it's transferable well beyond fashion-tech:

- **Scoping ambiguity into something shippable.** No brief, no roadmap handed to me. I defined the problem, the user, and the requirements from scratch, then built against them.
- **Owning the whole surface area.** Strategy, design, technical execution, testing, iteration, not one slice of a larger team's roadmap. At a lean, fast-moving team, that's usually the job.
- **Knowing where the seams are.** Section 7 names this project's real risks and open questions directly: the data provenance gap, the scaling problem, the unvalidated brand incentive model. Shipping fast doesn't mean pretending it's finished; it means being precise about what's proven and what isn't.

Teams solving problems before the market or the regulator has fully defined them need someone who can move first. That's what this project proves I can do.
