# Cambodian Financial Institution Explorer — Implementation Plan

> Working title: **No Name**  
> Status: product and technical plan  
> Primary audience: Cambodian borrowers and everyday banking customers

## 1. Product vision

Build a simple, trustworthy, Khmer-first web application where people can:

- Search Cambodian banks, specialized banks, microfinance deposit-taking institutions (MDIs), microfinance institutions (MFIs), leasing companies, and rural credit institutions.
- See whether an institution appears on the National Bank of Cambodia (NBC) regulated-entity list, with the source and date checked.
- Read and submit structured, useful reviews based on real experiences.
- Compare institutions and financial products using understandable terms.
- Learn common financial concepts in Khmer.
- Ask an AI consultant general questions about borrowing, saving, and choosing an account without presenting the answer as professional financial advice.

The first release should build trust and help users understand their options. It should not rank lenders by who pays the platform, approve loans, collect loan applications, or claim that a user can afford a loan.

## 2. Trust model and terminology

The app must distinguish these concepts clearly:

- **NBC regulated:** the institution appears in the relevant official NBC list and was checked on a displayed date.
- **CMA member:** the institution appears in the Cambodia Microfinance Association member directory. This is supplementary information, not proof of an NBC license.
- **Not yet verified:** the app has not matched the institution to a current NBC source. This must not be labeled “unlicensed” unless an authorized administrator has confirmed that conclusion from an official source.
- **Institution-provided:** product rates, fees, and conditions supplied by the institution or taken from its published material.
- **Community review:** user-generated content that is not endorsed by NBC, CMA, or the platform.

Every verification badge opens a small details panel showing the regulator, institution category, official name, source link, source publication/update date, and the date the app last checked it.

## 3. MVP scope

### Included

1. Khmer-first responsive interface with an English language switch.
2. Browse and search institutions by name and common alias.
3. Filter by institution type, verification state, province/service area, deposit-taking capability, and average rating.
4. Institution profile with verification evidence, contact information, products, disclosures, and reviews.
5. Account creation and sign-in for reviewers.
6. One review per user per institution, editable by its author.
7. Review reporting and an administrator moderation queue.
8. Financial glossary and short learning articles in Khmer and English.
9. AI consultant with guarded, educational answers, citations to curated content, and clear limitations.
10. Small administrator area for institutions, verification records, sources, glossary content, and moderation.

### Deferred

- Loan applications or lender lead generation.
- Payments, open banking, credit reports, or identity-document uploads.
- Public replies from institution representatives.
- Personalized product ranking based on sensitive financial data.
- Native mobile apps; start with a mobile-first progressive web app.
- Automated scraping that publishes changes without human review.

## 4. Core user journeys

### Check an institution

Home → search by Khmer/English name → institution card → profile → verification details → official source.

### Find a suitable option

Explore → choose “loan,” “savings,” or “account” → simple filters → compare up to three institutions → read product disclosures and reviews → visit the institution’s official channel.

### Review an institution

Profile → sign in → rate structured categories → describe experience → confirm firsthand-experience policy → submit → moderation checks → publish.

Suggested review dimensions: transparency of fees, staff treatment, application experience, repayment/service experience, and overall rating. Do not ask reviewers to reveal account numbers, national ID numbers, phone numbers, exact debt balances, or staff members’ personal information.

### Ask the consultant

Consultant → choose a prompt or type in Khmer/English → answer a short optional situation form → receive educational guidance, assumptions, risks, questions to ask a lender, and links to relevant glossary entries or verified institution pages.

## 5. Information architecture

Primary mobile navigation:

1. **Home** — search, category shortcuts, trust explanation, featured learning content.
2. **Explore** — results, filters, sorting, compare tray.
3. **Consult** — AI conversation and saved conversations for signed-in users.
4. **Learn** — glossary and practical guides.
5. **Profile** — reviews, saved institutions, language, and privacy controls.

Routes:

```text
/
/institutions
/institutions/$slug
/compare?ids=...
/consult
/learn
/learn/$slug
/login
/profile
/admin/*
```

