# PiseyFinance
## Project description and development plan

**Prepared for:** Mentor discussion — Finclusion Innovate 2026  
**Prepared:** 10 September 2026  
**Primary theme:** Financial Literacy to Identify Formal and Informal Lenders  
**Secondary theme:** Consumer Protection in Finance  
**Stage:** Early software prototype; proposed scope and validation plan

### Project description

PiseyFinance is a Khmer-first financial information and education platform designed to help Cambodian borrowers and everyday banking customers understand financial institutions before choosing a service. It brings institution discovery, official-source checks, simple comparisons, and financial learning into one mobile-friendly experience, with an English language option.

The project addresses a practical decision: **“Who am I dealing with, what do these financial terms mean, and what should I check before I commit?”** Users will be able to search for an institution, examine its match to an official National Bank of Cambodia (NBC) source, follow its published contact channels, compare available information, and learn the meaning of unfamiliar terms. A guided educational assistant can support this journey where its answers can be grounded in reviewed information.

Our intended outcome is better-informed financial decisions, especially for people who have limited financial knowledge or find formal information difficult to navigate. PiseyFinance will provide information and education; lending, payments, and loan approval are outside the proposed scope.

### Problem and intended users

The Finclusion Innovate briefing identifies difficulty distinguishing formal lenders from informal lenders, understanding loan conditions, and recognizing the consequences of multiple loans. It also highlights confusion around consumer rights and complaint channels. These problems directly inform our proposal. [1, pp. 15–16]

Institution lists, product pages, and financial explanations serve different purposes. Our hypothesis is that bringing them into a clear Khmer-language journey will help users interpret the information and take a practical next step. We will test this hypothesis through interviews and observed tasks rather than assume that a directory alone changes borrowing behavior.

The initial pilot will focus on **Khmer-speaking first-time or less-experienced borrowers and banking customers who use smartphones**, recruited through university and community contacts. Interviews should include people beyond the student team’s immediate peer group. Small business owners and agricultural borrowers are potential later audiences, but their specialized financing needs will not drive the first release.

### Fit with Finclusion Innovate

| Competition focus | PiseyFinance contribution |
| --- | --- |
| Theme 1: identify formal and informal lenders | Source-linked institution checks, clear status explanations, Khmer financial education, and an educational loan-cost example. |
| Theme 2: consumer protection | Plain-language explanations of fees and obligations, questions to ask providers, and reviewed links to consumer-support channels. |
| Theme 3: digital financial safety — supporting benefit | Links to reviewed official channels and reminders that someone using a real institution’s name may still be impersonating it. |

The application should lead with Theme 1. Themes 2 and 3 explain supporting benefits. The first version will not claim to detect fraudulent links or authenticate individual callers. This keeps the proposal focused on the challenge described on page 15 of the briefing.

### Proposed user experience

Consider a first-time borrower who encounters a loan offer using a financial institution’s name. They search for that name in PiseyFinance, open its profile, and see the source and date behind its recorded regulatory status. They follow the published official contact channel to independently check the offer. They then compare available institution information, read an explanation of interest and fees, and review questions to ask before signing.

If an institution has not been matched to an official source, PiseyFinance explains that the status is **“not yet verified.”** A missing match does not automatically mean that the institution is unlicensed. Similarly, a listed institution’s name does not establish that a particular message or loan offer is genuine.

### Current foundation and competition scope

The repository already contains an early React and TypeScript prototype, a Convex data layer, Khmer and English interface text, institution profiles, side-by-side institution comparison, a financial glossary, review-submission code, and a chat interface. It also contains local institution-source snapshots and scripts for collecting published website information. These are development foundations; this proposal does not claim that a production launch, complete regulatory verification, or user-impact validation has occurred. [2]

The competition MVP will prioritize:

1. **Search and institution profiles:** Make a reviewed subset of institutions easy to find, with names, categories, official links, source dates, and understandable status labels.
2. **Transparent comparisons:** Compare institution categories, available services, and source-backed information. Display missing information clearly. Compare rates or fees only when their units, dates, and conditions are available and reviewed.
3. **Khmer financial learning:** Review an initial set of approximately 15–20 glossary entries and three short guides covering lender checks, loan costs, and questions before borrowing.
4. **A loan-cost learning example:** Complete or validate a simple calculator with explicit assumptions, currency, repayment frequency, and interest method. Explain the effect of changing the amount or term without claiming that a loan is affordable for a particular user.
5. **Consumer next steps:** Add a short checklist and source-linked support information reviewed with mentors before publication.

The AI assistant and community reviews are supporting features. The assistant should answer from approved educational material, provide sources, and acknowledge missing information. Public reviews require reliable account ownership, reporting, and moderation. If these controls cannot be completed within the competition schedule, the demonstration will use guided educational answers and clearly labeled review examples.

### Trust and data approach

Trust depends on explaining what each piece of information means. An NBC-source match, CMA membership, an institution’s own product description, and a community review will be shown as separate types of evidence. The current README notes that NBC matching covers the bank snapshot, while CMA-only entries still require matching and review. [2]

For the pilot, the team will maintain a manageable reviewed dataset, record source and review dates, and assign one team member responsibility for updates. Changes will be checked before publication. Unknown rates, fees, or eligibility conditions will remain unknown rather than be inferred. Regulatory badges must describe a source match and must not imply NBC endorsement of PiseyFinance.

