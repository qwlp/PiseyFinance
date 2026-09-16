# FinCheck (Finឆែក)

Khmer-first responsive prototype for exploring Cambodian financial institutions. It implements the Phase 0 visual flows from `PROJECT_PLAN.md` with fixture data.

The National Bank of Cambodia logo is sourced from Wikimedia Commons and used under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

```bash
bun install
bun run convex:dev  # authenticate, create/select a deployment, and keep functions synced
bun run db:seed     # in another terminal after convex:dev creates .env.local
bun run dev
```

Chat uses `google/gemini-2.5-flash-lite` through OpenRouter by default. Set
`OPENROUTER_MODEL` to another OpenRouter model ID to override it.

For Vercel, configure `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` for the
same Convex deployment, and set `VITE_SITE_URL` and `OPENROUTER_SITE_URL` to
the public site origin. Store `OPENROUTER_KEY` as a server-only secret.
The `/api/chat` function shares its handler with the local Vite server.
Redeploy after changing Vercel environment variables.

Authentication also requires `SITE_URL` **on Convex** to match the public
site origin (`bunx convex env set SITE_URL https://your-site.vercel.app`).
Select the deployment used by the frontend; use `--prod` only if the frontend
points to the project's production Convex deployment. Local development
should use a separate Convex deployment with its own localhost `SITE_URL`.

Institutions, verification/source fields, CSX listing status, glossary terms, and FinCheck assessment inputs are read from Convex. The seed command is idempotent and imports the reviewed local source snapshot in batches.

Official website research is stored in `src/data/official-websites.json`. The snapshot covers every institution in the local NBC/CMA directory, keeps a source URL for every discovered product page, and records unreachable or unpublished websites instead of inferring missing facts. Refresh all sites with:

```bash
bun run enrich:websites
```

For a targeted refresh, set `PISEY_CRAWL_ONLY` to comma-separated institution slugs. Product categories are discovery aids based on official-page text; they are institution-provided claims, not NBC verification. Rates, fees, eligibility, and terms are intentionally not guessed when a site does not publish machine-readable values.

Checks:

```bash
bun run test
bun run build
```

NBC verification currently covers the bank list in the local snapshot. CMA-only institutions remain explicitly “not yet verified” until they are matched against the current NBC regulated-entity files and reviewed before production use.
