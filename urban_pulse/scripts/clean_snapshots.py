import json
import math
import pathlib
import sys

SENSITIVE_KEYS = {"api_key", "model", "raw_df", "filtered_df"}

SNAPSHOT_FILES = [
    pathlib.Path("urban_pulse/data/state_snapshot.json"),
    pathlib.Path("urban_pulse/data/sample_demo/sample_state.json"),
]


def clean(v, stats):
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        stats["nan_inf"] += 1
        return None
    if isinstance(v, dict):
        cleaned = {}
        for k, val in v.items():
            if k in SENSITIVE_KEYS:
                stats["sensitive"] += 1
            else:
                cleaned[k] = clean(val, stats)
        return cleaned
    if isinstance(v, list):
        return [clean(i, stats) for i in v]
    return v


def main():
    missing = [p for p in SNAPSHOT_FILES if not p.exists()]
    if missing:
        for p in missing:
            print(f"MISSING: {p}")
        sys.exit(1)

    for path in SNAPSHOT_FILES:
        stats = {"nan_inf": 0, "sensitive": 0}
        text = path.read_text(encoding="utf-8")
        text = text.replace(': NaN', ': null').replace(':NaN', ':null')
        text = text.replace(': Infinity', ': null').replace(':Infinity', ':null')
        text = text.replace(': -Infinity', ': null').replace(':-Infinity', ':null')
        data = json.loads(text)
        cleaned = clean(data, stats)
        path.write_text(json.dumps(cleaned), encoding="utf-8")
        print(
            f"Cleaned {path}: "
            f"{stats['nan_inf']} NaN/Inf replaced, "
            f"{stats['sensitive']} sensitive keys stripped"
        )

    sys.exit(0)


if __name__ == "__main__":
    main()
