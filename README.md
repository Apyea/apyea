# Cognito App

Next.js (TypeScript) starter with Tailwind CSS, Headless UI, PostgreSQL (Prisma), and AWS Cognito for server-side user management.

## Stack

- **Next.js 16** App Router
- **Tailwind CSS v4**
- **Headless UI** + Heroicons
- **PostgreSQL** via **Prisma**
- **AWS Cognito** — JWT verification and Admin API routes

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Set `DATABASE_URL` and Cognito variables in `.env`.

4. Push the schema and seed master data:

   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) for the landing page.

## APYEA: Survey vs membership

These are **separate** flows (see project PDF):

| Flow | URL | Admin |
|------|-----|--------|
| Yoga Educator Survey | `/survey` (`/register` redirects) | `/admin/surveys` |
| APYEA Membership application | `/membership/apply` | `/admin/membership/applications` |
| Member dashboard (stub) | `/member` | — |
| Finance summary | — | `/admin/finance` |
| Expenditure vouchers | — | `/admin/finance/expenses` |
| Manual income (donation, programs, events, subscriptions) | — | `/admin/finance/income` |
| Program / event / plan catalog | — | `/admin/finance/catalog` |

Finance APIs (requires login; roles `OPERATIONAL_MANAGER`, `EXECUTIVE_MANAGER`, or `ADMIN`): `GET /api/admin/finance/summary`, `GET/POST /api/admin/finance/expenses`, `GET/POST /api/admin/finance/income`, catalog under `/api/admin/finance/programs`, `/events`, `/subscription-plans`. Renewals: `/api/admin/membership/renewals`.

Survey API: `POST /api/surveys` · Membership API: `POST /api/membership/applications` (multipart: `data` JSON + `photo`, `identityProof`).

Membership admin actions on `POST /api/admin/membership/applications/[id]`: `verify_payment`, `mark_verified`, `approve`, `reject`.

After pulling schema changes: `npm run db:push` then `npm run db:seed`.

## APYEA registration (legacy section — surveys)

| Page | URL |
|------|-----|
| Educator survey | [/survey](http://localhost:3000/survey) |
| Admin surveys | [/admin/surveys](http://localhost:3000/admin/surveys) |
| Master data | [/admin/master](http://localhost:3000/admin/master) |

Flow: submit **Yoga Educator Survey** → optional admin review (`reviewStatus` on survey record).

### Registration API (testing)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/master` | All lookup values for the form |
| `GET` | `/api/master/districts?stateId=` | Districts for a state |
| `GET` | `/api/master/mandals?districtId=` | Mandals for a district |
| `POST` | `/api/surveys` | JSON body (survey fields + `consent: true`) |
| `GET` | `/api/surveys/[id]` | Survey by id or reference number |
| `GET` | `/api/admin/surveys` | Admin list (search, filters, pagination) |
| `POST` | `/api/admin/surveys/[id]/review` | `{ "decision": "APPROVED" \| "REJECTED" }` |
| `POST` | `/api/membership/applications` | Membership apply (multipart) |
| `GET` | `/api/admin/membership/applications` | Membership application list |
| `POST` | `/api/admin/membership/applications/[id]` | `{ "action": "verify_payment" \| "mark_verified" \| "approve" \| "reject", "remarks"? }` |
| `GET/PATCH` | `/api/admin/settings` | Membership renewal/fees settings (JSON keys) |
| `GET/POST` | `/api/admin/master/[resource]` | CRUD for lookup tables (soft-delete via deactivate) |

## API routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users/me` | Returns the authenticated user (Cognito + Postgres sync). Requires `Authorization: Bearer <access_token>`. |
| `GET` | `/api/admin/users` | Lists Cognito users (admin only). |
| `POST` | `/api/admin/users` | Creates a Cognito user (admin only). Body: `{ "email", "name?", "temporaryPassword?" }`. |
| `PATCH` | `/api/admin/users/[username]` | Updates Cognito attributes (admin only). |
| `DELETE` | `/api/admin/users/[username]` | Deletes a Cognito user (admin only). |

Server routes need IAM credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) with permissions for Cognito Identity Provider admin actions on your user pool.

Promote an admin in Postgres after first sign-in:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Cognito setup (summary)

1. Create a User Pool and **app client** with **USER_PASSWORD_AUTH** enabled (Authentication flows).
2. Set `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `AWS_REGION`, and IAM credentials in `.env` (see `.env.example`).
3. If the app client has a secret, set `COGNITO_CLIENT_SECRET`.
4. **Member login**: `/login` · **Forgot password**: `/login/forgot-password` · **Dashboard**: `/member` (session cookie + `/api/auth/session`).
5. On **membership approval**, the server creates a Cognito user (invite email) and links `membership_members.user_id` → `users` → Cognito `sub`.
6. **Username type**: set `COGNITO_USERNAME_TYPE` and `NEXT_PUBLIC_COGNITO_USERNAME_TYPE` to `phone` or `email` to match your user pool (default `phone`, E.164 `+91…` for India).
7. **Admin users** (phone pool — mobile + email pairs):

   ```bash
   npm run bootstrap:admins -- 9876543210 admin1@example.com
   ```

   Email pool: `npm run bootstrap:admins -- admin1@example.com`

   Then sign in at `/login`. Admins see an **Open admin** link on `/member`.
