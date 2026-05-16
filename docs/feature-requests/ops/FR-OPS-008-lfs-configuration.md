---
id: FR-OPS-008
title: "Git LFS configuration for source assets — .blend / .psd / .sbs / .fig / .exr / .hdr"
module: OPS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P2
slice: 1
owner: Backend / DevOps
created: 2026-05-16
related_frs: [FR-CHAR-004, FR-CHAR-006, FR-CHAR-008, FR-OPS-001, FR-OPS-009]
depends_on: []
blocks: [FR-CHAR-004, FR-CHAR-006, FR-OPS-009]
language: git config
service: repo root
new_files:
  - .gitattributes
  - .github/lfs-bandwidth-monitor.yml
  - docs/ops/git-lfs-setup.md

source_pages:
  - docs/01-master-plan-v2.md §11.2 — "Git LFS for source assets; gitignore optimized outputs"
  - GitHub LFS pricing & quota documentation (1 GB free, $5/50 GB/month)
  - FR-OPS-001 §4 inputs — pipeline reads `assets-source/**` LFS-tracked files

effort_hours: 2
risk_if_skipped: "Without LFS, a 100 MB Lumi .blend file bloats git history. Cloning the repo balloons from ~50 MB to multi-GB after a few months. CI clones become slow (>2 min checkout). Some hosts refuse > 100 MB files. Net effect: contributor experience degrades from week 2 onward, debug stories from year 1 become 'oh that's the LFS thing.'"
---

## §1 — Description (BCP-14 normative)

1. **MUST** configure Git LFS for source assets per master plan §11.2:

   | Pattern | Rationale | Typical size |
   |---|---|---|
   | `*.blend` | Blender source files (Lumi, scenes) | 30-150 MB each |
   | `*.psd` | Photoshop source (textures, mockups) | 20-200 MB each |
   | `*.sbs` | Substance Designer graph | 5-30 MB each |
   | `*.sbsar` | Substance archive | 10-50 MB each |
   | `*.fig` | Figma archive (rare; mostly small but can balloon) | 1-50 MB each |
   | `*.exr` | OpenEXR (HDRI / environment maps) | 30-200 MB each |
   | `*.hdr` | Radiance HDR (alt HDRI format) | 30-200 MB each |
   | `*.spp` | Substance Painter project | 50-500 MB each |
   | `*.aep` | After Effects project (if used per Recipe C) | 20-100 MB each |

2. **MUST** ship `.gitattributes` at repo root declaring these patterns:

   ```gitattributes
   *.blend  filter=lfs diff=lfs merge=lfs -text
   *.psd    filter=lfs diff=lfs merge=lfs -text
   *.sbs    filter=lfs diff=lfs merge=lfs -text
   *.sbsar  filter=lfs diff=lfs merge=lfs -text
   *.fig    filter=lfs diff=lfs merge=lfs -text
   *.exr    filter=lfs diff=lfs merge=lfs -text
   *.hdr    filter=lfs diff=lfs merge=lfs -text
   *.spp    filter=lfs diff=lfs merge=lfs -text
   *.aep    filter=lfs diff=lfs merge=lfs -text
   ```

3. **MUST NOT** LFS-track *output* files. The following live in `.gitignore`, not LFS:
   - `*.glb` (optimised meshes)
   - `*.ktx2` (compressed textures)
   - `*.gltf` (intermediate JSON)
   - `*.bin` (binary buffer accompanying .gltf)
   - `assets-built/optimized/**` (entire optimized output directory)

4. **MUST** include `git lfs install` in the contributor onboarding doc at `docs/ops/git-lfs-setup.md` covering:
   - Prerequisite: `git lfs --version` reports ≥ 3.4
   - First-time: `git lfs install` (registers LFS hooks)
   - Clone-time: `git clone --recurse-submodules` (no `git lfs clone` needed since Git 2.3)
   - Pull-time: LFS files auto-fetch on `git pull`
   - Verify: `git lfs ls-files` lists tracked files post-checkout

5. **MUST** verify Git LFS is correctly initialized on contributor onboarding via a smoke check:
   ```bash
   #!/usr/bin/env bash
   # tools/check-lfs.sh
   if ! git lfs status 2>/dev/null; then
     echo "❌ Git LFS not initialized. Run: git lfs install"
     exit 1
   fi
   ```

6. **MUST** monitor LFS bandwidth consumption via a monthly GitHub Actions job at `.github/workflows/lfs-bandwidth-monitor.yml`:
   - Reads GitHub LFS quota via `gh api /repos/:owner/:repo/lfs` (when available)
   - Alerts in `#repo-ops` Slack if usage > 80% of plan
   - Suggests `git lfs prune --verify-remote` to clean dangling refs

