# Follow-Up Build Prompt: AXiM Nexus CRM (Next Increment)

## 1. Project Context & Current State
We are in **production mode** for the AXiM Nexus CRM. We have a React/Vite application connecting statelessly to Supabase and deployed on Cloudflare Pages.

### Recent Accomplishments
* **Context-Aware Forms:** Successfully modified `CreateContactModal.jsx` to hide the "Associated Account" dropdown when ingesting B2C entities. It now intercepts the form payload to force `account_id` to `null` before writing to the database, preventing foreign key constraint errors.
* **Bulk Checkbox State Tracking:** Implemented a robust checkbox tracking system in `Directory.jsx`. Checkbox state is correctly preserved across pagination using a centralized array (`selectedIds`) and Set operations. We have a bulk action button ("Enrich Selected") currently outputting payloads to `console.log`.

### What Needs Buttoning Up
While the UI components and state logic are in place, the **Bulk Enrichment system** is not fully wired up to our backend bridge, and we lack the necessary telemetry to monitor the health of these data ingestion and enrichment tasks. We need to focus on completing this end-to-end flow.

---

## 2. Strategic Focus (95/5 Rule)
As we move forward, **95% or more of our efforts** must be strictly dedicated to:
* **Activating Current Systems:** Wiring up the bulk action buttons to actual API endpoints and database services.
* **Telemetry & Observability:** Implementing activity logging for bulk actions so we can track usage and errors.
* **Modernizing UI & Design:** Refining our Tailwind CSS layouts, standardizing error/empty states, and ensuring the interface remains fast and top-of-the-line.
* **Reinforcing Capabilities:** Ensuring Cloudflare edge capabilities are leveraged effectively and the app remains stateless.

Only **5% or less** of our time should involve net-new features. Our goal is **small, strategic increments**—do not stack tasks into unnecessarily long workflows. We work on a small increment, test it, publish it, and move on.

---

## 3. Next Manageable Task: Wire Bulk Enrichment & Telemetry

Your goal for this sprint is to securely wire the bulk enrichment functionality in the Directory, provide UI feedback, and log the system events.

### Step 1: Wire Up the Data Layer (`enrichmentService.js`)
* Update `src/services/enrichmentService.js` to handle bulk enrichment operations. Since the bridge expects single entities, you can either implement a Promise.all() loop with concurrency control to send multiple requests, or if the bridge supports it, introduce a batch enrichment method.
* Ensure errors are caught safely so that one failed enrichment doesn't necessarily crash the whole bulk batch.

### Step 2: Connect the UI (`Directory.jsx`)
* Replace the `console.log('Bulk Enrichment Payload:', selectedIds)` in `Directory.jsx` with a call to your new bulk enrichment service.
* Implement a robust loading state. The button should disable and change text (e.g., "Enriching...") while the operation is ongoing.
* Use `react-toastify` to render global notifications on success or partial failure.
* Clear the `selectedIds` state once the bulk enrichment is successfully triggered.

### Step 3: Implement Telemetry & System Logging (`CrmContext.jsx` & `activityService.js`)
* Integrate with `activityService.js` to log these bulk enrichments.
* On successful bulk enrichment dispatch, write a system event (similar to `SYSTEM_EVENT` in `bulkAddContacts` within `CrmContext.jsx`), noting the number of entities queued for enrichment and the agent/user responsible.
* Ensure failed attempts or bridge errors also trigger a telemetry log if possible, keeping visibility high.

### Step 4: UI/Design Polish
* Review `Directory.jsx` for any styling inconsistencies on the new bulk actions bar.
* Ensure all elements adhere to our enterprise-grade Tailwind design, including the focus rings and hover transitions.
* Remember to "fail fast": crash gracefully or render a clear empty state rather than relying on mock data if Supabase connections fail.

---

## 4. Work Guidelines
1. **Explore First:** Review `Directory.jsx`, `enrichmentService.js`, and `CrmContext.jsx` to understand the existing logic before coding.
2. **Commit Often:** Make small adjustments and check functionality.
3. **Pre-commit Verification:** Before completing, run any QA checks outlined in `AGENTS.md` or the `LOCAL_QA_SIGNOFF.txt`.
4. **Publish & Finish:** Once the bulk enrichment flow works end-to-end, submit your changes. Do not try to add more features. We will open a fresh task next.
