# FR External Dependency Packet

Generated: 2026-05-18

This packet covers FRs that cannot be honestly completed inside this workspace because they require production assets, external credentials, operator access, or independent human sign-off. Mocks are valid only when they satisfy the FR acceptance criteria without misrepresenting the deliverable.

## Environment Template

Add production and preview values in Vercel environment settings, not in git.

```bash
HUBSPOT_API_KEY=
HUBSPOT_STAGE_BUY=inbound-discovery
HUBSPOT_STAGE_PARTNER=partner-pipeline
HUBSPOT_PIPELINE_BUY=default
HUBSPOT_PIPELINE_PARTNER=partners

ATS_API_KEY=
ATS_API_URL=

SLACK_WEBHOOK_URL=
PERF_ALERT_WEBHOOK_URL=

NEXT_PUBLIC_PLAUSIBLE_DOMAIN=cyberskill.world
PLAUSIBLE_DOMAIN=cyberskill.world
PLAUSIBLE_SITE_ID=cyberskill.world
PLAUSIBLE_API_KEY=

VERCEL_PROJECT_ID=
VERCEL_ORG_ID=
NEXT_PUBLIC_SITE_URL=https://cyberskill.world
SANITY_REVALIDATE_SECRET=
```

## Blender And Production Asset Chain

Blocked FRs: FR-CHAR-004, FR-CHAR-005, FR-CHAR-006, FR-CHAR-007, FR-CHAR-009, FR-CHAR-010, FR-CHAR-011, FR-CHAR-012, plus downstream scene/performance/SEO FRs that depend on these assets.

Reason: the FRs require real Blender-authored geometry, UVs, rigs, shape keys, animation clips, and raw GLB exports. Mock files are not acceptable because the acceptance criteria inspect actual asset structure.

Install and verify:

```bash
brew install --cask blender
blender --version
python3 tools/check-p1-greybox-assets.py
node scripts/gltf-pipeline.mjs
node tools/perf-budgets/check-asset-sizes.mjs --report=asset-summary.json
node tools/audit-fr-deliverables.mjs
```

Required source and export paths:

```text
assets-source/blender/lumi.v01.blend
assets-source/blender/lumi-sculpt.v01.blend
assets-source/blender/lumi-rig.v01.blend
assets-source/blender/lumi-shape-keys.v01.blend
assets-source/blender/lumi-animations.v01.blend
assets-source/blender/lumi-nonla.v01.blend
assets-source/blender/lumi-mesh-stats.json
assets-source/blender/lumi-uv-stats.json
assets-source/blender/lumi-rig-skinning-stats.json
assets-source/blender/lumi-shape-keys-stats.json
assets-source/blender/lumi-animation-stats.json
assets-source/blender/lumi-nonla-stats.json
assets-built/raw/lumi.raw.glb
assets-built/raw/lumi-nonla.raw.glb
```

Scene chain paths:

```text
assets-source/blender/scenes/scene-0-greybox.v01.blend
assets-source/blender/scenes/scene-1-greybox.v01.blend
assets-source/blender/scenes/scene-2-greybox.v01.blend
assets-source/blender/scenes/scene-3-greybox.v01.blend
assets-source/blender/scenes/scene-4-greybox.v01.blend
assets-source/blender/scenes/scene-5-greybox.v01.blend
assets-source/blender/scenes/scene-6-greybox.v01.blend
assets-source/blender/scenes/footer-greybox.v01.blend
assets-built/raw/scene-0-greybox.raw.glb
assets-built/raw/scene-1-greybox.raw.glb
assets-built/raw/scene-2-greybox.raw.glb
assets-built/raw/scene-3-greybox.raw.glb
assets-built/raw/scene-4-greybox.raw.glb
assets-built/raw/scene-5-greybox.raw.glb
assets-built/raw/scene-6-greybox.raw.glb
assets-built/raw/footer-greybox.raw.glb
```

## Substance And PBR Texture Chain

Blocked FR: FR-CHAR-008 and all downstream textured-production scene work.

Reason: the FR requires source texture authoring and exported texture maps. Placeholders cannot prove UV fit, packed ORM correctness, normal-map orientation, emissive ranges, or texture-budget compliance.

Required paths:

```text
assets-source/substance/lumi.spp
assets-source/substance/lumi-substance-export-preset.spexp
assets-built/raw/textures/lumi-BaseColor.png
assets-built/raw/textures/lumi-ORM.png
assets-built/raw/textures/lumi-Normal.png
assets-built/raw/textures/lumi-Emissive.png
assets-built/raw/textures/lumi-texture-stats.json
tools/texture-validator.py
design/character-sheets/lumi-texture-spec.md
```

Validation after delivery:

```bash
python3 tools/texture-validator.py
node scripts/gltf-pipeline.mjs
node tools/perf-budgets/check-asset-sizes.mjs --report=asset-summary.json
node tools/audit-fr-deliverables.mjs
```

