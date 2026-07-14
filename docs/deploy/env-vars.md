# Environment Variables Reference

This document maps and explains each environment variable used in the CyberSkill marketing landing page repository.

## Non-Negotiable Rules
- **No client-side secrets**: Secret keys (APIs, tokens) must **never** be prefixed with `NEXT_PUBLIC_`.
- **Server-side only**: All API keys and authorization tokens are consumed in Route Handlers or Server Components.
- **Environment Separation**: Production and preview deployments must use distinct keys to isolate user traffic/data.

---

## 1. AI & Chat Console (Genie)

### `ANTHROPIC_API_KEY`
- **Description**: The secret key for the Anthropic Messages API.
- **Where Set**: Server Environment (Vercel project environment variables).
- **Environments**:
  - **Dev**: Optional (Genie proxy falls back to a 503 if missing).
  - **Preview**: Required (isolated test key).
  - **Production**: Required (production-only key).
- **What breaks**: If missing in production, the `/api/genie` endpoint fails closed with a 500 configuration error. If missing in dev, the chat fallback indicates the Genie is currently resting and directs the user to the contact form.

### `GENIE_MODEL`
- **Description**: The model ID pinned for the Genie chat (e.g. `claude-haiku-4-5-20251001`).
- **Where Set**: Server Environment.
- **Environments**: Dev, Preview, Production.
- **What breaks**: Falls back to `claude-haiku-4-5-20251001` if absent. If an invalid model string is supplied, API calls return 400.

### `GENIE_MAX_TOKENS`
- **Description**: Maximum tokens to generate per Genie chat turn.
- **Where Set**: Server Environment.
- **Environments**: Dev, Preview, Production.
- **What breaks**: Falls back to `600` if absent.

---

## 2. Lead Capturing & Routing (/api/lead)

### `RESEND_API_KEY`
- **Description**: API key for sending email notifications to the company inbox via Resend.
- **Where Set**: Server Environment.
- **Environments**:
  - **Dev**: Optional (sends are skipped).
  - **Preview**: Required (test key).
  - **Production**: Required (production-only key).
- **What breaks**: If absent in production, lead submission fails closed with a 500 configuration error.

### `LEAD_EMAIL_FROM`
- **Description**: Sender email address to use for lead notifications (must be verified on Resend).
- **Where Set**: Server Environment.
- **Environments**: Dev, Preview, Production (Optional).
- **What breaks**: Defaults to `leads@<configured-domain>` (e.g. `leads@cyberskill.world`).

### `LEAD_STORE_DIR`
- **Description**: Local directory to save lead submissions as a durable JSONL file.
- **Where Set**: Server Environment (VPS mount paths/local paths).
- **Environments**: Dev, Preview, Production (Optional).
- **What breaks**: Defaults to `<working-directory>/.data`.

### `LEAD_SLACK_WEBHOOK_URL`
- **Description**: Incoming Slack webhook URL to send notifications of new leads.
- **Where Set**: Server Environment.
- **Environments**: Dev, Preview, Production (Optional).
- **What breaks**: Slack notifications are skipped if absent.

### `LEAD_CRM_WEBHOOK_URL`
- **Description**: CyberOS lead intake webhook URL (system of record).
- **Where Set**: Server Environment.
- **Environments**:
  - **Dev**: Optional (skipped).
  - **Preview**: Required (pointing to staging or test instance).
  - **Production**: Required (pointing to production intake).
- **What breaks**: If absent in production, lead submission fails closed with a 500 configuration error.

### `LEAD_CRM_TOKEN`
- **Description**: Bearer auth token for the CyberOS lead intake webhook.
- **Where Set**: Server Environment.
- **Environments**: Dev, Preview, Production.
- **What breaks**: Omitted from headers if absent; if required by the target webhook, submissions will reject with 401.

---

## 3. Analytics & Funnels (/api/analytics)

### `ANALYTICS_WEBHOOK_URL`
- **Description**: Optional webhook URL for forwarding first-party cookieless analytics events.
- **Where Set**: Server Environment.
- **Environments**: Dev, Preview, Production (Optional).
- **What breaks**: Events are logged to console/server logs only if absent.

---

## 4. Public Config (Safe to Expose)

### `NEXT_PUBLIC_SITE_URL`
- **Description**: Absolute canonical origin of the site, used for absolute URLs (canonical tags, sitemaps, OG images).
- **Where Set**: Client/Server Environment.
- **Environments**: Dev, Preview, Production.
- **What breaks**: Defaults to `https://cyberskill.world` if absent or Vercel preview host (to prevent drift).

### `NEXT_PUBLIC_BOOKING_URL`
- **Description**: Optional public booking calendar URL (https). When set, the “Book a 30-minute call” control renders on contact and thank-you (FR-CTA-005). No third-party booking script is loaded.
- **Where Set**: Client/Server Environment (public).
- **Environments**: Dev (optional), Preview (optional), Production (optional).
- **What breaks**: Control is hidden when unset or non-http(s).

### `NEXT_PUBLIC_LUMI_GLB`
- **Description**: Path to the 3D Lumi GLB model file.
- **Where Set**: Client/Server Environment.
- **Environments**: Dev, Preview, Production.
- **What breaks**: Renders procedural placeholder canvas if absent.
