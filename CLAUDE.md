# CLAUDE.md — HWDT Project Context

> **Read this file first before making any changes to this project.**
> This document captures the full history, architecture, and design decisions of the HWDT app so any AI editor or new developer can resume work without losing context.

---

## 1. Project Identity

**Full Name:** HWDT — Healthcare Waste Disposal Training
**Codebase Directory:** `c:\Users\alallah\OneDrive\Desktop\CDS`
**Repository Branch:** master

**Purpose:** A bilingual (English/Arabic) interactive web-based certification program for hospital staff. Staff learn and are assessed on WHO-compliant medical waste segregation (sorting waste into the correct disposal bin). Upon passing, they receive a verifiable PDF certificate and a wallet-sized card (BLS/ACLS style).

**Target Audience:** All hospital staff — nurses, doctors, technicians, administrative staff, support workers.

**Business Goal:** Replace paper-based orientation with a trackable, gamified assessment. The app was presented to hospital administration for approval as a mandatory BICSL-style certification program. Every design decision was made with that institutional credibility goal in mind.

---

## 2. Technical Stack

| Technology | Version | Role |
|---|---|---|
| React | 19.2.4 | UI framework |
| Vite | 8.0.1 | Build tool, dev server |
| React Router DOM | 7.14.0 | Client-side routing (**HashRouter**) |
| i18next | 26.0.3 | Internationalization |
| react-i18next | 17.0.2 | React bindings for i18n |
| lucide-react | 1.7.0 | Icon library |
| jsPDF | 4.2.1 | PDF document creation |
| html2canvas | 1.4.1 | Capture HTML as canvas for PDF |
| XLSX | 0.18.5 | Excel export of results |
| chart.js | 4.5.1 | Bar chart on results screen |
| react-chartjs-2 | 5.3.1 | React wrapper for chart.js |

**No backend.** All data is stored in the browser (localStorage / sessionStorage).

**Build config:**
- `vite.config.js` sets `base: '/CDS/'` for production deployment
- `src/main.jsx` wraps app in `HashRouter` (not `BrowserRouter`) — this is intentional and must not be changed; it is required for static hosting (page refresh works on `/#/quiz` but would 404 on `/quiz`)

---

## 3. Project File Structure

```
CDS/
├── public/
│   ├── logo-icon.png          # Small icon used in Navbar and favicon
│   ├── logo.png               # Full logo used on certificate PDF
│   ├── favicon.svg
│   ├── icons.svg
│   └── items/                 # All item and bin images (PNG)
│       ├── bin_general.png
│       ├── bin_infectious.png
│       ├── bin_sharps.png
│       ├── bin_pharmaceutical.png
│       ├── syringe_needle.png
│       ├── blood_gauze.png
│       ├── n95_mask.png
│       ├── exam_gloves.png
│       ├── antibiotic_vial.png
│       ├── glass_ampoule.png
│       ├── food_waste.png
│       ├── clean_wrapper.png
│       ├── blood_lancet.png
│       ├── chemo_iv_bag.png
│       ├── expired_insulin_vials.png
│       └── ... (more item images)
│
├── src/
│   ├── main.jsx               # Entry point — HashRouter wrap + i18n import
│   ├── App.jsx                # Router, Navbar, Footer, LandingPage (all in one file)
│   ├── App.css                # Legacy styles (Vite template remnant, mostly unused)
│   ├── index.css              # Global CSS variables, animations, utility classes
│   │
│   ├── pages/
│   │   ├── QuizPage.jsx       # Interactive drag-drop waste classification game
│   │   ├── InfoPage.jsx       # Educational guide (4 waste categories accordion)
│   │   └── AdminPage.jsx      # PIN-gated admin panel (question CRUD, results, settings)
│   │
│   ├── components/
│   │   ├── Logo.jsx           # Reusable HWDT logo (props: size, showText)
│   │   └── quiz/
│   │       ├── GameHUD.jsx        # Score/progress bar during quiz
│   │       ├── DraggableItem.jsx  # Waste item card (drag on desktop, touch on mobile)
│   │       ├── BinDropZone.jsx    # One waste bin drop target (4 rendered in QuizPage)
│   │       ├── TimerBar.jsx       # 20-second countdown bar
│   │       ├── FeedbackPanel.jsx  # Correct/Wrong/Timeout feedback after each answer
│   │       └── ResultsScreen.jsx  # Final results, chart, certificate, wallet card
│   │
│   ├── data/
│   │   ├── questions.js       # 30-question bank + getQuestions() + resolveImageUrl()
│   │   └── wasteCategories.js # 4 bin definitions + getWasteCategories()
│   │
│   └── i18n/
│       ├── config.js          # i18next setup (en + ar, fallback: en)
│       ├── en.json            # All English UI strings (80+ keys)
│       └── ar.json            # All Arabic UI strings (mirror of en.json)
│
├── index.html                 # Single root div, loads src/main.jsx
├── vite.config.js             # base: '/CDS/', react plugin
├── package.json
├── eslint.config.js
└── CLAUDE.md                  # This file
```