## 6. Cambodian UX direction

- Default to Khmer when the browser language is Khmer; always expose a visible `ខ្មែរ / English` switch.
- Use plain Khmer reviewed by a native financial-literacy editor, not raw machine translation.
- Use a Khmer-capable font such as Noto Sans Khmer and verify line height, wrapping, numerals, and text density on low-cost Android devices.
- Design mobile-first for 360 px screens, intermittent connectivity, and low bandwidth.
- Keep primary actions large, labels explicit, forms short, and each screen focused on one decision.
- Support KHR and USD, always label the currency, and never silently convert a quoted product amount.
- Use familiar province names and tolerant Khmer/Latin transliteration search.
- Avoid red/green as the only status signal; combine color, icon, and text.
- Use skeletons sparingly and preserve search/filter state in the URL.
- Provide empty states and error messages in both languages.
- Meet WCAG 2.2 AA for contrast, focus, keyboard access, labels, and reduced motion.

Initial visual direction: calm indigo/teal, warm neutral surfaces, rounded cards, restrained shadows, a neutral geometric placeholder mark, and the text “No Name” only where a label is technically required. Keep the brand tokenized so it can be replaced in one place.

## 7. Recommended stack

### Frontend

- React + TypeScript + Vite.
- TanStack Router for typed, file-based routes and URL-backed filters.
- TanStack Query v5 for server-state conventions, loading/error behavior, mutations, and non-Convex HTTP calls.
- `@convex-dev/react-query` for Convex/TanStack integration where it is helpful. It is currently beta, so isolate it behind feature-level query helpers and use Convex’s standard React hooks if an adapter limitation appears.
- Tailwind CSS for design tokens and responsive styling.
- shadcn/ui or Radix primitives for accessible behavior; restyle components to avoid a generic template appearance.
- React Hook Form + Zod for client forms and shared validation concepts.
- `next-intl`-style message organization or i18next for `km` and `en` catalogs (with Khmer as the product default, not an afterthought).
- Lucide icons, with text labels on important actions.

### Backend

- Convex database, queries, mutations, actions, scheduled jobs, file storage, and full-text search.
- Convex Auth or Clerk. Start with email/OTP or Google; add Cambodian phone OTP only after evaluating provider cost, delivery, and account-recovery risks.
- A server-side Convex action for the AI provider so no API key reaches the browser.
- Transactional email provider for account and moderation messages when needed.

### Quality and operations

- Bun as the package manager and local script/test runtime (`bun install`, `bun run`, and `bunx`). Commit `bun.lock` and pin the supported Bun version in `package.json` and CI.
- Vitest + Testing Library for unit/component tests.
- Playwright for critical Khmer and English user journeys.
- ESLint and Prettier (or Biome, if the team prefers one tool).
- Sentry for production error monitoring and privacy-conscious product analytics such as Plausible or PostHog.
- Vercel, Cloudflare Pages, or Netlify for the Vite application; Convex hosts backend functions and data.

## 8. Proposed repository structure

```text
.
├── convex/
│   ├── schema.ts
│   ├── institutions.ts
│   ├── institutionSources.ts
│   ├── reviews.ts
│   ├── moderation.ts
│   ├── glossary.ts
│   ├── consultation.ts
│   ├── users.ts
│   ├── crons.ts
│   └── seed.ts
├── public/
├── scripts/
│   └── import-institutions.ts
├── src/
│   ├── components/
│   ├── features/
│   │   ├── institutions/
│   │   ├── reviews/
│   │   ├── compare/
│   │   ├── learn/
│   │   └── consult/
│   ├── i18n/
│   │   ├── km.json
│   │   └── en.json
│   ├── lib/
│   ├── routes/
│   ├── styles/
│   └── main.tsx
├── tests/
└── PROJECT_PLAN.md
```

## 9. Convex data model

Use Convex validators for every public function and indexes for every list/search path.

### `institutions`

