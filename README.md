# WorkPulse

Full-stack project management with **separate Admin and User panels**, **JWT + roles**, **light UI**, and **Recharts** analytics on the admin dashboard.

| Folder    | Stack                                              |
| --------- | -------------------------------------------------- |
| `client/` | Vite, React, TypeScript, Tailwind, ShadCN-style UI, Recharts |
| `server/` | Express, Mongoose, JWT, bcrypt                     |

## Environment variables (server)

Set in `server/.env` (copy from `.env.example`):

| Variable        | Description |
| --------------- | ----------- |
| `MONGO_URI`     | Preferred. MongoDB connection string (`workpulse` DB). |
| `MONGODB_URI`   | Alternative name (either works). |
| `JWT_SECRET`    | Long random string for signing tokens. |
| `PORT`          | API port (default `5000`). |
| `CLIENT_ORIGIN` | Production SPA origin for CORS (e.g. Vercel URL). |
| `ADMIN_EMAIL`   | **Reserved** administrator email (bootstrap account; cannot register as user). |
| `ADMIN_PASSWORD`| Admin password; **re-synced on every API restart** so it always matches `/admin/login`. |
| `ADMIN_SKIP_PASSWORD_SYNC` | Optional `1`: do not overwrite an existing admin's password from env after first create/promote. |

On **Render**, set the same. On **Vercel**, set `VITE_API_URL` to your API URL at build time.

## Quick start

**Terminal 1 — API**

```bash
cd server
npm install
npm run dev
```

**Terminal 2 — SPA**

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

- **Team:** `/register` then `/login` (members only).
- **Admin:** set `ADMIN_EMAIL` + `ADMIN_PASSWORD` in `server/.env`, restart the API — the admin user is created automatically. Sign in at **`/admin/login`**. That email cannot be used on `/register`.

Optional — promote an existing user without env bootstrap:

```bash
cd server
set ADMIN_EMAIL=you@example.com
npm run promote-admin
```

### MongoDB `querySrv ECONNREFUSED`

Use a **standard** `mongodb://` URI from Atlas, or see `.env.example` / earlier troubleshooting (DNS, `MONGODB_USE_PUBLIC_DNS=1`).

---

## Routing (frontend)

| Area    | Paths |
| ------- | ----- |
| Public  | `/login` (team), `/register`, `/admin/login` (admin only) |
| **Admin** | `/admin/dashboard`, `/admin/projects`, `/admin/tasks`, `/admin/users` |
| **User**  | `/user/dashboard`, `/user/my-projects`, `/user/my-tasks` |

- **Admin** → only `role: admin` (otherwise redirected).
- **User** → only `role: user` (admins use `/admin/*` only).

---

## API summary

**Auth**

- `POST /api/auth/register` — creates **user** accounts only (rejects reserved `ADMIN_EMAIL`).
- `POST /api/auth/login` — **user** role only (admins get 403; use admin login).
- `POST /api/auth/admin/login` — **admin** role only.
- `GET /api/auth/me` — Bearer JWT. Payload includes `userId` and `role`.

**Admin** (`Authorization: Bearer …`, role admin)

- `GET /api/admin/stats` — `totalUsers`, `totalProjects`, `totalTasks`, `completedTasks`
- `GET /api/admin/task-status` — counts: `todo`, `in_progress`, `completed`
- `GET /api/admin/tasks-per-project` — `{ projectId, title, taskCount }[]`
- `GET /api/admin/tasks-over-time` — `{ date, count }[]`
- `GET /api/admin/user-productivity` — completed tasks per assignee
- `GET|POST /api/admin/projects`, `GET|PATCH|DELETE /api/admin/projects/:id` — `members` is an array of user ids
- `GET|POST /api/admin/tasks`, `PATCH|DELETE /api/admin/tasks/:id`
- `GET /api/admin/users`, `DELETE /api/admin/users/:id`

**User panel** (role user)

- `GET /api/user/stats` — my task counts
- `GET /api/user/projects` — projects where I am in `members`
- `GET /api/user/tasks` — tasks assigned to me
- `PATCH /api/user/tasks/:id/status` — body `{ status }` only

---

## Project layout (high level)

```
server/src/
  server.js              # App entry
  config/db.js
  models/                # User, Project, Task
  middleware/            # authMiddleware.js, roleMiddleware.js
  routes/                # authRoutes.js, adminRoutes.js, userPanelRoutes.js
  controllers/           # admin + user panel logic

client/src/
  components/            # Navbar, Sidebar, ProtectedRoute, AdminRoute, UserRoute, charts/*
  context/AuthContext.tsx
  services/              # adminApi.ts, userApi.ts
  pages/admin/           # Admin dashboard, projects, tasks, users
  pages/user/            # User dashboard, my-projects, my-tasks
  pages/Login.tsx, Register.tsx
```

---

## Deployment

- **Frontend (Vercel):** Root `client/`, build `npm run build`, output `dist/`, env `VITE_API_URL=https://your-render-service.onrender.com`.
- **Backend (Render):** Start `npm start` in `server/`, set `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` to the Vercel URL.

---

## Security

Do not commit real `MONGO_URI` / passwords. Use strong `JWT_SECRET`. Rotate leaked credentials.