7. **MUST NOT** include LFS-tracked files larger than **2 GB** without explicit founder approval. (GitHub LFS hard ceiling is 5 GB per file; 2 GB is a self-imposed soft cap.) Enforced via `pre-commit` hook check at FR-OPS-013.

8. **MUST** document LFS retention rules in `docs/ops/git-lfs-setup.md`:
   - LFS objects are retained as long as ANY git ref points to them.
   - After a `.blend` is replaced + old commits squashed away, run `git lfs prune` quarterly to reclaim quota.

9. **MUST** include LFS pointer files committed to git (the `version https://git-lfs.github.com/spec/v1\noid sha256:...\nsize ...` stubs); actual content stored in LFS server.

10. **MUST** verify on CI clone that LFS smudge filter ran (files are real content, not pointer stubs). Smudge check: `file assets-source/blender/lumi.v01.blend` should report "Blender file" not "ASCII text".

11. **SHOULD** include a `make verify-lfs` target in `Makefile` that runs the LFS smoke check + bandwidth status.

12. **MUST** be auditable. `.gitattributes` patterns version-controlled; commit history shows pattern changes with rationale.

## §2 — Why this design

**Why LFS for `.blend` / `.psd` / `.sbs`?** Source files are large binaries that git's pack format handles poorly. A 150 MB .blend committed normally adds 150 MB to every clone, forever. LFS stores the content on a side server; git history only holds pointers. Clones stay fast, diffs stay meaningful (LFS knows binary diff is "the whole file changed").

**Why NOT LFS for `.glb` / `.ktx2`?** Two reasons:
1. Outputs are reproducible from sources via FR-OPS-001 pipeline. Storing them is wasted quota.
2. Outputs are deployed via Vercel CDN, not pulled from git at runtime. No reason to keep them in version control.

**Why a 2 GB soft cap?** Above 2 GB, single-file LFS operations become flaky (timeouts, partial fetches, retries). Better to split a mega-blend into linked sub-blends per master plan §11.2 Blender collection-link strategy. Hard founder approval prevents shadow accumulation of "but I needed it just this once" giants.

**Why monthly bandwidth monitor?** GitHub LFS quotas are per-user-per-month for bandwidth. Hitting the quota causes confusing "pointer fetch failed" errors. Proactive monitoring avoids surprise outages.

**Why explicit `git lfs install` step?** LFS is opt-in per user account. A contributor cloning fresh without LFS installed sees pointer text files instead of real content, runs the pipeline, gets cryptic Blender-can't-open-text-file errors. The setup doc + smoke check makes this impossible to silently miss.

**Why audit `.gitattributes` changes?** Changes here have outsized impact. Removing a pattern means future commits of matching files go into normal git (bloating history). Adding a pattern after files already exist is a no-op for those files (LFS migration requires `git lfs migrate import`). PR review on `.gitattributes` is the right gate.

## §3 — Public surface

```gitattributes
# .gitattributes (canonical at repo root)
# Source asset patterns — LFS-tracked
*.blend  filter=lfs diff=lfs merge=lfs -text
*.psd    filter=lfs diff=lfs merge=lfs -text
*.sbs    filter=lfs diff=lfs merge=lfs -text
*.sbsar  filter=lfs diff=lfs merge=lfs -text
*.fig    filter=lfs diff=lfs merge=lfs -text
*.exr    filter=lfs diff=lfs merge=lfs -text
*.hdr    filter=lfs diff=lfs merge=lfs -text
*.spp    filter=lfs diff=lfs merge=lfs -text
*.aep    filter=lfs diff=lfs merge=lfs -text

# Text-based source files — normal git, normalize line endings
*.ts     text eol=lf
*.tsx    text eol=lf
*.js     text eol=lf
*.jsx    text eol=lf
*.json   text eol=lf
*.md     text eol=lf
*.yml    text eol=lf
*.yaml   text eol=lf
*.css    text eol=lf
*.scss   text eol=lf

# Optimized outputs — NOT LFS (gitignored via .gitignore)
# *.glb    -text  (commented out — these live in .gitignore)
# *.ktx2   -text
```

```gitignore
# Excerpt from .gitignore — output assets NOT in LFS
assets-built/
apps/web/public/optimized/
**/*.glb
**/*.ktx2
**/*.gltf
**/*.bin
```