---

## 4. Data Persistence Map

All data is stored client-side. No server calls are made anywhere in the app.

| Key | Storage | Written By | Read By | Purpose |
|---|---|---|---|---|
| `cds_user_info` | **sessionStorage** | `App.jsx` (LandingPage form submit) | `QuizPage.jsx`, `InfoPage.jsx` | User's name, employee #, department. Cleared when tab closes. |
| `cds_best_score` | localStorage | `QuizPage.jsx` | `QuizPage.jsx`, `ResultsScreen.jsx` | Personal best score (integer). |
| `cds_cert_counter` | localStorage | `ResultsScreen.jsx` (on mount) | `ResultsScreen.jsx` | Sequential integer counter for cert IDs. Increments each time results screen loads. |
| `cds_results` | localStorage | `ResultsScreen.jsx` (on mount) | `AdminPage.jsx` (Results tab) | JSON array of all assessment records (max 500). Each record: `{ name, profileNumber, department, date, score, percentage, passed, certId, certExpiry, timeTaken, lang }` |
| `cds_admin_questions` | localStorage | `AdminPage.jsx` (Questions tab) | `questions.js` (`getAllRawQuestions()`) | Admin-edited question bank. If absent, `DEFAULT_QUESTIONS` is used. |
| `cds_admin_pin` | localStorage | `AdminPage.jsx` (Settings tab) | `AdminPage.jsx` (PinGate) | Admin PIN string. Default: `"1234"`. |
| `cds_hospital_name` | localStorage | `AdminPage.jsx` (Settings tab) | `ResultsScreen.jsx`, `App.jsx` (Footer) | Hospital name shown on certificate and footer. |

---

## 5. Routing

**Router type:** `HashRouter` — URLs look like `http://host/#/quiz`

| Hash Route | Component | Guard |
|---|---|---|
| `/#/` | `LandingPage` (in App.jsx) | None |
| `/#/learn` | `InfoPage` | Redirects to `/` if no `cds_user_info` in sessionStorage |
| `/#/quiz` | `QuizPage` | Redirects to `/` if no `cds_user_info` in sessionStorage |
| `/#/admin` | `AdminPage` | PIN gate (PinGate component) |
| `/*` | Redirect to `/` | — |

The admin route (`/#/admin`) is **not linked anywhere in the public UI**. The admin button was intentionally removed from the Navbar. Access is only by typing the URL directly.

---

## 6. Quiz Game Logic

- **Question bank:** 30 questions in `src/data/questions.js` (`DEFAULT_QUESTIONS`, q1–q30)
- **Per attempt:** 10 questions randomly selected via `shuffleArray()` + `slice(0, count)` inside `getQuestions()`
- **Timer:** 20 seconds per question (`MAX_TIME = 20` in `QuizPage.jsx`)
- **Scoring:**
  - Correct: `100 + Math.round((timeLeft / MAX_TIME) * 50)` (100–150 points)
  - Wrong/timeout: 0 points
