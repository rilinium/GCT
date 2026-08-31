# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are defense/GovCon analysts, journalists, and researchers who track government defense spending, contractor activity, and contract awards for professional or investigative purposes.

## Product Purpose

Global Contract Tracker (GCT) visualizes active US Government contracts (plus Canadian and UK government contracts) in real time on a 3D globe, letting analysts see where and to whom government money is flowing rather than reading it out of a table or spreadsheet.

## Positioning

The core differentiator is the real-time 3D globe visualization itself (CesiumJS): seeing contract award locations spatially on a live globe, not just querying a database. A similar contract-data site could replicate the underlying data sources, but not the spatial "watch the money move" experience.

## Operating Context

- Deployed as a static site + Vercel serverless API (no build framework; plain HTML/CSS/JS in [index.html](index.html) with API routes under [api/](api/)).
- Data sources: USASpending API (US, primary), open.canada.ca CKAN API (Canada, [api/canada-contracts.js](api/canada-contracts.js)), and a UK contracts source ([api/uk-contracts.js](api/uk-contracts.js)) — selectable via a data-source picker in the header.
- A stock-quote proxy ([api/quote.js](api/quote.js), Yahoo Finance) supports showing related contractor stock data alongside contract detail.
- An authenticated admin surface ([api/admin/](api/admin/): auth, OAuth callback, overrides) lets an admin manually correct/override individual contract records that the upstream sources get wrong.
- Ships as an installable PWA (manifest.json, standalone display, landscape orientation) with mobile-specific layout (bottom-sheet sidebar, safe-area insets).

## Capabilities and Constraints

- **Requires a free Cesium Ion token.** The globe cannot render without one; the app prompts the user for it on first load. This is a hard, permanent dependency, not friction to be designed away.
- **Data is source-limited and not truly real-time.** USASpending, open.canada.ca, and the UK source have real caps (record limits, quarterly refresh cycles, rate limits, edge caching of 15 min–hours). Design and copy should not imply tighter precision or freshness than the sources actually provide, despite the "real-time" framing in product messaging.
- **Admin override system must keep working.** api/admin lets an authenticated admin manually correct contract records; this internal tool surface is load-bearing and not cosmetic.
- Multi-country data is unified into one interface but sourced from three structurally different upstream APIs (USASpending, CKAN, UK source) with different fields/limits.

## Evidence on Hand

- Live product: [gct.rilinium.com](https://gct.rilinium.com)
- Brand assets on disk: [gctbanner.png](gctbanner.png), [gcticon.png](gcticon.png)/[gcticon.ico](gcticon.ico), [icon-192.png](icon-192.png)/[icon-512.png](icon-512.png), [og-image.png](og-image.png)/[og-image.svg](og-image.svg), [App.png](App.png) (screenshot).
- Stated scale (from OG/Twitter copy): "1,000+ active DoD awards across 19 countries" — treat as existing product copy, not a design-time claim to invent further.
- No customer testimonials, case studies, or press exist; do not fabricate any.

## Product Principles

1. The globe is the product — every UI decision should protect its legibility and keep it the visual center of gravity, not compete with it.
2. Be honest about data latency and provenance; "real-time" is a framing choice for the live-tracking feel, not a literal claim to reinforce with fake precision.
3. Serve the working analyst first: scanability, fast filtering, and correct data outrank decoration (Operate mode, even though the surface has strong visual identity).
4. Multi-country/multi-source data should read as one coherent system to the user, even though the underlying sources are structurally different.
5. The admin/override tooling is a trusted internal instrument for data correctness, not a public-facing feature — it should stay unobtrusive and reliable rather than polished for visitors.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
