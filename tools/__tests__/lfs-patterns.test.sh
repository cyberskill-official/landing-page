#!/usr/bin/env bash
set -euo pipefail

required_patterns=(
  "*.blend"
  "*.psd"
  "*.sbs"
  "*.sbsar"
  "*.fig"
  "*.exr"
  "*.hdr"
  "*.spp"
  "*.aep"
)

for pattern in "${required_patterns[@]}"; do
  if ! grep -Eq "^${pattern//\*/\\*}[[:space:]]+filter=lfs[[:space:]]+diff=lfs[[:space:]]+merge=lfs[[:space:]]+-text$" .gitattributes; then
    echo "Missing LFS pattern: $pattern"
    exit 1
  fi
done

if ! grep -q "git lfs install" docs/ops/git-lfs-setup.md; then
  echo "docs/ops/git-lfs-setup.md must mention git lfs install"
  exit 1
fi

echo "LFS source patterns ok."