- **Pass threshold:** 70% correct answers (`percentage >= 70` in `ResultsScreen.jsx`)
- **On pass:** Certificate download + wallet card download buttons shown
- **On fail:** "Review Materials" button shown (navigates to `/learn`), certificate NOT available
- **Best score:** Stored to localStorage `cds_best_score` at end of quiz

---

## 7. Certificate & Wallet Card PDF Generation

### Why html2canvas (not jsPDF text)?

**Critical rule: never use jsPDF's built-in text rendering for any Arabic text or Unicode symbols.**

jsPDF's built-in fonts (Helvetica, Times) are Latin-only. Arabic text renders as garbage characters (`þÊþóþ®þ´þßþ•...`). Unicode symbols like `✓` and `→` also break (`'` and `!'`).

The solution is **html2canvas**: render the content as a styled HTML `<div>`, capture it as a PNG via html2canvas, then insert the PNG into the PDF with jsPDF's `addImage()`. The browser handles all font rendering, RTL, and Unicode correctly.

### Certificate

- Template: `<div id="certificate-template">` in `ResultsScreen.jsx`
- Template positioning: `position: absolute; left: -9999px; visibility: hidden` (NOT `display:none`, NOT `position:fixed`)
- Size: 1122×794px (A4 landscape at 96dpi)
- Captured with html2canvas, then inserted into jsPDF at A4 landscape dimensions
- Contains: hospital name, candidate name, employee #, department, cert ID, issue date, expiry date (1 year), score, two signature lines, WHO reference

**html2canvas call requirements (do not change these):**
```js
template.style.visibility = 'visible';
template.style.opacity = '1';
await new Promise(resolve => setTimeout(resolve, 100)); // settle delay required
const canvas = await html2canvas(template, {
  scale: 2,
  useCORS: true,
  allowTaint: false,
  logging: false,
  backgroundColor: '#ffffff',
  width: CERT_W,
  height: CERT_H,
  windowWidth: CERT_W,
  windowHeight: CERT_H,
  ignoreElements: (el) => el.tagName === 'CANVAS' && el.id !== 'certificate-template',
});
```

The `ignoreElements` filter is mandatory — without it, html2canvas crashes on Chart.js canvases with `InvalidStateError: Failed to execute 'createPattern' on 'CanvasRenderingContext2D'`.

### Wallet Card

- Two hidden template divs: `card-front-template` and `card-back-template`
- Each div: 856×540px (10:1 scale of 85.6×54mm credit card)
- Front: teal header, candidate name, cert meta, issued/expires/cert# table, score badge
- Back: 4 bin color circles with Arabic + English names, "When in doubt" rule
- Both captured separately with html2canvas, inserted into one jsPDF document (two pages)
- PDF page size: 85.6mm × 54mm

**Same html2canvas rules apply:** visibility, not display; absolute position; ignoreElements.

### Certificate ID Format

`HWDT-{YEAR}-{NNNNN}` — e.g., `HWDT-2026-00001`

Generated in `ResultsScreen.jsx` on component mount:
```js
const counter = parseInt(localStorage.getItem('cds_cert_counter') || '0', 10) + 1;
localStorage.setItem('cds_cert_counter', String(counter));
const id = `HWDT-${new Date().getFullYear()}-${String(counter).padStart(5, '0')}`;
```

---

## 8. Admin Panel (`src/pages/AdminPage.jsx`)

- **Access:** Navigate to `/#/admin` manually (not linked in UI)
- **Security:** `PinGate` component checks input against `localStorage.getItem('cds_admin_pin')` (default: `"1234"`)
- **Three tabs:**
  1. **Questions** — Full CRUD on question bank. Edit/add/delete questions. ImagePicker for uploading item images (stored as data: URLs in the question object). Changes saved to `cds_admin_questions` in localStorage.
  2. **Results** — Table view of all `cds_results` entries. Columns: name, employee #, department, date, score %, pass/fail, cert ID. Excel export via XLSX library. Clear all results button.
  3. **Settings** — Set hospital name (writes to `cds_hospital_name`). Change admin PIN (writes to `cds_admin_pin`).

---

## 9. Internationalization

