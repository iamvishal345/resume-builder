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
- Storage meter (usage estimate + resume/version counts)

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
- Named snapshots before import, tailor, fit-to-page, and template apply
- Section-level diff summary vs current + restore one click
- All stored in IndexedDB with the resume (cap 20)

### B2. Deeper JD tailor (client-only)
- Paste JD → propose changes to summary **and** multiple roles/skills
- Accept / reject per bullet (not only first role)
- Uses Chrome AI or user’s API key; fully skippable offline

### B3. Print & page fit
- Soft page-break hints in preview
- “Fit to one page” density/spacing adjust (user-triggered)
- Avoid surprise cut-offs on PDF
- Print CSS: hide canvas chrome; clean paper margins/gaps

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
- Photo in PDF + dark sidebar identity parity

### C3. Cover letter parity
- Letter templates matching resume themes
- Cover letter DOCX export

### C4. DOCX layout option
- Keep flat ATS DOCX as default
- Optional “match preview layout” two-column table for sidebar/split

### C5. Responsive polish
- Tablet split editor/preview as primary layout
- Mobile: single-column, preview on demand — not a redesign of desktop

### C6. Template sidebar presets + move-to-column
- Templates may ship default `sectionCols`
- Customize Tune: Sidebar / Main (or Left / Right) without drag

### C7. Local theme presets
- Named theme snapshots in IndexedDB (device-local)
- Save / Apply / Delete from Customize Color & Type

### C8. Markdown / plain-text export
- Ordered sections via `effectiveOrder`; command palette download

---

## Phase D — Optional client-side Drive (later)

### D1. Google Drive backup / restore
- Browser OAuth (user’s Google account)
- Write/read a Cavren backup file in **their** Drive
- Explicit consent; works only online; core app still offline without it
- **No** Cavren server, token storage only in the browser
- Empty / offline / missing-client-ID states that never imply Drive is required

Out of scope for D: Cavren-hosted sync, multi-user collaboration, view-tracking share links.

---

## Phase E — Craft polish (done)

- Side-by-side template compare UI
- Browser spellcheck / reading-level hints (Resume check)
- AI bullet rewrite + skills-from-experience (Chrome AI / user key)
- Duplicate section / reorder extras in Customize
- “Export this page only” (per-page PDF from preview)

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
| 2 | A2–A3 Data ownership + full backup + storage meter | Done |
| 3 | A4 Demo seed control | Done |
| 4 | B1 Versions + diffs + auto-snapshot | Done |
| 5 | B2 Deeper tailor | Done |
| 6 | B3 Page fit + print polish | Done |
| 7 | B4–B5 Interview packet + metrics prompts | Done |
| 8 | C1–C5 Craft (keyboard, photo, letter, DOCX option, responsive) | Done |
| 9 | C6–C8 Sidebar presets, theme presets, MD/txt export | Done |
| 10 | D1 Drive backup/restore + UX hardening | Done (client OAuth; needs your client ID) |
| 11 | Phase E (compare, spellcheck, AI rewrite, duplicate section, export page) | Done |

---

## Done definition (per feature)

- Works with network disabled (except Drive/AI that need the network)
- No new third-party data collection
- Desktop/tablet usable without horizontal doom-scrolling in the editor
- Documented in privacy/features copy if it changes the data story
