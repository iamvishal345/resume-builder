# Contributing to Cavren

Thanks for helping keep a free, offline resume tool honest.

## Ground rules

1. Features must work **offline** or degrade cleanly when offline (Drive / cloud AI excepted).
2. **No** Cavren backend, analytics SDKs, paywalls, or account gates.
3. Prefer client-only code. Optional network features talk to **the user’s** providers (Google Drive, their AI key).
4. Desktop / tablet UX first.
5. Keep diffs focused; match existing patterns (Astryx components, design tokens, no raw layout `<div>` soup in new React UI when a component exists).

## Setup

```bash
pnpm install
pnpm dev
pnpm test
```

Node 20+ recommended. Package manager: **pnpm**.

## What to work on

Good first issues are labeled in GitHub. High-value areas:

- **i18n** — locale files under `src/features/i18n/locales/`
- **Accessibility** — keyboard, labels, focus, contrast
- **JSON Resume** — round-trip fidelity in `src/features/import/jsonResume.js`
- **Templates** — new presets in `src/features/resume/templates.js` (keep ATS-safe defaults)
- **Tests** — pure functions in `src/features/**` with Vitest

See [ROADMAP.md](./ROADMAP.md).

## Pull requests

1. Branch from `main`.
2. Keep scope small; one concern per PR when possible.
3. Run `pnpm test` and `pnpm build` before opening the PR.
4. Describe *why* and how to verify (manual checklist is fine).
5. Update privacy / features copy if the data story changes.

## Code layout

| Path | Role |
|------|------|
| `src/pages/` | Astro routes (marketing + app shells) |
| `src/components/` | React / Astro UI |
| `src/features/` | Domain logic (resume, export, ats, ai, resumes) |
| `src/store/` | Zustand editor store |
| `src/styles/` | Global + marketing CSS (tokens) |
| `AGENTS.md` | Guidance for AI coding agents |

## Reporting bugs

Include: browser + OS, steps, expected vs actual, and whether you were offline. **Do not** paste personal resume content into issues.

## License

By contributing, you agree your contributions are licensed under the MIT License.
