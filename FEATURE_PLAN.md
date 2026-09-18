# Cavren — features to add

Community · offline PWA · local-first · no servers · desktop/tablet first  
Updated: Sep 2026

Shipped baseline (do not rebuild): guided editor, templates/variants, live preview,
PDF/DOCX export, ATS check, coherence lint, JD keyword match, optional local AI,
cover letter, multi-resume IndexedDB library, import + `.r.json` backup/restore,
static marketing.

---

## Principles (gate every feature)

1. Works offline or degrades cleanly without network.
2. Data stays on device unless the user exports or opts into Drive later.
3. No Cavren backend, accounts-as-gate, or analytics SDKs.
4. Desktop/tablet UX first; mobile usable, not primary.

---

## Phase A — Trust & offline foundation (do first)

### A1. Offline-capable PWA
- Web app manifest + icons (installable)
- Service worker: cache app shell + critical assets
- Offline for: open library, edit, preview, PDF/DOCX from cached code
- Clear “You’re offline” only when a *network* feature fails (AI / Drive)
- Update prompt when a new version is available

### A2. Data ownership center
- Single place (dashboard or settings): export all, import/restore, clear all local data
- Explain what lives in IndexedDB vs files the user downloads
- Privacy page copy aligned with “no servers, no harvesting”

### A3. Full backup pack
- One-click download of **all** resumes + cover letters + settings as one archive/JSON pack
- One-click restore with merge vs replace choice
- Keep existing per-resume `.r.json`; pack is the “move to a new computer” path

### A4. Demo seed control
- Demo templates opt-in or one-time, not re-flooded every dashboard load
- “Reset demos” / “Remove demos” actions

---

## Phase B — Local power features

### B1. Versions / snapshots
- Named snapshots before import, tailor, or big edits
- Diff summary (optional, light) + restore one click
- All stored in IndexedDB with the resume

### B2. Deeper JD tailor (client-only)
- Paste JD → propose changes to summary **and** multiple roles/skills
- Accept / reject per bullet (not only first role)
- Uses Chrome AI or user’s API key; fully skippable offline

### B3. Print & page fit
- Soft page-break hints in preview
- “Fit to one page” density/spacing adjust (user-triggered)
- Avoid surprise cut-offs on PDF

### B4. Interview packet (local)
- From one JD: resume variant + cover letter + optional talking-point notes
- Pack export as files on disk (PDF/JSON) — no share tracking

### B5. Achievement prompts
- Gentle nudges on bullets missing metrics (% / $ / #)
- Optional AI rewrite that preserves facts; user confirms

---

## Phase C — Desktop craft

### C1. Keyboard-first editor
- Step jump shortcuts, command palette (export, check, match, theme)
- Focus traps / drawer a11y pass

### C2. Photo (optional, template-aware)
- Local image only (IndexedDB / object URL); never uploaded
- Hide on ATS-safe layouts; show on creative ones

### C3. Cover letter parity
- Letter templates matching resume themes
- Cover letter DOCX export

### C4. DOCX layout option
- Keep flat ATS DOCX as default
- Optional “match preview layout” for multi-column where feasible

### C5. Responsive polish
- Tablet split editor/preview as primary layout
- Mobile: single-column, preview on demand — not a redesign of desktop

---

## Phase D — Optional client-side Drive (later)

### D1. Google Drive backup / restore
- Browser OAuth (user’s Google account)
- Write/read a Cavren backup file in **their** Drive
- Explicit consent; works only online; core app still offline without it
- **No** Cavren server, token storage only in the browser

Out of scope for D: Cavren-hosted sync, multi-user collaboration, view-tracking share links.

---

## Explicitly out of scope (for now)

- Monetization, paywalled PDF, trials, ads
- Cavren accounts / server database as source of truth
- Analytics, pixel trackers, session replay
- Job board / CRM / recruiter marketplace
- Mobile-native apps
- AI proxy that sends resume text to Cavren-owned infra

---

## Suggested build order

| Order | Item | Status |
|------:|------|--------|
| 1 | A1 PWA offline | Done |
| 2 | A2–A3 Data ownership + full backup | Done |
| 3 | A4 Demo seed control | Done |
| 4 | B1 Versions | Done |
| 5 | B2 Deeper tailor | Done |
| 6 | B3 Page fit | Done |
| 7 | B4–B5 Interview packet + metrics prompts | Done |
| 8 | C1–C5 Craft (keyboard, photo, letter, DOCX option, responsive) | Done — desktop/tablet shell + mobile FAB |
| 9 | D1 Drive backup/restore | Done (client OAuth; needs your client ID) |

Polish remaining: richer multi-column DOCX, Drive UX hardening, photo in PDF export.


---

## Done definition (per feature)

- Works with network disabled (except Drive/AI that need the network)
- No new third-party data collection
- Desktop/tablet usable without horizontal doom-scrolling in the editor
- Documented in privacy/features copy if it changes the data story
