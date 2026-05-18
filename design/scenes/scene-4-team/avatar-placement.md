# Scene 4 Avatar Placement

Scene-space units are normalized for FR-SCENE-016. `z=-2` is farthest; `z=+1` is closest.

| # | Hover reveal | x | y | z | scale | parallax |
|---:|---|---:|---:|---:|---:|---:|
| 1 | Minh - Senior Engineer | -0.78 | -0.12 | -2.00 | 0.15 | 0.08 |
| 2 | Linh - Design Systems Lead | -0.48 | 0.16 | -1.60 | 0.17 | 0.10 |
| 3 | An - AI Engineer | -0.28 | -0.34 | -1.20 | 0.19 | 0.14 |
| 4 | Bao - Three.js Engineer | 0.08 | 0.22 | -0.90 | 0.21 | 0.18 |
| 5 | Trang - Product Engineer | 0.36 | -0.20 | -0.50 | 0.22 | 0.22 |
| 6 | Quang - Backend Engineer | 0.68 | 0.08 | -0.20 | 0.24 | 0.26 |
| 7 | Nhi - QA Lead | -0.62 | 0.44 | 0.00 | 0.24 | 0.30 |
| 8 | Duc - Frontend Engineer | -0.05 | -0.02 | 0.35 | 0.26 | 0.34 |
| 9 | Hanh - Delivery Lead | 0.46 | 0.42 | 0.70 | 0.28 | 0.40 |
| 10 | Khoa - Founder Engineer | 0.82 | -0.42 | 1.00 | 0.30 | 0.46 |

## Handoff Notes

- Keep all avatars abstract. No photos, no LinkedIn links, and no full names.
- Each proxy is a small sphere with gold-200 rim light and a brown core.
- Closer avatars use higher parallax intensity so depth is readable during scroll.
- Lumi emissive target is `0.1`; avatar rim light is the main visual subject.
