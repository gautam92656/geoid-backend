# Astra Backend — Starter Project

Minimal Node.js + Express + TypeScript + Prisma backend with:

- **Auth**: signup, login, verify OTP, forgot password, reset password, change password
- **CRUD example**: FAQ module (list, create, get, update, delete)

## Setup

```bash
npm install
cp .env.example .env   # configure DATABASE_URL, JWT_SECRET, email settings
npm run prisma:migrate # applies migrations and clears old schema
npm run dev
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/signup` | No | Register user, sends OTP |
| POST | `/api/v1/auth/login` | No | Login with email/password |
| POST | `/api/v1/auth/verify-otp` | No | Verify email OTP |
| POST | `/api/v1/auth/resend-otp` | No | Resend OTP |
| POST | `/api/v1/auth/forgot-password` | No | Send reset OTP |
| POST | `/api/v1/auth/reset-password` | No | Set new password |
| POST | `/api/v1/auth/change-password` | Yes | Change password |
| GET | `/api/v1/faqs` | Yes | List FAQs (paginated) |
| POST | `/api/v1/faqs` | Yes | Create FAQ |
| GET | `/api/v1/faqs/:id` | Yes | Get FAQ |
| PATCH | `/api/v1/faqs/:id` | Yes | Update FAQ |
| DELETE | `/api/v1/faqs/:id` | Yes | Delete FAQ |

Swagger docs: `http://localhost:3000/api-docs/`

## Reset database (clear all tables)

```bash
npx prisma migrate reset
```

## Project structure

```
src/
  modules/v1/
    user/auth/     # Auth endpoints
    user/users/    # User repository (used by auth)
    user/otp/      # OTP repository (used by auth)
    faq/           # CRUD example
  shared/          # Middleware, errors, utils
  config/          # Env, logger, swagger
  routes/          # Route mounting
prisma/
  schema/          # users, otp_verifications, faqs
```
