# Legal & Digital Marketing Dashboard

Dashboard for a legal + digital-marketing agency (projects, kanban tracking, cash flow).
Re-platformed from a Firebase static site to a **Vue 3 frontend** + **Express/MySQL backend**.

```
be/   Express + MySQL REST API   (port 3000)
fe/   Vue 3 + Vite SPA           (port 5173)
```

## Prerequisites

- Node.js 18+
- A running MySQL server (5.7+ for JSON column support)

## 1. Backend (`be/`)

```bash
cd be
cp .env.example .env        # then edit DB credentials if needed
npm install
npm run db:init             # creates the database + tables
npm run dev                 # starts API on http://localhost:3000
```

`.env` values:

| var             | default                     | notes                                          |
|-----------------|-----------------------------|------------------------------------------------|
| `PORT`          | `3000`                      | API port                                       |
| `DB_HOST`       | `localhost`                 |                                                |
| `DB_PORT`       | `3306`                      |                                                |
| `DB_USER`       | `root`                      |                                                |
| `DB_PASSWORD`   | *(empty)*                   |                                                |
| `DB_NAME`       | `legal_marketing_dashboard` | created by `npm run db:init`                    |
| `CORS_ORIGIN`   | `http://localhost:5173`     | frontend dev origin                            |
| `MONTHLY_TARGET`| `100000000`                 | monthly revenue target for "Pencapaian Target" |
| `JWT_SECRET`    | *(required)*                | signing secret — set a long random value       |
| `JWT_EXPIRES_IN`| `7d`                        | token lifetime                                 |
| `BCRYPT_ROUNDS` | `12`                        | password hashing cost                          |

> Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### API endpoints

| Method | Path                        | Purpose                              |
|--------|-----------------------------|--------------------------------------|
| POST   | `/api/auth/register`        | create account → `{ token, user }`   |
| POST   | `/api/auth/login`           | login → `{ token, user }`            |
| GET    | `/api/auth/me`              | current user (needs token)           |
| GET    | `/api/projects`             | list projects (newest first)         |
| POST   | `/api/projects`             | create (server sets stages + status) |
| PATCH  | `/api/projects/:id/status`  | move kanban column                   |
| PATCH  | `/api/projects/:id/stages`  | update progress stages               |
| DELETE | `/api/projects/:id`         | delete project                       |
| GET    | `/api/transactions?month=`  | list cash-flow transactions          |
| POST   | `/api/transactions`         | create (optional `proof` file)       |
| DELETE | `/api/transactions/:id`     | delete transaction                   |
| GET    | `/api/dashboard`            | computed finance summary             |

## 2. Frontend (`fe/`)

```bash
cd fe
npm install
npm run dev                 # starts SPA on http://localhost:5173
```

API base URL is set in `fe/.env` (`VITE_API_URL=http://localhost:3000/api`).

## Authentication & security

- Register/login with username + password. Passwords are hashed with **bcrypt**; the API
  issues a **JWT** (Bearer token) stored in the browser's `localStorage`.
- All `/api/projects`, `/api/transactions`, and `/api/dashboard` routes **require a valid
  token**; unauthenticated requests get `401`. The frontend router guard redirects to
  `/login`, and a `401` from the API auto-logs-out and returns to `/login`.
- Auth endpoints are **rate-limited** (30 requests / 15 min per IP) to slow brute-force.
- Login returns a single generic error for both unknown user and wrong password.
- First run: open the app → **Register** an account → you're taken into the dashboard.

## Notes

- Data refreshes on load and after each add/edit/delete (no realtime; replaces the old
  Firebase `onSnapshot`).
- New-project payment status routes the initial kanban stage: `unpaid → Leads`,
  `dp → Drafting`, `paid → On Process`.
- Cash Flow and the dashboard money metrics (Omset / Piutang / Target / bars) are computed
  from real MySQL data.