- **Languages:** English (`en`) and Arabic (`ar`)
- **Setup:** `src/i18n/config.js` — i18next with react-i18next plugin
- **Usage:** `const { t, i18n } = useTranslation()` — call `t('keyName')` for any text
- **RTL:** When switching to Arabic, set `document.documentElement.dir = 'rtl'`; when switching to English, set `'ltr'`
- **Arabic font:** `[dir="rtl"]` in `index.css` applies `font-family: 'Tajawal', sans-serif`
- **Language toggle:** Visible on ALL pages in the Navbar (was previously only on landing page — fixed)
- **All new strings** must be added to both `src/i18n/en.json` AND `src/i18n/ar.json`

**Key translation groups in en.json / ar.json:**

| Group | Example Keys |
|---|---|
| Landing page | `landingHeroTitle`, `fullName`, `profileNumber`, `department`, `takeTest`, `readFirst` |
| Quiz instructions | `howToPlayTitle`, `step1Title`, `step2TitleTouch`, `gotItStart` |
| Game UI | `selectBin`, `dragToSort`, `timeUp`, `yourBestScore`, `newRecord` |
| Results | `assessmentPassed`, `assessmentFailed`, `downloadCertificate`, `downloadCard`, `reviewMaterials` |
| Certificate | `certThisCertifies`, `certProgram`, `certAchievement`, `certIssuedBy`, `certValidUntil`, `certNumber`, `certProgCoord`, `certDeptHead` |
| Admin | `adminPanel`, `tabQuestions`, `tabResults`, `tabSettings`, `hospitalName`, `changePIN`, `exportExcel` |
| Info page | `medicalWasteGuide`, `keyPrinciples`, `fourCategories`, `startAssessment` |
| Categories | `cat_general_name`, `cat_infectious_name`, `cat_sharps_name`, `cat_pharmaceutical_name` + desc/ex/rules/ref per category |
| Departments | `dept_emergency`, `dept_icu`, `dept_operating`, `dept_general`, `dept_pediatrics`, etc. |
| Footer | `footerRef`, `footerVersion` |

---

## 10. Mobile Responsiveness

**Bin grid (QuizPage.jsx):**
```jsx
gridTemplateColumns: 'repeat(4, 1fr)'  // Always 4 columns — never use auto-fit/minmax here
gap: window.innerWidth < 500 ? '6px' : '14px'
```

Using `repeat(auto-fit, minmax(180px, 1fr))` caused bins to stack vertically on Android (360–414px viewport). The fix is forced 4-column layout.

**BinDropZone.jsx — responsive sizing via `window.innerWidth < 500`:**
- padding: `'10px 4px'` (mobile) vs `'16px 12px'` (desktop)
- gap: `'3px'` vs `'6px'`
- bin image height: `'48px'` vs `'80px'`
- font size: `'0.62rem'` vs `'0.82rem'`
- bin description text: hidden on mobile (`window.innerWidth >= 500` condition)

**DraggableItem.jsx — mobile touch drag:**
- Uses `onTouchStart`, `onTouchMove`, `onTouchEnd` events
- Creates a floating ghost element (`position:fixed`) that follows the finger
- `elementFromPoint()` detects which bin is under the finger on release
- `touchmove` listener uses `{ passive: false }` to prevent page scroll during drag

---

## 11. Questions Data Structure

Each question in `src/data/questions.js`:

```js
{
  id: 'q1',                          // Unique string ID
  scenario: { en: '...', ar: '...' }, // Situation description
  itemName: { en: '...', ar: '...' }, // Name of the waste item
  itemIcon: 'syringe',               // Key for emoji map in DraggableItem.jsx
  imageUrl: 'items/syringe_needle.png', // Path relative to public/ (resolved via resolveImageUrl)
  category: 'sharps',                // Category for the item (used in results breakdown)
  difficulty: 'beginner',            // beginner | intermediate | advanced
  correctBin: 'sharps',              // Must match a waste category id: general|infectious|sharps|pharmaceutical
  explanation: { en: '...', ar: '...' }, // Why this is the correct bin
  standard: 'WHO Guidelines Ch. 7'   // Reference standard shown in feedback
}
```