- `slug`, `officialName`, `nameKm`, `aliases[]`
- `type`: `commercial_bank | specialized_bank | mdi | mfi | leasing | rural_credit | other`
- `descriptionKm`, `descriptionEn`
- `logoStorageId?`, `website?`, `phones[]`, `email?`, `address?`
- `provinces[]`, `services[]`, `acceptsDeposits`
- `status`: `active | renamed | merged | closed | unknown`
- `verificationState`: `nbc_verified | not_yet_verified | needs_review`
- `currentVerificationId?`
- `published`, `createdAt`, `updatedAt`

Indexes: slug, type/status, verification/type, published/name; search indexes for official name, Khmer name, and aliases (normalize aliases into searchable text if required by the search-index shape).

### `verificationRecords`

- `institutionId`, `regulator`, `category`, `licenseNumber?`
- `sourceId`, `sourceRecordName`, `sourceUpdatedAt?`
- `checkedAt`, `validFrom?`, `validTo?`
- `result`, `notes?`, `reviewedBy`

Never overwrite history. Add a record and point the institution to the current one.

### `sources`

- `publisher`, `title`, `url`, `sourceType`
- `publishedAt?`, `retrievedAt`, `contentHash?`
- `status`, `notes?`

### `products`

- `institutionId`, `type`, localized name/description
- `currency[]`, `minAmount?`, `maxAmount?`
- `interestRateText?`, `feesText?`, `termText?`, `eligibilityText?`
- `sourceUrl`, `sourceCheckedAt`, `status`

Rates and fees change; show the source date and avoid computing “best” without normalized, reviewed data.

### `reviews`

- `institutionId`, `userId`, category ratings, `overallRating`
- `title?`, `body`, `language`, `experienceDateRange?`
- `status`: `pending | published | rejected | hidden`
- `moderationReason?`, `editedAt?`, timestamps

Unique behavior: enforce one active review per user/institution in the mutation. Store rating aggregates on the institution or a separate aggregate table and update them transactionally on publish/edit/hide.

### Other tables

- `reviewReports`: reporter, review, reason, notes, status, timestamps.
- `glossaryTerms`: slug, localized term/definition/example, related terms, sources, status.
- `articles`: localized title/body/summary, citations, reviewer, reviewed date, status.
- `consultationThreads` and `consultationMessages`: owner, locale, redacted content, citations, safety flags, timestamps.
- `savedInstitutions`: user/institution/timestamp.
- `adminAuditLog`: actor, action, entity, before/after summary, timestamp.

## 10. API/function boundaries

Public queries:

- `institutions.search`, `institutions.getBySlug`, `institutions.compare`
- `reviews.listForInstitution`, `reviews.getSummary`
- `glossary.search`, `articles.list/getBySlug`

Authenticated mutations:

- `reviews.upsertMine`, `reviews.deleteMine`, `reviews.report`
- `savedInstitutions.toggle`
- `consultation.createThread`, `consultation.deleteThread`

Admin mutations:

- institution/source/verification CRUD and publish operations
- moderation decisions
- glossary/article review and publish operations

Actions:

- `consultation.respond` for the AI provider and retrieval pipeline.
- source import/fetch actions only where legally and technically appropriate.

Authorization must be checked inside every Convex function; hiding an admin button in React is not authorization.

## 11. Institution data ingestion and verification

Use a human-reviewed import pipeline:

1. Register each official source with publisher, URL, category, and retrieval date.
2. Parse a downloaded list into staging data; do not publish it directly.
3. Normalize whitespace, corporate suffixes, Khmer/Latin text, and known aliases.
4. Match against existing records and show exact/new/changed/ambiguous results to an administrator.
5. Approve changes and create immutable verification records.
6. Display “last checked” publicly.
7. Run a monthly reminder/check job and alert admins when an official source changes.

Start from NBC’s current category-specific regulated-entity pages, not only the supplied older PDF path. Seed CMA membership as a separate fact. The CMA directory groups entries into banks, MDIs, MFIs, leasing institutions, and rural credit institutions, which is useful for discovery but should not replace NBC verification.

