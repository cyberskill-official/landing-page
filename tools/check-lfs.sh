#!/usr/bin/env bash
set -euo pipefail

if ! command -v git-lfs >/dev/null 2>&1 && ! git lfs version >/dev/null 2>&1; then
  echo "Git LFS is not installed. Install it, then run: git lfs install"
  exit 1
fi

if ! git lfs status >/dev/null 2>&1; then
  echo "Git LFS is not initialized in this repo."
  echo "Run: git lfs install"
  exit 1
fi

sample="${1:-assets-source/blender/lumi-greybox.v01.blend}"
if [ -f "$sample" ] && head -c 120 "$sample" | grep -q "git-lfs.github.com/spec/v1"; then
  echo "$sample is still an LFS pointer file. Run: git lfs pull"
  exit 1
fi

echo "Git LFS healthy."
