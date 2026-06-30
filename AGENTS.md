# Agent Notes

Two-package project: `backend/` (Express + Mongoose) and `frontend/` (Vite + React + shadcn/Tailwind). No root manifest or monorepo tooling—work in whichever package is relevant.

## Running locally

Backend:

```bash
cd backend
npm install
npm run dev        # nodemon server.js, default port 5000
npm start          # node server.js, production-style
npm run seed       # wipes User + Student collections and re-creates demo accounts
```

Frontend:

```bash
cd frontend
npm install
npm run dev        # Vite dev server, default port 5173
npm run build      # production build
npm run lint       # ESLint over the frontend only
```

## Required environment

Backend needs a `.env` in `backend/`:

```env
MONGO_URI=<mongodb connection string>
JWT_SECRET=<any secret>
CLIENT_URL=http://localhost:5173   # optional; falls back to this
PORT=5000                          # optional
```

No `.env` is committed; the app will fail at startup without `MONGO_URI` and `JWT_SECRET`.

## Important wiring gotchas

- **Frontend API base URL is hardcoded to `http://localhost:5001/api`** in `frontend/src/context/AuthContext.jsx` and `frontend/src/context/HostelContext.jsx`. The backend defaults to port `5000`. Either set `PORT=5001` in `backend/.env` or update both axios instances—do not assume Vite proxying is configured.
- **CORS** is enabled for `CLIENT_URL` (default `http://localhost:5173`) with `credentials: true`; requests from any other origin will be rejected.
- **Auth** is cookie + header based (`Authorization: Bearer <token>`). Backend uses `protect`, `admin`, and `superAdmin` middleware.
- Roles in use: `student`, `admin`, `superadmin`. The frontend route guards treat `isAdmin` or `role === 'admin'/'superadmin'` as admin access; only `superadmin` can reach `/admin/admins`.

## Project structure

- `backend/server.js` — Express entry point; route prefixes are `/api/admin`, `/api/hostels`, `/api/rooms`, `/api/students`, `/api/mess`, `/api/leaves`, `/api/complaints`, `/api/challans`, `/api/inventory`, `/api/mess/stock`, `/api/expenses`, `/api/income`.
- `backend/config/db.js` — Mongoose connection; exits the process on failure.
- `backend/seed.js` — Demo data. Creates `admin@college.edu` / `admin123`, `superadmin@college.edu` / `super123`, and ten students with password `student123`. Deletes existing users and students first.
- `backend/scripts/backfillFinance.js` — One-time backfill of existing inventory purchases and challans into the `Expense` and `Income` collections. Run via `npm run backfill:finance`.
- `backend/models/expenseModel.js` & `backend/models/incomeModel.js` — Mirrored finance records created automatically when inventory/challans are added, updated, or deleted.
- `frontend/src/App.jsx` — Router and route guards.
- `frontend/src/main.jsx` — React root.
- `frontend/src/context/` — `AuthContext` (login/user state) and `HostelProvider` (most data fetching/crud).
- `frontend/src/pages/` — Page components; `frontend/src/MyComponents/` has `Inventory`, `Fee`, `Income`, `Expense`.
- `frontend/src/components/ui/` — shadcn-style components.

## Tooling quirks

- The repo was bootstrapped from Lovable. `vite.config.js` loads `lovable-tagger` only in development mode and aliases `@` to `./src`.
- `frontend/components.json` says `"tsx": true` and references `tailwind.config.ts`, but the actual code is `.jsx` and the Tailwind config is `tailwind.config.js`.
- ESLint config only covers the frontend (`**/*.{js,jsx}`); there is no lint or formatter for the backend.
- No test scripts or CI workflows are present.

## Verification order

1. Start MongoDB and set `backend/.env`.
2. `cd backend && npm run dev` (use `PORT=5001` to match the frontend hardcoded URL).
3. In another shell, `cd frontend && npm run dev`.
4. Run `cd frontend && npm run lint` before committing frontend changes.
