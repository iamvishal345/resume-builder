# Cavren — Competitive Research & Feature Plan

Research date: Sep 2026. Sources: product research + 2026 comparison reviews
(Rezi, Teal, Kickresume, Resume.io, Zety, Enhancv, Jobscan, SEEN, ResumeUp,
StylingCV, Resumly, Neuradesk, AlignCV, AI ResumeGuru, NeuraCV, RoleWorth).

---

## 1. Competitive landscape

| Tool                                  | Positioning           | Key differentiator                                                                      | Pricing (approx)                         |
| ------------------------------------- | --------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| Rezi                                  | ATS-first builder     | Real-time "Rezi Score", clean single-column export, AI bullet rewrite                   | Free (3 PDFs); Pro $29/mo; $149 lifetime |
| Teal                                  | Job-search workspace  | Kanban tracker + resume builder + per-job tailoring + Chrome ext                        | Free tiers; Teal+ ~$13/7d–$29/mo         |
| Kickresume                            | Breadth + value       | Largest template library, full-draft AI writer, **free tier with real downloads**, apps | Free; $19–29/mo; $124 lifetime           |
| Resume.io                             | Polished conventional | Premium templates, guided flow, scoring (subscription trap)                             | ~$1 trial → $24.95/4wk                   |
| Zety                                  | Writing guidance      | Best pre-written bullet ideas + career guides                                           | ~$1 trial → $23.70/4wk                   |
| Enhancv                               | Design                | Most distinctive layouts, drag-and-drop canvas, JD tailoring                            | 7d free; ~$16.50–39/mo                   |
| Jobscan                               | Diagnostics           | Keyword/ATS gap analysis of an existing resume                                          | Free; ~$29.98/qtr                        |
| ResumeUp / NeuraCV / StylingCV / SEEN | AI-native newcomers   | Live ATS score in editor, import (PDF/DOCX/LinkedIn), JD tailoring                      | 20–50 free AI credits; Pro $29/mo        |
| Resumly                               | Full editor           | Translates to 40+ langs w/ RTL, share links w/ view tracking, file-level ATS audit      | Freemium                                 |
| Neuradesk                             | Coherence             | Cross-section contradiction linter, live ATS score                                      | Freemium                                 |

### Category table-stakes in 2026

- ATS-safe, single-column templates tested against Workday/Greenhouse/Lever/iCIMS/Taleo
- Live WYSIWYG preview while you type
- Real-time ATS/resume score inside the editor
- Paste a job description → keyword gap analysis + tailoring
- AI content: bullet strengthener, summary generator, full first draft
- Import an existing resume (PDF/DOCX) or LinkedIn
- PDF + DOCX export
- One-click template switching that preserves content
- Multi-language section headers
- Cover letter with a matching design

### Pricing climate (important for positioning)

- Most incumbents run "free to build, pay to download" with ~$1–3 trials that
  auto-renew at $20–25/4 weeks. Sources: **40,000+ FTC Consumer Sentinel
  complaints**, ~71% auto-renew related; ApplyGlide test found the _only_
  builders you can leave with an unrestricted PDF for <$10 were itself and
  Enhancv's $24.99 one-time.
- Competitors winning trust: Kickresume (free tier = real downloads), Rezi
  (3 free PDFs), ApplyGlide (one-time price), Laddro (free to build, first PDF
  free).
- **Our opening: honest pricing + data stays in the browser, no account.**
  This is genuinely differentiated and cheap to ship because our editor is
  already a client-only React island with a local persisted store.

---

## 2. Target positioning

> A fast, **private, ATS-reliable** resume builder: guided steps, live preview,
> free real exports, no account and no paywalled downloads. AI assists later,
> monetized honestly.

Fit with our stack:

- Marketing (index/features) → static Astro, campaigns/SEO per feature.
- Editor → single client-only React island (local, no SSR): ideal for exports
  and browser privacy.
- Future AI/import/share need server work: add Astro server routes / serverless
  functions only when required (keys stay server-side).

---

## 3. Feature plan by phase

### Phase 0 — Baseline (already shipped)

- 6-step guided wizard (src/components/editor/steps/\*)
- Zustand + localStorage persistence, drag-reorder (sortablejs), rich text
  (react-quill), skill ratings, theme JSON stub
- Astro static marketing pages

### Phase 1 — Core product (differentiates vs "free tier" and fixes our gaps)

**P1.1 Live resume preview (biggest gap)**

- The "Preview" `Grid` cell in `Editor.jsx` is a placeholder.
- Build `src/components/preview/ResumePreview.jsx` that renders real resume
  from the store (personal details → work → education → skills → summary →
  additional sections) using the active theme.
- WYSIWYG: updates on every keystroke; mobile/desktop toggle.

**P1.2 Theme/template system**

