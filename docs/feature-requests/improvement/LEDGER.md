# Evidence ledger

Append-only. One entry per task that reaches built or verified. Newest on top. An entry must let a reviewer re-check the claim without asking questions.

Entry format:

```
## <TASK-ID> <short title> - <status: built|verified> - <date>
- Branch/commit: auto/growth-wN @ <sha>
- What changed: <files, one line>
- Gates: typecheck/lint/test/build <pass|fail>, check:assets <pass|n/a>, check:apca <pass|n/a>, check:a11y:routes <pass|n/a>
- Verified by: <test name, curl output, preview URL check, screenshot note>
- New env vars / deps: <none | list with reason>
- Forks or follow-ups: <none | question for Stephen>
```

---

(no entries yet)
