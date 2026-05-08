# Scripts

## clean_snapshots.py

Run from the repo root before every `git push`:

```bash
python urban_pulse/scripts/clean_snapshots.py
```

**What it does:**
- Replaces `NaN` / `Infinity` float values with `null` in both snapshot files
- Strips sensitive keys (`api_key`, `model`, `raw_df`, `filtered_df`) from all nested objects
- Prints a per-file summary of what was cleaned
- Exits with code `0` on success, `1` if any snapshot file is missing

**Files cleaned:**
- `urban_pulse/data/state_snapshot.json`
- `urban_pulse/data/sample_demo/sample_state.json`

> This script also runs automatically via the `.git/hooks/pre-push` hook — no manual step needed during normal git pushes.