- Promote `First.json` (accent/text color) into a real theme model:
  `id`, `name`, single-column ATS-safe layout, typography, accent color,
  optional photo/initials block.
- One-click switching on the editor; **content is preserved across switches**.
- Shipping 3–5 ATS-safe designs in P1 (Modern, Minimal, Classic, Tech).

**P1.3 Client-side export (free, no watermark)**

- PDF: print-to-PDF via a printer-optimized preview (keeps us dependency-light),
  or `pdfmake`/`jsPDF` for precise control.
- DOCX: `docx` npm package or `html-to-docx` (match bullet formatting).
- ATS-safe by construction: single column, standard section headings, no
  tables/textboxes for layout.
- Add `.r` resume export (JSON) shareable via drag-and-drop.

**P1.4 Honest pricing surface**

- Free tier: build, preview, unlimited PDF exports, limited themes.
- Paid later: advanced templates, AI credits, DOCX, unlimited resumes.

### Phase 2 — ATS & AI parity (the 2026 table stakes)

**P2.1 Completeness + ATS readiness score (no server needed)**

- Rule-based checks: contact present, sections complete, no empty
  placeholders, dates present, summary length, action-verb bullets.
- Real-time score panel beside the editor (client-side, mirrors Rezi/Neuradesk).

**P2.2 JD keyword gap analysis**

- Paste a JD → tokenize → highlight which keywords appear/missing across the
  resume; suggestion list of missing terms. Pure client-side in P2.

**P2.3 AI content assists (serverless route)**

- Endpoints (Astro server endpoint or Netlify/Cloudflare function) wrapping an
  LLM; **keys never in the client bundle**.
- Features: bullet strengthener (verb-led, metric-aware), summary generator,
  tailoring a copy to a JD, "start from job title" first draft.
- UX rule (per RoleWorth lesson): every generated claim is editable + clearly
  flagged as AI, user must review before export. Optionally a local "proof"
  note field per bullet.

**P2.4 Import**

- Parse a pasted text / uploaded PDF or DOCX / LinkedIn "Save to PDF" export
  into the store model. Open-source parse (or an LLM via server route) filling
  personal details, work, education, skills.

**P2.5 Cover letter**

- Same editor flow + matching theme template; PDF export; consistency with
  resume branding.

**P2.6 Share links**

- Static, view-only public page rendered from a public URL (id-based);
  autosaved resume is fetchable. Track views later.

### Phase 3 — Differentiators

**P3.1 Multi-version & per-job tailoring**

- Duplicate a resume into versions; name + attach a JD note per version;
  side-by-side diff of versions (Resumly-style).

**P3.2 Application tracker (optional Teal-like)**

- Kanban of applications; each item stores a resume version link, JD, status,
  notes; export CSV. Keep optional — big scope, defer unless user demand.

**P3.3 Coherence linter (Neuradesk-style)**

- Client-side checks: overlapping date ranges, title vs experience mismatch,
  skills claimed in summary but missing from skills list, contact details in
  multiple places.

**P3.4 Multilingual + RTL**

- i18n section headers (EN default; then ES, HIN, etc.); RTL layout support;
  language-aware font in exports.

**P3.5 Reliability**

- Autosave to IndexedDB, undo/redo history, draft recovery banner.

**P3.6 Resume → personal website**

- Generate a static personal-page from the same data (fits Astro static
  model naturally: one data JSON → one .astro page).

### Phase 4 — Optional (market-expanding)

- Photo block w/ EXIF-aware rotation + disable for ATS-strict markets.
- Interview prep: role-specific Q&A from JD.
- Job match score: score a resume against a JD link.
- Analytics on share links (views, referrer).
- Mobile companions (web app / PWA first — cheap).

---

## 4. Prioritization rationale

1. **Preview + templates + export (P1)** are non-negotiable: they close our
   three biggest gaps vs the entire category and make the product "finished."
2. **Honest free tier (P1.4)** is a cheap, credible wedge the incumbents
   squandered via trial traps — and it works with our existing no-account,
   browser-local architecture.
3. **ATS score + keyword gap (P2)** are client-side, dependency-light, and
   match 2026 buying criteria ("will it pass + what do I pay").
4. **AI (P2.3)** is expected by reviewers/users but crowded; ship it after the
   product works because it requires server infra + guardrails.
5. **Tracker/i18n/website (P3)** are scope-heavy differentiators — only invest
   once P1–P2 are proven.

## 5. Suggested build order (small batches)

1. ResumePreview rendering the store + theme model
2. 3–5 ATS-safe themes + hot-switch (content preserved)
3. PDF/DOCX export + convert export
4. Free-tier gating + pricing copy on marketing pages
5. ATS completeness score + JD keyword panel
6. AI endpoint(s) + review-flagged generation
7. Import (paste/text first, PDF later)
8. Share links + cover letter