```yaml
# .github/workflows/lfs-bandwidth-monitor.yml
name: LFS bandwidth monitor
on:
  schedule:
    - cron: '0 9 1 * *'  # monthly on 1st at 09:00 UTC
  workflow_dispatch: {}
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check LFS usage
        run: |
          # gh api endpoint for LFS quota — verify availability
          USAGE=$(gh api repos/${{ github.repository }}/lfs --jq '.usage_bytes // 0')
          QUOTA=$(gh api repos/${{ github.repository }}/lfs --jq '.quota_bytes // 1073741824')  # 1 GB default
          PCT=$((USAGE * 100 / QUOTA))
          echo "LFS usage: $USAGE / $QUOTA bytes ($PCT%)"
          if [ $PCT -gt 80 ]; then
            curl -X POST -H "Content-Type: application/json" \
              -d "{\"text\": \"⚠️ LFS at ${PCT}%; run git lfs prune\"}" \
              ${{ secrets.SLACK_WEBHOOK_REPO_OPS }}
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

```bash
# tools/check-lfs.sh
#!/usr/bin/env bash
set -euo pipefail
if ! command -v git-lfs >/dev/null 2>&1; then
  echo "❌ git-lfs not installed. brew install git-lfs OR apt install git-lfs"
  exit 1
fi
if ! git lfs status >/dev/null 2>&1; then
  echo "❌ Git LFS not initialized in this repo."
  echo "   Run: git lfs install"
  exit 1
fi
# Verify a known LFS file is real content, not pointer
SAMPLE="assets-source/blender/lumi.v01.blend"
if [ -f "$SAMPLE" ]; then
  if head -c 100 "$SAMPLE" | grep -q "git-lfs.github.com/spec/v1"; then
    echo "❌ $SAMPLE is still a pointer file."
    echo "   Run: git lfs pull"
    exit 1
  fi
fi
echo "✅ Git LFS healthy."
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | .gitattributes present with all 9 source-asset patterns | `cat .gitattributes` includes all of *.blend / *.psd / *.sbs / *.sbsar / *.fig / *.exr / *.hdr / *.spp / *.aep |
| 2 | `.glb` and `.ktx2` NOT LFS-tracked | grep `*.glb\|*.ktx2` .gitattributes → 0 hits |
| 3 | LFS smoke test passes — commit 50 MB .blend; push; clone; checkout retrieves real content | `tools/check-lfs.sh` passes after a fresh clone |
| 4 | README contributor section includes `git lfs install` step | grep `git lfs install` docs/ops/git-lfs-setup.md |
| 5 | LFS bandwidth monitor workflow exists + runs | `gh workflow run lfs-bandwidth-monitor.yml` succeeds |
| 6 | 2 GB soft cap enforced via pre-commit | Synthetic test: stage a 2.5 GB file → pre-commit blocks |
| 7 | Smudge filter runs on CI clone | CI step `file assets-source/blender/lumi.v01.blend` reports `Blender file` |
| 8 | `git lfs ls-files` lists expected tracked files | Verify output contains lumi.v01.blend, lumi_basecolor.psd, etc. |
| 9 | Makefile `verify-lfs` target exists and works | `make verify-lfs` exits 0 on healthy repo |
| 10 | Pattern additions/removals reviewed in PR | Branch protection requires CODEOWNERS approval on `.gitattributes` |

## §5 — Verification

```bash
# tools/__tests__/lfs.smoke.test.sh
#!/usr/bin/env bash
# Smoke test: round-trip a fake binary through LFS
set -euo pipefail

TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

cd $TMP
git init -q
git lfs install --local
echo "*.blend filter=lfs diff=lfs merge=lfs -text" > .gitattributes

# Generate a 50 MB blob (mimicking a .blend)
head -c $((50 * 1024 * 1024)) /dev/urandom > test.blend

git add .gitattributes test.blend
git commit -q -m "test"

# Verify it's a pointer, not normal blob
POINTER=$(git show HEAD:test.blend | head -1)
[[ "$POINTER" == "version https://git-lfs.github.com/spec/v1" ]] || {
  echo "❌ test.blend committed as normal blob, not LFS pointer"
  exit 1
}

# Verify the .gitattributes pattern catches it
TRACKED=$(git lfs ls-files | wc -l)
[[ "$TRACKED" -eq 1 ]] || {
  echo "❌ Expected 1 LFS-tracked file, got $TRACKED"
  exit 1
}

echo "✅ LFS smoke test passed"
```

