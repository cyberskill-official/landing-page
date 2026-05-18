# Git LFS Setup

CyberSkill stores source art files in Git LFS. Generated outputs stay out of LFS and are rebuilt by the asset pipeline.

## Install

1. Install Git LFS 3.4 or newer.
   - macOS: `brew install git-lfs`
   - Debian/Ubuntu: `sudo apt install git-lfs`
2. Register the hooks once per machine:
   ```bash
   git lfs install
   ```
3. Clone normally:
   ```bash
   git clone --recurse-submodules <repo-url>
   ```
4. Pull normally. Git fetches LFS files during `git pull` when smudge is enabled.

## Verify

Run:

```bash
tools/check-lfs.sh
git lfs ls-files
```

Expected tracked source patterns include `.blend`, `.psd`, `.sbs`, `.sbsar`, `.fig`, `.exr`, `.hdr`, `.spp`, and `.aep`.

If a source asset is still a pointer file, run:

```bash
git lfs pull
```

## Source Versus Output

LFS is for authoring sources such as Blender, Substance, Photoshop, Figma archives, and HDRI maps.

The following are derived outputs and must not be LFS-tracked: `.glb`, `.ktx2`, `.gltf`, `.bin`, and everything under `assets-built/optimized/`.

## Retention

LFS objects are retained while any git ref points to them. When old source revisions are no longer needed and remote refs have been cleaned up, run:

```bash
git lfs prune --verify-remote
```

Do this quarterly, or sooner if the monthly LFS bandwidth monitor reports usage above 80%.

Files larger than 2 GB require explicit founder approval. Prefer splitting very large Blender work into linked collections instead of committing a single oversized file.
