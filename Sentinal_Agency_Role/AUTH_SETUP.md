# MongoDB Authentication Setup

PragatiPulse keeps the existing project/analytics data in Supabase and uses MongoDB for application users and authentication.

## Roles

- `admin`: full portal access; can provision ministry and engineer accounts.
- `ministry`: scoped to projects whose `ministry` matches the user's ministry.
- `engineer`: scoped to projects whose `agency` matches the user's agency.
- `user`: normal self-signup and read-only dashboard access.

Privileged roles are deliberately not self-service; otherwise anyone could register as an administrator or government ministry.

## 1. Install

```bash
npm install
```

This installs `mongodb`, `bcryptjs`, and `jose`.

## 2. Environment

Copy `.env.example` to `.env.local` and set:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=pragatipulse
AUTH_SECRET=<long-random-secret>
```

Keep `MONGODB_URI` and `AUTH_SECRET` server-only. Never prefix them with `NEXT_PUBLIC_`.

## 3. Create the first admin

```bash
ADMIN_EMAIL=admin@pragatipulse.gov.in ADMIN_PASSWORD='Use-A-Strong-Password' npm run seed:admin
```

On Windows PowerShell:

```powershell
$env:ADMIN_EMAIL="admin@pragatipulse.gov.in"
$env:ADMIN_PASSWORD="Use-A-Strong-Password"
npm run seed:admin
```

## 4. Routes

- `/login` — login
- `/signup` — public user registration
- `/logout` — clear session
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/admin/users` — admin-only provisioning of ministry/engineer/user accounts

## MongoDB document

A user looks like:

```json
{
  "name": "Example Engineer",
  "email": "engineer@example.gov.in",
  "passwordHash": "<bcrypt hash>",
  "role": "engineer",
  "agency": "NHAI",
  "active": true,
  "createdAt": "..."
}
```

Passwords are never stored in plain text. Sessions use an HTTP-only, signed JWT cookie.

## Agency / Company role

`agency` is a privileged role provisioned by an administrator. Each agency account must have an `agency` value matching the `agency` field on its projects.

Agency users get a **My Projects** tab where they can:
- Add new projects. New projects are stored in MongoDB's `projects` collection.
- Modify projects assigned to their agency. For existing Supabase projects, MongoDB stores the changes in `project_overrides` so the original source data is preserved.
- Never edit another agency's projects.

Run the MongoDB indexes once:

```bash
npm run setup:db
```

The admin account API can create an agency account by posting:

```json
{
  "name": "Example Infrastructure Ltd",
  "email": "projects@example.com",
  "password": "StrongPassword123!",
  "role": "agency",
  "agency": "Example Infrastructure Ltd"
}
```