```bash
# tools/__tests__/lfs-output-not-tracked.test.sh
#!/usr/bin/env bash
# Verify .glb / .ktx2 are NOT in .gitattributes
set -euo pipefail

if grep -E '^\*\.(glb|ktx2|gltf)' .gitattributes; then
  echo "❌ Output asset patterns found in .gitattributes (should be in .gitignore)"
  exit 1
fi
echo "✅ Output assets not LFS-tracked"
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (consumer of LFS-tracked source files), FR-OPS-009 (asset manifest tracks LFS-stored sources by hash).

**Operational:** Git LFS server (GitHub default). Git ≥ 2.3 + git-lfs ≥ 3.4. GitHub repository LFS plan (1 GB free; $5/mo for 50 GB).

**Downstream:**
- FR-CHAR-004 (greybox .blend) — needs LFS to commit at reasonable size.
- FR-CHAR-006 (production .blend) — same.
- FR-OPS-009 (asset manifest) — hashes LFS-tracked sources.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Contributor commits .blend without `git lfs install` | CI: smudge filter check fails; file content stored in git | `git lfs migrate import --include='*.blend' --everything` rewrites history; coordinated force-push |
| .gitattributes pattern removed accidentally | Future .blend commits go into git normally | PR review on .gitattributes; CODEOWNERS gate |
| LFS quota exhausted | `git push` fails with "LFS storage usage exceeded" | Upgrade plan or `git lfs prune --verify-remote` to reclaim |
| LFS bandwidth quota exhausted | `git pull` fails with "rate limit" | Bandwidth monitor alerts in advance; throttle CI clone cache |
| File > 2 GB committed | Pre-commit hook blocks | AC#6 |
| LFS server outage (GitHub LFS down) | `git pull` hangs | Document workaround: skip LFS pull, work with cached files |
| Cross-platform line-ending issues in .gitattributes | Files marked binary; line endings still wrong | Add `* text=auto` baseline; explicit `text eol=lf` per type |
| pre-commit hook missing for new contributor | Pre-commit not installed locally | Onboarding script: `pre-commit install` |
| LFS pointer commit conflicts on merge | Merge fails with binary file conflict | Manual resolve: pick one version; re-commit |
| LFS quota report missing in workflow | gh api endpoint returns 404 | Fallback: read `git lfs status --porcelain` size estimate |
| Free-tier 1 GB exhausted in week 1 | Project ships ~50 MB lumi.blend × revisions → quota hit fast | Upgrade to $5/mo 50 GB plan; budget line item |
| `git clone --filter=blob:none` skips LFS | New contributor sees pointer files | Document standard clone command without partial filter |
| `.gitattributes` doesn't apply retroactively | Existing committed .blend stays in git history | One-time `git lfs migrate import --include=*.blend --everything` migration |
| GitHub Actions runner doesn't pull LFS by default | Smudge check fails | Workflow checkout uses `with: { lfs: true }` |
| LFS hooks broken on Windows contributor | LFS pointer stays text | Document `git lfs install --skip-smudge` workaround + manual `git lfs pull` |

## §8 — Deliverable preview

```
Repo root/
├── .gitattributes          (canonical LFS pattern declaration)
├── .gitignore              (output asset paths)
├── Makefile                (verify-lfs target)
├── tools/
│   ├── check-lfs.sh
│   └── __tests__/
│       ├── lfs.smoke.test.sh
│       └── lfs-output-not-tracked.test.sh
├── .github/workflows/
│   └── lfs-bandwidth-monitor.yml
└── docs/ops/
    └── git-lfs-setup.md    (contributor onboarding)
```

Sample `git lfs ls-files` output post-checkout:
```
abc12...0001 * assets-source/blender/lumi.v01.blend       (87.3 MB)
def34...0002 * assets-source/blender/lumi-greybox.v01.blend (12.1 MB)
ghi56...0003 * assets-source/photoshop/lumi_basecolor.psd  (148 MB)
jkl78...0004 * assets-source/substance/gold-iridescent.sbs (8.4 MB)
mno90...0005 * assets-source/textures/nonla_basecolor.psd  (54 MB)
...
```

## §9 — Notes

**On GitHub LFS pricing:** Free 1 GB / month bandwidth. $5/mo for 50 GB. CyberSkill anticipated usage: ~30 GB after 6 months of dev. Plan: start free tier, upgrade at month 2 once .blend revisions accumulate. Founder approved this budget line.

**On alternative LFS hosts:** Could move to a self-hosted LFS server (e.g. Gitea LFS, or AWS S3 via git-lfs-s3) if cost grows. Not in slice 1 scope; revisit at $50/mo recurring.

**On `.fig` LFS need:** Figma files are usually small (< 1 MB) but `.fig` archive exports can balloon for design-system-wide exports. Including in LFS preemptively.

**On Vietnamese-locale impact:** None directly; LFS is language-agnostic. Indirect: Recipe G (nón lá cultural variants) flows through .psd files which ARE LFS-tracked, ensuring founder's source artwork stays performant in git.

**On 'why not git-fat or git-annex?':** Git LFS is the de facto standard, has GitHub-native integration, simpler model than git-annex. Migration cost dwarfs marginal benefit.

*End of FR-OPS-008.*
