# Cavren

**Free, private, offline-first resume builder.**  
Guided editing · live preview · PDF / DOCX / Markdown · local AI (optional) · no accounts · no tracking.

Your resumes live in **this browser’s IndexedDB**. Cavren does not run an app server for your content and does not embed analytics. Optional AI uses Chrome AI or **your** API key. Optional Google Drive backup is client-side OAuth to *your* Drive only.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4321/](http://localhost:4321/). App routes: `/` marketing · `/resumes` library · `/editor` builder.

```bash
pnpm build    # production build
pnpm test     # unit tests
pnpm preview  # serve dist/
```

## Product principles

| Principle | Meaning |
|-----------|---------|
| Local-first | Data on device; import / export / backup are first-class |
| Privacy | No analytics SDKs; no Cavren-hosted model proxy |
| Offline PWA | Installable; edit / preview / export after cache |
| Honest free | No paywalled exports, watermarks, or account gates |
| Desktop / tablet first | Mobile usable, not primary |

See [FEATURE_PLAN.md](./FEATURE_PLAN.md) and [ROADMAP.md](./ROADMAP.md).

## Stack

Astro 7 · React 19 · Zustand · IndexedDB (`idb-keyval`) · `@react-pdf` · `docx` · Vite PWA · Astryx (Matcha)

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports and feature ideas: use GitHub Issues. Translations and templates welcome.

## Optional Google Drive

Drive backup is **never required**. To enable it for yourself or your deploy, see [docs/DRIVE.md](./docs/DRIVE.md).

## License

[MIT](./LICENSE) — free to use, fork, and share.
