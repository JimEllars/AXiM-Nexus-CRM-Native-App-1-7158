# AXiM internal CRM activation

## Launch gates

The Pages application can be deployed, but do not activate it for customer data until every item below is complete. Browser code authenticates with the Supabase anon key; only Supabase row-level security (RLS), not React route guards, can enforce access isolation.

1. In Supabase, create an `organizations` record for AXiM and retain its UUID.
2. Create Mr. Ellars' Supabase Auth user using his verified AXiM email. Do not use a shared account.
3. Create an `organization_members` record for that user with `role = 'owner'`.
4. Add `organization_id uuid not null` to every tenant-owned table: `accounts`, `contacts`, `deals`, `activities`, `campaigns`, `tasks`, and `workflows`. Backfill all existing AXiM records before applying `NOT NULL`.
5. Add a `BEFORE INSERT` trigger for browser-originated writes that stamps `organization_id` from the authenticated user's `organization_members` row. The Pages Function supplies the AXiM organization UUID explicitly because it uses the server-side service role.
6. Enable RLS on those tables and permit queries and writes only when the authenticated user has a matching `organization_members` record. Apply the same organization predicate to Supabase Realtime publication policies.
7. Set the Pages build variables and Function secrets listed in the README, then deploy the `main` branch to the existing `axim-nexus-crm-native-app-1-7158` project.
8. Confirm `POST /api/webhooks/inbound` returns `401` without `Authorization: Bearer <WEBHOOK_SECRET>` and `201` for a valid AXiM-controlled payload.

## Required Supabase access model

Use a database function based on `auth.uid()` to determine the caller's organization memberships. Every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policy must require a row's `organization_id` to be in that set. An owner policy should be limited to the `owner` role. The function endpoint uses the service-role key only to write inbound integration data with `AXIM_ORGANIZATION_ID`; it must never be moved to browser code.

AXiM is the initial and only organization. The same design supports future paid organizations: create a new organization and memberships, issue per-organization integration secrets, and leave the RLS predicates unchanged. Do not share AXiM's owner account, organization UUID, or webhook secret with any Ground Game organization.

## Ground Game internal integration

Ground Game may send only AXiM-controlled backend events to:

```text
POST https://axim-nexus-crm-native-app-1-7158.pages.dev/api/webhooks/inbound
Authorization: Bearer <AXIM_WEBHOOK_SECRET>
Content-Type: application/json
```

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "type": "B2B_LEAD",
  "source": "GROUND_GAME_INTERNAL"
}
```

The endpoint always stamps `AXIM_ORGANIZATION_ID` server-side and accepts only `GROUND_GAME_INTERNAL` or `AXIM_INTERNAL` sources. Ground Game users receive no CRM credentials, tenant membership, client configuration, or webhook secret.

## Internal operations

- Use **Directory → Import CSV** for contacts. Map `Contact Type` or choose the default B2B/B2C classification.
- Use **Account Matrix → Import CSV** for business accounts, or **New Account** for individual entry.
- Enrichment needs a server-side AXiM-controlled bridge. Do not set an unverified public URL in `VITE_ENRICHMENT_BRIDGE_URL`; the existing browser implementation cannot protect a credential.
- The current Pages deployment is not sufficient evidence of database readiness. Validate RLS with Mr. Ellars' account before importing real data.
