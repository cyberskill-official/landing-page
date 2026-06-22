# .cyberos-memory (BRAIN) - landing page

This is the project memory store. The human-readable **decision records** live in
`decisions/*.md`. The full Layer-1 binary ledger (the `HEAD` seqlock,
`audit/*.binlog`, `manifest.json`, derived SQLite index) is initialised and
maintained by the CyberOS memory tooling, not hand-authored:

```
cd ../cyberos/modules/memory && pip install -e .
cyberos --store ../../landing-page/.cyberos-memory doctor   # -> READY, then init
```

Per the protocol (`cyberos/AGENTS.md` §0.4) the store must resolve to this real
on-disk path, never a sandbox/ephemeral path. This build session authored the
decision records below; the binlog chain is sealed by the tooling on the
operator's machine so the chain anchors are genuine rather than fabricated.