Browsing and learning should not require financial account details. Research participants will use fictional financial scenarios, and the prototype will not request bank passwords, OTPs, identity documents, or loan applications.

### Development and validation plan

Dates below follow the supplied 24 August briefing; the mid-competition and final-pitch dates are explicitly tentative in that document. [1, pp. 21, 30]

| Period | Work and reviewable output |
| --- | --- |
| 10–20 September | Confirm the primary user group; conduct 6–8 short discovery interviews; review the prototype with mentors; prepare the problem, solution, impact, and creativity sections for submission. |
| By 21 September | Submit the application and a concise concept deck with screenshots, scope, and the proposed validation plan. |
| 28 September | Shortlist announcement in the briefing. If selected, confirm mentorship arrangements and milestones. |
| Early October | Review an initial dataset of roughly 20–30 institutions across selected categories; refine Khmer terminology; complete the core search, evidence, compare, and learning journey. |
| Late October–12 November | Test with approximately 15–20 intended users; assess comprehension and usability; validate calculator examples and any AI answers; fix the most consequential issues. |
| 13 November — tentative | Present the working journey, research findings, limitations, and remaining priorities at the mid-competition review. |
| 14–29 November | Retest changes with 5–8 participants; finalize operating responsibilities, budget, pitch, and a backup demonstration video. |
| 30 November — tentative | Deliver the final prototype demonstration and evidence of what users learned. |

The proposed team will cover product and research, development, financial-content and source review, and design and presentation. Roles may overlap within the briefing’s team size of 3–5 members. A financial-domain mentor and Khmer-language reviewer would support the content work. [1, p. 22]

### How we will measure impact

The pilot will measure understanding and task completion. Targets below are proposed success criteria, not existing results:

| Measure | Proposed pilot target |
| --- | --- |
| Find a named institution and open its supporting source without assistance | At least 80% of participants within two minutes. |
| Explain the difference between an official-source match, CMA membership, and “not yet verified” | At least 80% answer a short scenario correctly after using the app. |
| Understand basic borrowing terms | Average improvement of at least 20 percentage points between short pre-use and post-use quizzes. |
| Explain a loan-cost example | At least 80% identify the interest method and one cost or assumption affecting the result. |
| Trace pilot data | Every displayed regulatory-status claim has a source and review date; missing product information is labeled. |

We will report participant counts, task failures, and limitations alongside the results. A small pilot can demonstrate usability and learning; reduced over-indebtedness or fraud would require longer-term research.

### Differentiation, sustainability, and resources

PiseyFinance’s proposed distinction is the connection between **checking an institution, understanding the evidence, and learning what to ask next in Khmer**. Its value should be assessed against how participants currently use official lists, search engines, and institution websites. We will avoid claiming that the concept is unique until that comparison has been completed.

The initial distribution approach is mentor-supported university and community demonstrations. Potential financial-literacy organizations and institutional partners would be explored after pilot evidence is available; no partnership is assumed. Core access should remain free. Future grants or education sponsorship could support operations, provided sponsors cannot purchase verification status or influence comparisons.

A provisional cash budget is **USD 500**, excluding student development time and donated mentoring. This is a planning allowance, not a set of supplier quotations:

| Item | Allowance |
| --- | ---: |
| Participant transport and mobile-data support | $150 |
| Khmer content and financial-domain review | $150 |
| Hosting, domain, and capped AI usage during the pilot | $100 |
| Demonstration and outreach materials | $50 |
| Contingency | $50 |
| **Total** | **$500** |

Before a broader launch, the team will estimate recurring hosting, content maintenance, moderation, and support costs from actual pilot usage. The largest operational dependency is keeping information understandable and current.

### Guidance requested from mentors

We would particularly value feedback on:

- Whether the initial user group and Theme 1 focus address a sufficiently specific need.
- How to review source matching and explain institution status accurately in Khmer.
- Which borrowing concepts and consumer-support information should be prioritized.
- Access to suitable pilot participants and an independent content reviewer.
- Whether AI and public reviews should remain secondary until the core journey is validated.
- Whether the proposed targets, budget, and ongoing operating model are realistic.

For the final presentation, we propose a short Khmer-led demonstration following the briefing’s recommended structure: problem, target users, solution, impact, and implementation budget. The demonstration will show one complete user journey and the evidence gathered from testing. [1, pp. 24–25, 28]

### References and basis

**[1]** *Finclusion Innovate — Information Sharing Session*, 24 August 2026. Supplied PDF: `Finclusion Innovate_Info Sharing Session_20260824.pdf`. Relevant pages: 15–17 (themes), 21–23 (timeline and application), 24–25 (pitch and prototype), 28 (judging), and 30 (timeline repeated). Dates are reproduced from this briefing, not independently reconfirmed with organizers.

**[2]** PiseyFinance repository reviewed on 10 September 2026: `README.md`, `PROJECT_PLAN.md`, `src/main.tsx`, `src/InstitutionPage.tsx`, `src/ComparePage.tsx`, `src/data.ts`, and `convex/schema.ts`. Existing-feature descriptions are based on documentation and source inspection, not a live deployment audit. Scope, budget, sample sizes, and success targets in this proposal are recommendations for mentor discussion.
