# FarmAsyst North — Frontend Integration Patch

## What's in this patch

All files in this zip are **drop-in replacements or new additions** for your
existing `farmasyst-north` frontend project. No file outside `src/` or the
root config files is touched.

---

## 1. Install the new dependency

```bash
npm install axios
```

---

## 2. Drop the files

Copy everything from this zip into your project root, preserving the
folder structure. Overwrite when prompted.

```
farmasyst-north/
├── .env                          ← new — set VITE_API_BASE_URL
├── .env.example                  ← new — reference
├── vite.config.ts                ← updated — dev proxy to :8000
├── package.json                  ← updated — axios added
└── src/
    ├── App.tsx                   ← replaced — real routing + auth guard
    ├── types/index.ts            ← replaced — aligned to Django models
    ├── lib/
    │   ├── api.ts                ← NEW — axios instance + JWT interceptors
    │   ├── auth-context.tsx      ← replaced — real JWT login/logout
    │   ├── hooks/
    │   │   └── useAsync.ts       ← NEW — generic data-fetching hook
    │   └── services/             ← NEW — 8 service files
    │       ├── auth.ts
    │       ├── farms.ts
    │       ├── credit.ts
    │       ├── payments.ts
    │       ├── training.ts
    │       ├── marketplace.ts
    │       ├── notifications.ts
    │       └── admin.ts
    └── pages/
        ├── auth/Login.tsx        ← replaced — real email/password form
        ├── farmer/               ← 7 pages, all wired to live API
        ├── investor/             ← 7 pages, all wired to live API
        ├── admin/                ← 9 pages, all wired to live API
        └── consumer/             ← 4 pages, all wired to live API

---

## 3. Configure your .env

```
VITE_API_BASE_URL=http://localhost:8000
```

The Vite dev proxy forwards all `/api/*` requests to Django automatically,
so you won't hit CORS issues during development.

---

## 4. Start both servers

```bash
# Terminal 1 — Django backend
cd farmasyst-north-api
python manage.py runserver

# Terminal 2 — React frontend
cd farmasyst-north
npm install
npm run dev
```

---

## 5. How authentication works

1. User submits email + password on `/login`
2. Frontend POSTs to `/api/v1/auth/login/` → receives `access` + `refresh` JWT tokens
3. Tokens stored in `localStorage` as `fa_access` and `fa_refresh`
4. Every subsequent API request attaches `Authorization: Bearer <access>`
5. On 401, the interceptor silently refreshes the token via `/api/v1/auth/refresh/`
6. If refresh fails, user is redirected to `/login` and tokens are cleared
7. On logout, `/api/v1/auth/logout/` is called to blacklist the refresh token

---

## 6. Role-based routing

After login, the user is redirected to `/<role>` based on their account type:
- `/farmer`   — Poultry Farmer portal
- `/investor` — Investor portal
- `/admin`    — FarmAsyst North admin panel
- `/consumer` — Consumer marketplace

All routes are protected. Unauthenticated users are redirected to `/login`.

---

## 7. API base URL for production

Update `.env` (or set an environment variable in your CI/CD):
```
VITE_API_BASE_URL=https://api.farmasystnorth.com
```