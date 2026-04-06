# Supabase Integration — What We Did & Why

## The Goal

The app previously saved all quiz results **only on the device** (localStorage).
This meant:
- Results were invisible to the hospital administration
- Clearing the browser deleted everything permanently
- Impossible to expand to multiple hospitals

The goal was to connect the app to a **real cloud database** so every quiz result is saved online, accessible from anywhere, and isolated per hospital.

---

## What Changed in the Code

### 2 New Files

| File | Purpose |
|---|---|
| `src/lib/supabase.js` | Creates the Supabase connection using the hospital's environment variables |
| `src/lib/db.js` | All database functions: save a result, load results, offline queue, sync |

### 4 Modified Files

| File | What Changed |
|---|---|
| `src/components/quiz/ResultsScreen.jsx` | After saving to localStorage, also sends the result to Supabase in the background |
| `src/pages/AdminPage.jsx` | PIN login replaced with email + password (Supabase Auth). Results tab now loads from the database |
| `src/App.jsx` | On every app load, silently retries any results that failed to sync while offline |
| `.env` | New file with the Supabase URL, API key, and hospital ID |

---

## How Results Are Saved (Dual-Write)

```
Staff completes quiz
        │
        ├── 1. Save to localStorage  ← always works, even offline
        │
        └── 2. Send to Supabase  ────── internet available? → saved to DB instantly
                                   └── no internet? → added to pending queue
                                                            │
                                                            └── next app load → auto-synced
```

The quiz **never fails or freezes** due to a network issue. Offline results catch up automatically.

---

## Multi-Hospital Architecture

One Supabase database serves all hospitals. Data is separated using **Row Level Security (RLS)** — a database-level rule that ensures each admin account can only see their own hospital's results.

```
Supabase Database
├── hospitals table
│   ├── KFHBH  →  King Fahad Hospital - Albaha
│   └── ...    →  (future hospitals)
│
└── quiz_results table
    ├── hospital_id: KFHBH  →  only visible to KFHBH admin
    └── hospital_id: NMC    →  only visible to NMC admin (future)
```

Each hospital gets its own deployment (Netlify site) built from the same GitHub repo, with a different `VITE_HOSPITAL_ID` environment variable baked in at build time.

---

## First Hospital — King Fahad Hospital - Albaha

| Item | Value |
|---|---|
| Hospital ID | `KFHBH` |
| Supabase Project | `https://ddaxqnhubrctawppwwzc.supabase.co` |
| Admin login | `admin@kfhbh.com` |
| Admin panel URL | `your-site.netlify.app/#/admin` |

---

## Adding a New Hospital (Future)

1. Register the hospital in Supabase (one SQL insert + one admin user)
2. Create a new Netlify site from the same GitHub repo
3. Set `VITE_HOSPITAL_ID` to the new hospital's code
4. Deploy — the new hospital is live with full data isolation
