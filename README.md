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