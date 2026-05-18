.PHONY: verify-lfs test-lfs-config

verify-lfs:
	tools/check-lfs.sh

test-lfs-config:
	bash tools/__tests__/lfs-patterns.test.sh
	bash tools/__tests__/lfs-output-not-tracked.test.sh