**Key functions exported from `questions.js`:**
- `getQuestions(lang, count=10)` — shuffles, slices, translates, resolves image URLs; use this in QuizPage
- `getAllRawQuestions()` — returns raw (untranslated) questions from localStorage or DEFAULT_QUESTIONS
- `saveAdminQuestions(questions)` — persists admin edits to localStorage
- `resetQuestions()` — clears `cds_admin_questions` from localStorage
- `resolveImageUrl(url)` — handles base URL prefix for Vite deployment

**itemIcon values and their emoji mapping (in DraggableItem.jsx):**
`syringe`→💉, `package`→📦, `droplets`→🩸, `pill`→💊, `hand`→🧤, `glass-water`→🧪, `apple`→🍎, `shield-alert`→⚠️, `scissors`→✂️, `bag-water`→🫙

---

## 12. Waste Categories (`src/data/wasteCategories.js`)

| ID | Name | Color | Hex | Bin Image |
|---|---|---|---|---|
| `general` | General Waste | Black | `#1E293B` | `items/bin_general.png` |
| `infectious` | Infectious Waste | Yellow | `#EAB308` | `items/bin_infectious.png` |
| `sharps` | Sharps / Biohazard | Red | `#EF4444` | `items/bin_sharps.png` |
| `pharmaceutical` | Pharmaceutical Waste | Blue | `#3B82F6` | `items/bin_pharmaceutical.png` |

---

## 13. CSS Design System (`src/index.css`)

**CSS Variables:**
```css
--color-primary: #0D9488      /* Teal */
--color-primary-dark: #0F766E
--color-accent: #F59E0B       /* Orange */
--color-success: #10B981      /* Green */
--color-danger: #F43F5E       /* Red/Pink */
--color-bg-light: #F8FAFC
--color-text-main: #0F172A
--color-text-muted: #64748B
--color-border: #E2E8F0
```

**Animations:**
- `fadeIn` — 0.4s fade + slide up (page transitions)
- `binCorrectShake` — 0.5s celebrate bounce (correct answer)
- `binWrongShake` — 0.4s side-to-side buzz (wrong answer)
- `floatUp` — 1.2s float away with scale (floating points indicator)
- `screenFlash` — 0.35s red flash overlay (wrong answer)
- `timerUrgent` — 0.6s pulsing opacity (timer ≤ 3 seconds)
- `dragOverGlow` — 0.8s glowing border (bin drag hover)

---

## 14. Completed Work History

Everything that has been built in this project (in order):

1. **Navigation fix** — HashRouter replaces BrowserRouter; logo click goes home; page refresh works on `/quiz`, `/learn`
2. **SessionStorage guard** — QuizPage and InfoPage redirect to `/` if no user info found in sessionStorage
3. **Hidden admin button** — Admin Settings button removed from public Navbar entirely
4. **Translation fixes** — Timer text changed to 20 sec; "How to Play" changed to "How to Take the Test" / "طريقة الاختبار"
5. **Admin PIN security** — PinGate component added; default PIN "1234"; stored in `cds_admin_pin`
6. **Pass/Fail enforcement** — 70% threshold; certificate only available on pass; fail shows "Review Materials" → `/learn`
7. **Tracked certificate IDs** — Sequential `HWDT-YYYY-NNNNN` format; persisted via `cds_cert_counter`; 1-year expiry
8. **30-question bank** — Expanded from 10 to 30 questions; `getQuestions()` randomly selects 10 per attempt
9. **Result tracking + Excel export** — `cds_results` localStorage array; Admin Results tab shows table + XLSX export
10. **Hospital branding** — Admin Settings tab; `cds_hospital_name` shown on certificate and footer
11. **Retry flow on failure** — Fail screen shows "Review Materials" button navigating to `/learn`
12. **Language toggle everywhere** — Navbar language toggle visible on all pages (removed `isLanding` condition)
13. **Footer** — Added Footer component to App.jsx with hospital name, WHO reference, version number
14. **Landing page program intro** — Three info cards above form: questions count, time per question, certificate on pass
15. **Certificate download fix** — Fixed `InvalidStateError` from html2canvas; changed `display:none` → `visibility:hidden`, `position:fixed` → `position:absolute left:-9999px`, added `ignoreElements` for Chart.js canvases, 100ms settle delay
16. **Wallet card feature** — BLS/ACLS-style credit card PDF; 85.6×54mm; front (candidate info) + back (4 bin reference)
17. **Wallet card Unicode fix** — jsPDF broke `✓` and `→` symbols; replaced with text alternatives
18. **Wallet card 4th bin cutoff fix** — Adjusted `startY=13`, `rowH=7.5`, `radius=2.5` to fit all 4 bins
19. **Wallet card Arabic fix** — Replaced jsPDF text rendering entirely with html2canvas HTML templates (browser renders Arabic correctly)
20. **Android mobile bin layout fix** — `repeat(auto-fit, minmax(180px, 1fr))` stacked bins vertically on Android; fixed with `repeat(4, 1fr)` + responsive BinDropZone sizing

