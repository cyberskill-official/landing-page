#!/usr/bin/env bash
set -euo pipefail

if grep -E '^\*\.(glb|ktx2|gltf|bin)[[:space:]]+filter=lfs' .gitattributes; then
  echo "Output asset patterns must not be LFS-tracked."
  exit 1
fi

for pattern in "*.glb" "*.ktx2" "*.gltf" "*.bin" "assets-built/optimized/"; do
  if ! grep -Fq "$pattern" .gitignore; then
    echo "Missing derived-output ignore pattern: $pattern"
    exit 1
  fi
done

echo "Derived outputs are ignored, not LFS-tracked."
