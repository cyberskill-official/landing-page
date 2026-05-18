# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/scene-0-dust.spec.ts >> Scene 0 dust publishes debug count and draw-call state
- Location: tests/web/scene-0-dust.spec.ts:3:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: undefined

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner "Accessibility controls" [ref=e2]:
    - link "Skip to call to action" [ref=e3] [cursor=pointer]:
      - /url: "#cta-hub"
      - text: Skip story
    - button "Muted" [pressed] [ref=e5] [cursor=pointer]:
      - img [ref=e6]
      - generic [ref=e9]: Muted
    - button "Skip 3D entirely" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
      - generic [ref=e15]: Skip 3D
    - button "Change language" [ref=e18]: EN
  - status:
    - paragraph:
      - generic: "Scene 1:"
      - text: Whisper an idea. I'll show you the rest.
  - generic [ref=e19]: Loading scene...
  - main [ref=e20]:
    - region "What if your will became real?" [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: CyberSkill
        - heading "What if your will became real?" [level=1] [ref=e24]
        - paragraph [ref=e25]: Senior software from Vietnam. Turn your will into real.
        - paragraph [ref=e26]: Whisper an idea. I'll show you the rest.
        - generic [ref=e27]:
          - link "Open the Book Discovery Call form" [ref=e28] [cursor=pointer]:
            - /url: "#cta-hub"
            - text: Book a Discovery Call
          - link "Open the Book Discovery Call form":
            - /url: "#cta-hub"
            - text: Book a Discovery Call
        - generic "Primary links" [ref=e29]:
          - link "Explore capabilities" [ref=e30] [cursor=pointer]:
            - /url: "#scene-3"
          - link "Partner track" [ref=e31] [cursor=pointer]:
            - /url: "#cta-hub"
          - link "Join track" [ref=e32] [cursor=pointer]:
            - /url: "#cta-hub"
          - link "Sample work" [ref=e33] [cursor=pointer]:
            - /url: /work/sample
          - link "Accessibility" [ref=e34] [cursor=pointer]:
            - /url: /accessibility
    - region "Capabilities" [ref=e35]:
      - heading "Capabilities" [level=2] [ref=e36]
      - link "Next scene ↓" [ref=e37] [cursor=pointer]:
        - /url: "#cta-hub"
    - region "What do you want to make real?" [ref=e38]:
      - generic [ref=e39]:
        - paragraph [ref=e40]: Three tracks
        - heading "What do you want to make real?" [level=2] [ref=e41]
        - paragraph [ref=e42]: Pick the path that matches your intent. Each portal is keyboard-first, analytics-ready, and decoupled from the canvas.
        - generic "Conversion tracks" [ref=e43]:
          - button "Buy Book a Discovery Call For builders who need senior partners. Open discovery flow For enterprise and SMB buyers who need a senior, English-fluent software partner without paying North America prices." [ref=e44] [cursor=pointer]:
            - generic [ref=e45]: Buy
            - generic [ref=e46]: Book a Discovery Call
            - generic [ref=e47]: For builders who need senior partners.
            - generic [ref=e48]: Open discovery flow
            - generic [ref=e49]: For enterprise and SMB buyers who need a senior, English-fluent software partner without paying North America prices.
          - button "Partner Partner With Us For agencies seeking white-label and co-delivery. Open partner flow For agencies and product studios that need a Vietnam-based delivery partner for React, Three.js, AI, and design-system work." [ref=e50] [cursor=pointer]:
            - generic [ref=e51]: Partner
            - generic [ref=e52]: Partner With Us
            - generic [ref=e53]: For agencies seeking white-label and co-delivery.
            - generic [ref=e54]: Open partner flow
            - generic [ref=e55]: For agencies and product studios that need a Vietnam-based delivery partner for React, Three.js, AI, and design-system work.
          - button "Join Join the Team For senior craftspeople, remote-first. Open join flow For senior engineers and designers who want a craft-led Vietnamese team, strong technical peers, and founder-accessible work." [ref=e56] [cursor=pointer]:
            - generic [ref=e57]: Join
            - generic [ref=e58]: Join the Team
            - generic [ref=e59]: For senior craftspeople, remote-first.
            - generic [ref=e60]: Open join flow
            - generic [ref=e61]: For senior engineers and designers who want a craft-led Vietnamese team, strong technical peers, and founder-accessible work.
  - contentinfo "Site footer" [ref=e62]:
    - region "Meet the founder" [ref=e63]:
      - heading "Meet the founder" [level=2] [ref=e64]
      - paragraph [ref=e65]: "Stephen Cheng — Trịnh Thái Anh — founded CyberSkill around one rule: build what you'd be proud to sign."
    - navigation "Footer" [ref=e66]:
      - link "We're hiring 3 - see open roles" [ref=e67] [cursor=pointer]:
        - /url: /work?role=open
      - link "Work" [ref=e68] [cursor=pointer]:
        - /url: /work/sample
      - link "Accessibility" [ref=e69] [cursor=pointer]:
        - /url: /accessibility
      - link "Lite mode" [ref=e70] [cursor=pointer]:
        - /url: /lite
  - generic [ref=e75] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e76]:
      - img [ref=e77]
    - generic [ref=e80]:
      - button "Open issues overlay" [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e83]: "2"
          - generic [ref=e84]: "3"
        - generic [ref=e85]:
          - text: Issue
          - generic [ref=e86]: s
      - button "Collapse issues badge" [ref=e87]:
        - img [ref=e88]
  - alert [ref=e90]
  - generic:
    - generic:
      - img "Lumi the golden genie waving hello"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('Scene 0 dust publishes debug count and draw-call state', async ({ page }) => {
  4  |   await page.goto('/?debug=dust');
  5  | 
  6  |   await expect(page.locator('#ScrollRig-canvas canvas')).toBeVisible({ timeout: 3_000 });
> 7  |   await expect.poll(() => page.evaluate(() => window.__scene0DustState?.count)).toBe(200);
     |                                                                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  8  |   await expect.poll(() => page.evaluate(() => window.__scene0DustState?.token)).toBe('--glow-genie-soft');
  9  | 
  10 |   const drawCalls = await page.evaluate(() => window.__scene0DustState?.drawCalls ?? 0);
  11 |   expect(drawCalls).toBeGreaterThanOrEqual(1);
  12 |   expect(drawCalls).toBeLessThanOrEqual(3);
  13 | });
  14 | 
  15 | test('Scene 0 dust drops to 50 particles on low-memory devices', async ({ page }) => {
  16 |   await page.addInitScript(() => {
  17 |     Object.defineProperty(navigator, 'deviceMemory', {
  18 |       configurable: true,
  19 |       get: () => 2,
  20 |     });
  21 |   });
  22 | 
  23 |   await page.goto('/?debug=dust');
  24 | 
  25 |   await expect.poll(() => page.evaluate(() => window.__scene0DustState?.count)).toBe(50);
  26 | });
  27 | 
  28 | test('Scene 0 dust stays disabled under reduced motion', async ({ browser }) => {
  29 |   const context = await browser.newContext({ reducedMotion: 'reduce' });
  30 |   const page = await context.newPage();
  31 | 
  32 |   await page.goto('/?debug=dust');
  33 |   await expect(page.locator('#ScrollRig-canvas canvas')).toHaveCount(0);
  34 |   expect(await page.evaluate(() => window.__scene0DustState)).toBeUndefined();
  35 |   await context.close();
  36 | });
  37 | 
  38 | declare global {
  39 |   interface Window {
  40 |     __scene0DustState?: {
  41 |       count: number;
  42 |       drawCalls: number;
  43 |       token: string;
  44 |     };
  45 |   }
  46 | }
  47 | 
```