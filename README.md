# Spreetail Shared Expenses App

Starter implementation for the shared expenses assignment.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Zod

## What is wired now

- CSV parser for the provided export
- Import anomaly classification
- Prisma schema for users, groups, memberships, expenses, settlements, and imports
- Initial app pages for home, groups, import report, and expenses

## Next steps

1. Connect login and sessions.
2. Persist import runs and anomalies to the database.
3. Build group membership timelines and balance calculations.
4. Add approval workflow for duplicate cleanup and other import changes.

## Local setup

1. Set `DATABASE_URL` in `.env`.
2. Run `npm install`.
3. Run `npx prisma generate`.
4. Run `npm run dev`.

## Deploying to Vercel

1. Go to https://vercel.com and import the GitHub repository `aditraj00/Expense-App`.
2. In Vercel's project settings add the environment variable `DATABASE_URL` (set it to your production Postgres URL).
3. Optional: add a GitHub Actions secret `DATABASE_URL` to run the included `.github/workflows/prisma-db-push.yml` which executes `npx prisma db push` after pushes to `main`.
4. Deploy — Vercel will build the Next.js project automatically. If the app needs additional secrets (sessions, tokens), add them in the Vercel dashboard.

Notes:
- The repository includes a `vercel.json` to help Vercel detect the Next.js app.
- The `.vercelignore` prevents large dev files and the `data/` folder from being uploaded.

### Automatic deploy from GitHub

I added a GitHub Actions workflow `.github/workflows/deploy-to-vercel.yml` that will automatically deploy the site when `main` is pushed. To enable it, add the following GitHub repository secrets:

- `VERCEL_TOKEN` — a Vercel personal token (create at https://vercel.com/account/tokens).
- `VERCEL_ORG_ID` — your Vercel organization ID (found in the project or team settings).
- `VERCEL_PROJECT_ID` — the Vercel project ID for this repository (found in the project settings).

Also ensure `DATABASE_URL` is set as a repository secret so workflows that run `prisma db push` have access.

How to get Org & Project IDs:

1. Open your Vercel project → Settings → General → scroll to "Project ID" / "Team ID".
2. Copy those values into the matching GitHub secrets.

Once the secrets are configured, pushing to `main` will trigger a build and a production deploy on Vercel.

