# Contributing to UrbanPulse

Thanks for your interest in contributing. This guide covers the basics to get you set up and submitting changes.

---

## Getting Started

1. Fork the repository and clone your fork
2. Follow the [Local Setup](../README.md#local-setup) instructions in the README
3. Create a feature branch off `dev` (not `main`):
   ```bash
   git checkout dev
   git checkout -b feat/your-feature-name
   ```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, deployed to production |
| `dev` | Integration branch — PRs go here |
| `feat/*` | New features |
| `fix/*` | Bug fixes |

Always target `dev` with your pull request. `main` is updated via merges from `dev`.

---

## Before Pushing

Run the snapshot cleaner to strip sensitive keys and NaN values:

```bash
python urban_pulse/scripts/clean_snapshots.py
```

This also runs automatically via the pre-push git hook.

---

## Code Style

- **Python**: follow existing module structure; keep files under 300 lines
- **TypeScript**: functional components, Tailwind for styling, no inline styles
- **No comments** unless the why is non-obvious
- Do not add features beyond what the task requires

---

## Adding a New Agent

1. Create `urban_pulse/agents/AX_your_agent.py` with a single `your_agent_node(state)` function
2. Add the node and edge to `urban_pulse/core/orchestrator.py`
3. Extend `UrbanPulseState` in `urban_pulse/core/schema.py` with your agent's output keys
4. Add a corresponding step page under `urban_pulse/frontend/app/(app)/step-X/`

---

## Pull Request Checklist

- [ ] Branched off `dev`
- [ ] No `.env` files or API keys committed
- [ ] `clean_snapshots.py` ran clean
- [ ] Existing pipeline still runs end-to-end
- [ ] PR description explains what changed and why

---

## Reporting Issues

Use the [bug report template](ISSUE_TEMPLATE/bug_report.md) for bugs and the [feature request template](ISSUE_TEMPLATE/feature_request.md) for ideas.
