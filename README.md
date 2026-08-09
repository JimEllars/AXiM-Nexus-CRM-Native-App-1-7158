# AXiM Nexus CRM (Vite + React)

This app is a **Cloudflare Pages** React frontend backed by Supabase. It is configured for AXiM's internal CRM launch, with an authenticated inbound endpoint for AXiM-controlled Ground Game integrations.

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
- `VITE_CRM_PUBLIC_URL` (production Pages URL; used when displaying the inbound webhook URL)

## Cloudflare Pages setup

1. Authenticate Wrangler:
   ```bash
   npx wrangler login
   ```
2. Create a Pages project (one-time):
   ```bash
   npm run cf:project:create -- <your-pages-project-name>
   ```
3. Add these production build variables in Cloudflare Pages project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CRM_PUBLIC_URL=https://axim-nexus-crm-native-app-1-7158.pages.dev`
4. Add these **Pages Function secrets**:
   - `WEBHOOK_SECRET` (a random value held only by AXiM integrations)
   - `SUPABASE_SERVICE_ROLE_KEY` (never expose as a `VITE_` variable)
   - `AXIM_ORGANIZATION_ID` (the AXiM organization UUID in Supabase)
5. Deploy:
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
- Complete the required Supabase tenant/RLS setup and Mr. Ellars owner bootstrap in [`docs/internal-launch.md`](docs/internal-launch.md) before production activation.
