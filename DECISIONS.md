# Decisions

## 1. Next.js App Router

- Options considered: Next.js, Remix, plain React.
- Choice: Next.js.
- Reason: It gives routing, server rendering, and API surfaces in one stack.

## 2. Prisma + PostgreSQL

- Options considered: SQLite, Postgres, MySQL.
- Choice: PostgreSQL with Prisma.
- Reason: The assignment requires a relational database and the app needs clean schema evolution.

## 3. Deterministic import policy

- Options considered: silent correction, hard fail, report-only.
- Choice: report-first with explicit action labels.
- Reason: The assignment rejects silent guessing and requires user-visible anomaly handling.

## 4. Negative amounts

- Options considered: reject, flip sign, treat as refund.
- Choice: keep as refund/reversal and flag it.
- Reason: That preserves the source data while making the meaning explicit.

## 5. Duplicate rows

- Options considered: keep both, auto-merge, skip duplicate.
- Choice: skip exact duplicates and surface them for approval.
- Reason: Exact duplicates are the safest automatic cleanup candidate.