# AXiM Nexus CRM (Vite + React)

This app is now wired for **Cloudflare Pages** deployment with SPA-safe routing and optional Cloudflare telemetry hooks.

## Local setup

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` and set values:

- `VITE_SUPABASE_URL` (required)
- `VITE_SUPABASE_ANON_KEY` (required)
- `VITE_CF_WEB_ANALYTICS_TOKEN` (optional, Cloudflare Web Analytics)
- `VITE_CF_TELEMETRY_ENDPOINT` (optional, custom beacon endpoint)

## Cloudflare Pages setup

1. Authenticate Wrangler:
   ```bash
   npx wrangler login
   ```
2. Create a Pages project (one-time):
   ```bash
   npm run cf:project:create -- <your-pages-project-name>
   ```
3. Add required app variables in Cloudflare Pages project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy:
   ```bash
   npm run cf:deploy -- --project-name=<your-pages-project-name>
   ```

## Cloudflare-focused scripts

- `npm run cf:dev` — serve built assets with `wrangler pages dev dist`
- `npm run cf:project:create -- <name>` — create a Pages project
- `npm run cf:deploy -- --project-name=<name>` — build and deploy to Pages

## Notes

- SPA route fallback is configured via `public/_redirects` (`/* /index.html 200`).
- Cloudflare analytics and telemetry only run when corresponding env vars are set.
