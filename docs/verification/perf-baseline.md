# Dated Core Web Vitals Baseline

This document records the initial benchmark metrics for the CyberSkill Saigon studio marketing landing page.

- **Record Date**: 2026-07-10
- **Environment**: Mobile Emulation
- **Primary Target URL**: `/en` and `/vi`

---

## 1. Initial Benchmark Metrics

The baseline numbers captured during the deep performance audit on **July 10, 2026**:

| Metric | Baseline Value (2026-07-10) | Target Floor (Good / Green) |
|---|---|---|
| **Mobile Performance Score** | 47 / 100 | >= 85 / 100 |
| **Cumulative Layout Shift (CLS)** | 0.431 | <= 0.1 |
| **Total Blocking Time (TBT)** | 1,370 ms | <= 300 ms |
| **Largest Contentful Paint (LCP)** | Unmeasured (PSI quota limit) | <= 2,500 ms |
| **Total JS Bundle Size (First Load)** | 573 KB | <= 410 KB |

---

## 2. Gating and Regression Prevention

As of version 0.1.0, the repository enforces these floors via the following checks:
1. **Lighthouse CI (`lighthouserc.json`)**: Configured to run on every commit. The build will fail if mobile CLS > 0.1, LCP > 2500ms, TBT > 300ms, or performance score < 85.
2. **First-Party RUM Monitoring (`/api/analytics`)**: Automatically parses client-side vitals and triggers a high-severity log alert if the moving 75th percentile (p75) of LCP, CLS, or INP breaches the target green thresholds.