---

## 15. Known Limitations

- **No backend** — all data is device-local. Clearing browser storage deletes all results, cert counter, settings.
- **jsPDF cannot render Arabic or Unicode** — must always use html2canvas for any PDF content containing Arabic text or non-ASCII symbols. Never add `pdf.text()` calls for Arabic.
- **PDF templates are hidden HTML divs** — the certificate and wallet card layouts depend on inline styles in `ResultsScreen.jsx`. Changes to `index.css` or global styles can silently break PDF output.
- **`window.innerWidth` in inline styles** — does not re-evaluate on window resize (would need a `useWindowWidth` hook or `ResizeObserver` to fix). Responsive bin sizing is evaluated once at render time.
- **Admin PIN is not cryptographically secure** — PIN stored as plain text in localStorage. Acceptable for internal hospital intranet use; not suitable for public internet deployment.
- **Results limited to 500 records** — hardcoded max in `ResultsScreen.jsx`. Older records are dropped when limit is exceeded.

---

## 16. Future Roadmap (Post Hospital Approval)

- **Backend integration** (Firebase Firestore or Supabase) — real-time cross-device result tracking, department completion dashboards
- **QR code on certificate** — links to a verification page with cert ID lookup
- **Department-specific question sets** — ICU questions differ from pharmacy; admin can tag questions by department
- **Video walkthroughs** — short clips per waste category embedded in InfoPage
- **Mobile PWA** — offline use in wards without internet access
- **LMS export** — SCORM package for Moodle/Blackboard integration
- **Automated email delivery** — certificate sent to participant's email on pass
- **SSO / employee ID login** — integration with hospital Active Directory or LDAP
- **Multi-language expansion** — Urdu, Filipino (common in Gulf hospital staff)
- **Supervisor notifications** — when a staff member passes, their department head is notified

---

## 17. Development Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

**Production deployment:** Copy `dist/` to web server at path `/CDS/`. The HashRouter ensures all routes work without server-side configuration.

---

## 18. Quick Reference — Adding a New Question

1. Add entry to `DEFAULT_QUESTIONS` array in `src/data/questions.js`
2. Use next sequential ID (`q31`, `q32`, etc.)
3. Provide both `en` and `ar` for: `scenario`, `itemName`, `explanation`
4. Set `correctBin` to one of: `general`, `infectious`, `sharps`, `pharmaceutical`
5. Set `imageUrl` to an existing image path in `public/items/` or upload a new PNG
6. Set `itemIcon` to one of the existing keys (see Section 11)
7. If the image is new, add the PNG file to `public/items/`
8. No changes needed to routing or components — `getQuestions()` picks up new questions automatically

## 19. Quick Reference — Adding a Translation Key

1. Add key + English value to `src/i18n/en.json`
2. Add same key + Arabic value to `src/i18n/ar.json`
3. Use in component: `const { t } = useTranslation(); t('yourKeyName')`
4. For RTL-aware layout, check `i18n.language === 'ar'` or use `document.documentElement.dir === 'rtl'`