Do not copy institution marketing descriptions as platform-authored claims. Store provenance and prefer short neutral summaries.

## 12. Reviews and moderation

- Require authentication, a minimum meaningful length, and confirmation of firsthand experience.
- Block secrets and obvious personal identifiers before submission.
- Add rate limits per account and device/IP signal where available.
- Detect duplicate/spam content and suspicious rating bursts.
- Allow reports for personal information, harassment, fraud allegations without evidence, spam, or conflicts of interest.
- Keep moderation decisions and edits auditable.
- Publish a review policy and an appeal/contact route.
- Show rating distribution and review count; do not overemphasize an average based on very few reviews.
- Label incentivized or institution-affiliated reviews if they are ever allowed; simplest MVP policy is to prohibit them.

## 13. AI consultant design

The consultant is an educational decision-support tool, not a lender or licensed adviser.

### Response contract

Each answer should contain:

1. A short understanding of the user’s goal.
2. Key considerations and risks.
3. A simple affordability check the user can perform.
4. Questions to ask a bank/MFI.
5. Relevant glossary and verified institution links.
6. Assumptions and a visible “general information, not professional advice” note.

### Guardrails

- Never guarantee approval, savings, returns, or affordability.
- Never tell a user to conceal information or borrow from an unverified lender.
- Avoid a definitive “take this loan” answer; explain tradeoffs and options.
- Minimize sensitive collection. Ask for ranges rather than exact income/debt where possible and warn users not to enter IDs, account numbers, passwords, or one-time codes.
- Redact likely secrets before storing or sending content to the model.
- Retrieve only approved glossary/articles and current institution facts; attach citations to claims.
- Refuse requests to forge documents, evade repayment, or commit fraud.
- Provide escalation language for debt distress and links to authoritative consumer-support channels approved by the product owner.
- Add input/output moderation, rate limits, token limits, timeouts, and a kill switch.
- Store model/prompt version and cited content IDs for auditability, subject to a documented retention policy.

The first AI milestone can be a guided questionnaire plus retrieval-based answer. This will be safer and easier to evaluate than an unrestricted chatbot.

## 14. Privacy and security baseline

- Write a Khmer and English privacy notice before collecting reviews or chat history.
- Collect the minimum data required; do not collect national IDs or bank credentials.
- Make chat saving opt-in or provide a clear history-delete control.
- Define retention periods for rejected reviews, reports, AI messages, and audit logs.
- Validate input on the server, escape rendered user content, restrict file types, and add Content Security Policy headers.
- Keep all provider keys in Convex environment variables.
- Separate user/admin roles, require stronger authentication for admins, and log privileged changes.
- Back up/export critical curated data and test restoration.
- Obtain Cambodian legal review before launch for financial-advice language, consumer protection, privacy, defamation/moderation, and use of regulator/institution names and logos.

## 15. Delivery phases

### Phase 0 — Decisions and prototype (2–4 days)

- Confirm working brand tokens and placeholder mark.
- Create a clickable, responsive Khmer-first UI using realistic sample institutions.
- Test home, explore, institution profile, reviews, learn, and consultant screens at 360 px and desktop.
- Review terminology with Khmer speakers before schema/content scale-up.

Exit: the owner can run the app locally and see the complete visual direction with fixture data.

### Phase 1 — Foundation (3–5 days)

- Scaffold React/Vite/TypeScript with Bun, TanStack Router/Query, Tailwind, i18n, tests, and Convex.
- Define design tokens, application shell, error boundaries, and CI.
- Implement schema, seed script, role checks, and repository conventions.

Exit: checks pass and preview deployments work.

### Phase 2 — Directory and verification (1–2 weeks)

- Build reviewed NBC/CMA import flow and admin staging screen.
- Implement search, filters, institution profiles, source details, and comparison.
- Seed an initial reviewed set across institution categories.

Exit: every public verification claim has source provenance and a check date.