## Decoder Bundle Decision

Blocked FRs: FR-OPS-005 and FR-OPS-004.

Reason: current pinned decoder candidates total 293 KB Brotli, above the FR-OPS-005 240 KB budget. This needs an explicit engineering/product decision before shipping decoder files.

Decision template:

```text
FR-OPS-005 decoder decision
Approved by:
Date:

Choose one:
- Option A: keep 240 KB cap and reduce decoder set to: [list exact decoders]
- Option B: raise decoder budget to: [new KB cap] because: [reason]
- Option C: defer KTX2/Draco/Basis until production asset chain proves need

Required follow-up:
- Update tools/perf-budgets/budgets.json.
- Add apps/web/public/decoders/README.md with source/version/license.
- Add scripts/sync-decoders.mjs and unit tests.
- Run no-CDN, bundle, asset-size, and Playwright smoke tests.
```

## Accessibility Consultant Sign-Off

Blocked FRs: FR-A11Y-012 and FR-A11Y-013.

Reason: automated axe tests pass locally, but the FR requires an independent manual audit with real VoiceOver, NVDA, JAWS, motor, cognitive, and color-blindness checks.

Consultant packet:

```text
Auditor:
Firm:
Date:
Build URL:
Commit SHA:
Tools:
- axe-core version:
- VoiceOver macOS version:
- VoiceOver iOS version:
- NVDA version:
- JAWS version:
- Browser versions:

Required flows:
- Tab from page load to Skip Story to CTA Hub.
- Scroll through narrative and verify captions/announcements.
- Open Buy form, validate errors, submit test payload, verify success announcement.
- Open Partner form, validate errors, submit test payload, verify success announcement.
- Open Join form, validate errors, submit test payload, verify success announcement.
- Switch language and verify language announcement.
- Toggle mute and verify state announcement.
- Switch to /lite and verify equivalent access.
- Test switch-control navigation.
- Test voice-control navigation.
- Review cognitive load and color-blindness simulations.
```

Archive output:

```text
docs/audits/a11y-pre-launch-YYYY-MM-DD.md
docs/audits/a11y-test-checklist.md
docs/audits/screenreader-flows.md
```

## Vietnamese Native Review

Blocked FRs: FR-CMS-009 and FR-CMS-010.

Reason: Vietnamese copy and tagline implementation exist, but the FR requires an out-of-team paid native review, receipt, and founder sign-off.

Reviewer packet:

```text
Reviewer:
Relationship to CyberSkill:
Native region / dialect context:
Engagement date:
Payment receipt:
Reviewed files:
- content/narrative/lines/vi.json
- apps/web/messages/vi.json
- content/accessibility/*.vi.md
- Footer, legal, form, and route copy

Review rubric:
- Casual, warm, dialect-neutral Vietnamese.
- Slightly poetic for Lumi narration.
- Plain and direct for UI.
- No over-formal phrases such as "Kinh chao quy khach".
- No machine-translation Westernisms.

Output file:
content/narrative/lines/native-review-YYYY-MM-DD.md
```

## HubSpot Sandbox Verification

Blocked FR: FR-CTA-009.

Reason: code, local tests, and build are complete, but the FR requires HubSpot test-environment verification and cleanup.

Required sandbox data:

```text
HubSpot private app token:
Buy pipeline ID:
Buy stage ID:
Partner pipeline ID:
Partner stage ID:
Test contact email prefix:
Sales Ops reviewer:
Cleanup owner:
```

Test payloads:

```bash
curl -X POST "http://127.0.0.1:3000/api/lead" \
  -H "content-type: application/json" \
  -H "x-forwarded-for: 203.0.113.41" \
  -d '{
    "track": "buy",
    "name": "Sandbox Buyer",
    "email": "sandbox-buyer+YYYYMMDD@cyberskill.world",
    "company": "Sandbox Co",
    "message": "Testing buy pipeline routing.",
    "locale": "en",
    "sceneId": "scene-6",
    "utm": {
      "source": "sandbox",
      "medium": "manual",
      "campaign": "fr-cta-009"
    }
  }'

curl -X POST "http://127.0.0.1:3000/api/lead" \
  -H "content-type: application/json" \
  -H "x-forwarded-for: 203.0.113.42" \
  -d '{
    "track": "partner",
    "name": "Sandbox Partner",
    "email": "sandbox-partner+YYYYMMDD@cyberskill.world",
    "company": "Sandbox Agency",
    "message": "Testing partner pipeline routing.",
    "locale": "en",
    "sceneId": "scene-6",
    "utm": {
      "source": "sandbox",
      "medium": "manual",
      "campaign": "fr-cta-009"
    }
  }'
```

Completion evidence:

