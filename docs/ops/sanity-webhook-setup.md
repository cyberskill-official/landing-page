# Sanity Webhook Setup

This supports `FR-CMS-005`: Sanity publishes trigger a signed POST to the app, and the app invalidates the relevant ISR paths.

## Production Webhook

1. In Sanity Studio, open **API -> Webhooks -> Create webhook**.
2. Name: `Production revalidate`.
3. URL: `https://cyberskill.world/api/revalidate`.
4. Dataset: `production`.
5. Trigger on create, update, publish, and delete events.
6. Filter:

```groq
_type in ["case_study", "testimonial", "capability", "team_member", "job"]
```

7. Projection:

```groq
{
  "_id": _id,
  "_type": _type,
  "slug": slug,
  "i18n_locale": i18n_locale
}
```

8. Secret: generate a long random value and store it as `SANITY_WEBHOOK_SECRET` in the deployment environment.
9. Save the webhook and publish a draft smoke document to confirm a `200` response.

## Manual Revalidation

Manual revalidation is reserved for admin recovery. Configure `REVALIDATE_ADMIN_TOKEN` in the deployment environment, then call:

```bash
curl -X POST "https://cyberskill.world/api/revalidate?path=/work/sample" \
  -H "Authorization: Bearer $REVALIDATE_ADMIN_TOKEN"
```

Manual paths must start with `/`, must not traverse with `..`, and cannot target `/api/*` routes.

## Expected Responses

Successful webhook:

```json
{ "ok": true, "revalidated": true, "paths": ["/", "/work"], "tags": ["cms:case_study"] }
```

Invalid signature:

```json
{ "ok": false, "error": "invalid_signature" }
```

Rate limited:

```json
{ "ok": false, "error": "rate_limit" }
```