### Phase 3 — Reviews and accounts (1 week)

- Add authentication, review create/edit, summaries, reports, moderation, and audit history.
- Add abuse controls and reviewer privacy guidance.

Exit: review policy is enforced end to end and moderation is usable on mobile.

### Phase 4 — Learn (3–5 days)

- Add glossary, articles, bilingual search, related terms, citations, and admin publishing.
- Commission/review the first high-value Khmer terms: principal, interest rate, effective cost, collateral, guarantor, installment, late fee, refinancing, deposit insurance, and credit report.

Exit: content has named provenance, review status, and reviewed date.

### Phase 5 — AI consultant beta (1–2 weeks)

- Add guided intake, retrieval from approved content, cited responses, guardrails, feedback, deletion, and evaluation logs.
- Run Khmer/English safety and usefulness evaluations before public access.

Exit: agreed evaluation set passes and the feature can be disabled instantly.

### Phase 6 — Launch readiness (1 week)

- Accessibility, performance, security, privacy, content, and legal review.
- Production monitoring, backups/export, analytics, support workflow, and incident runbook.
- Small Cambodian user test across varying financial and digital literacy levels.

## 16. MVP acceptance criteria

- A Khmer-speaking mobile user can find an institution and understand its verification state in under one minute.
- Verification never relies on CMA membership alone and always exposes a source/check date.
- Search handles common English names, Khmer names, and curated aliases.
- A signed-in user can submit/edit one review per institution without exposing sensitive details.
- Admins can resolve reports and update institution verification without editing the database manually.
- All primary flows work at 360 px, by keyboard, and in both languages.
- The consultant cites approved app content, displays limitations, avoids definitive loan instructions, and supports history deletion.
- Automated tests cover verification presentation, authorization, review aggregation, moderation, language switching, and AI guardrail cases.

## 17. Initial backlog

1. Scaffold the app and make the six key screens viewable with fixtures.
2. Agree on Khmer labels and verification terminology.
3. Create the Convex schema, indexes, seed flow, and role helpers.
4. Build the institution directory and profile.
5. Build source provenance and administrator verification workflow.
6. Add compare and saved institutions.
7. Add authentication, reviews, reports, and moderation.
8. Add glossary/articles and editorial workflow.
9. Add guided AI consultation and evaluation suite.
10. Complete launch review and limited beta.

## 18. Source notes

- [National Bank of Cambodia — commercial banks](https://www.nbc.gov.kh/english/supervision/commercial_banks.php): use NBC’s regulated-entity pages as the primary verification source and retain each category’s update date.
- [National Bank of Cambodia — banking institutions overview](https://www.nbc.gov.kh/english/payment_systems/banking_institutions.php): explains NBC licensing/supervision and the sector’s institution categories.
- [Supplied NBC commercial bank PDF](https://www.nbc.gov.kh/download_files/data/english/En/EN-Commercial%20Bank.pdf): retain as an input reference, but verify freshness against the current regulated-entity page before importing.
- [Cambodia Microfinance Association — member directory](https://www.cma-network.org/member-profile): use for CMA membership and discovery, not as the regulatory source of truth.
- [Convex with TanStack Query](https://docs.convex.dev/client/tanstack/tanstack-query): the official adapter provides reactive TanStack Query integration but is currently labeled beta.
- [TanStack Query for React](https://tanstack.com/query/latest/docs/framework/react/installation) and [TanStack Router with Vite](https://tanstack.com/router/latest/docs/installation/with-vite): frontend integration references.

## 19. Decisions still needed (non-blocking for the prototype)

- Permanent product name and logo.
- Whether the public beta includes all NBC categories or launches with commercial banks, specialized banks, MDIs, and MFIs first.
- Authentication method and whether anonymous reviews are ever allowed (recommended: no).
- Which AI provider and content-retention setting meet the project’s privacy needs.
- Who has authority to approve verification changes and Khmer financial content.
- Hosting, domain, support channel, and launch budget.