```text
- Buy lead appears in the configured HubSpot buy pipeline and stage.
- Partner lead appears in the configured HubSpot partner pipeline and stage.
- Join lead does not create a HubSpot deal and routes to ATS/local ATS fallback.
- Unexpected stage alert is verified through Slack/email test channel.
- Sandbox contacts/deals are deleted after verification.
```

## Linear Or Asana Recurring Task

Blocked FR: FR-CMS-011.

Create this recurring task manually if no tracker connector is active.

```text
Title: Quarterly website content refresh

Cadence:
Every quarter on March 31, June 30, September 30, and December 31.
If the date is a non-working day, move to the previous working day.

Owner:
Founder

Collaborators:
Content/Marketing, Frontend, Vietnamese reviewer, A11Y reviewer

Description:
Refresh CyberSkill website content for the quarter.

Required scope:
- Add or refresh at least one case study.
- Refresh one or more testimonials.
- Verify headcount and public metrics.
- Review capabilities for new or retired services.
- Review team page for joiners, leavers, and role changes.
- Sync job listings with ATS.
- Maintain EN and VI parity for every public-facing content change.
- Run voice-rules checks before publish.
- Run Vietnamese native review for VI copy changes.
- Verify Sanity publish triggers ISR revalidation.
- Smoke test changed EN and VI routes.
- Archive the refresh log at docs/launch/refresh-{yyyy-q}.md.

Acceptance:
- Quarterly checklist complete.
- Refresh log committed.
- Known issues or deferred items linked to follow-up tickets.

Labels:
content, cms, launch-quality, quarterly
```

## Vercel Deployment And DNS

Blocked FR: FR-OPS-014.

Reason: deployment config and runbooks exist, but live production deploy, DNS cutover, CDN verification, HSTS preload, and rollback evidence need operator access.

Operator checklist:

```bash
vercel login
vercel link --yes --project <project-slug>
vercel env pull apps/web/.env.vercel
cd apps/web
node_modules/.bin/next build
vercel deploy --prod
```

DNS:

```text
cyberskill.world      A/CNAME per Vercel project instructions, TTL 300 during cutover
www.cyberskill.world  CNAME to Vercel, redirect to apex
```

Post-deploy verification:

```bash
curl -I https://cyberskill.world
curl -I https://www.cyberskill.world
curl https://cyberskill.world/api/health
cd apps/web && NEXT_PUBLIC_SITE_URL=https://cyberskill.world node_modules/.bin/playwright test --project=chromium
```

## Awards Submission

Blocked FR: FR-OPS-015.

Reason: the packet is ready, but public launch URL, production screenshots/video, submission accounts, and submission IDs are pending.

Required assets:

```text
docs/launch/awards-media/hero-scene0-1920x1080.jpg
docs/launch/awards-media/hero-scene5-1920x1080.jpg
docs/launch/awards-media/hero-scene6-1920x1080.jpg
docs/launch/awards-media/screencap-30s.mp4
docs/launch/awards-submission-packet.md
docs/launch/awards-credits.md
```

Submission tracker:

```text
Awwwards submission ID:
FWA submission ID:
CSSDA submission ID:
Submitted by:
Submitted at:
Public URL:
```

Do not submit or claim awards automatically. Use the manual schedule in `docs/launch/manual-posting-schedule-2026-05-18.md`.

## Soft Launch

Blocked FR: FR-OPS-016.

Reason: invitee and feedback templates exist, but the gated staging URL and final invite list are pending.

Required manual fields:

```text
Preview URL:
Password:
Preview window:
Invitee names:
Analytics property:
Owner for feedback triage:
```

Use `docs/launch/soft-launch-invitees.md` and `docs/launch/week-8-feedback.md` once the URL exists.

## Plausible RUM And Slack Alerts

Blocked FR: FR-PERF-011.

Reason: code-level event forwarding and dashboard guide exist, but live Plausible dashboard/API access and Slack alert verification require credentials.

Verification:

```bash
export PLAUSIBLE_API_KEY="<token>"
export PLAUSIBLE_SITE_ID="cyberskill.world"

curl -H "Authorization: Bearer $PLAUSIBLE_API_KEY" \
  "https://plausible.io/api/v1/stats/realtime/visitors?site_id=$PLAUSIBLE_SITE_ID"

curl -H "Authorization: Bearer $PLAUSIBLE_API_KEY" \
  "https://plausible.io/api/v1/stats/aggregate?site_id=$PLAUSIBLE_SITE_ID&period=7d&metrics=events&filters=event:name==web-vitals/LCP"
```

Shared dashboard URL template:

```text
https://plausible.io/share/cyberskill.world?auth=<token>
```

Slack alert template:

```text
Perf RUM weekly report
- LCP p75: {current} ms ({delta}% vs previous week)
- INP p75: {current} ms ({delta}% vs previous week)
- CLS p75: {current} ({delta}% vs previous week)
Flagged: {metric} on {route} / {breakpoint} / {connection} / {locale}
Next: compare Lighthouse CI run, recent deploys, and changed components.
```
