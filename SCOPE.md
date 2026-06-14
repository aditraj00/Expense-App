# Scope

## Current Scope

- Ingest the provided `expenses_export.csv` without editing it by hand.
- Detect anomalies and produce a visible report.
- Model shared expenses in a relational database.

## Anomalies Seen in the CSV

- Duplicate expense rows for the same dinner.
- Payer names with inconsistent casing and trailing spaces.
- Missing payer value.
- Missing currency value.
- Missing split type value.
- A negative amount that should be treated as a refund/reversal.
- A settlement row stored as an expense.
- A row with decimal rupee value.
- A row where split details do not match the declared split type.
- Membership boundary issues around Meera leaving and Sam joining.
- A date written in an ambiguous format.
- A row with split details on an equal split.

## Database Schema

- `User`: account identity and login fields.
- `Group`: household or trip container.
- `Membership`: time-bounded group membership.
- `Expense`: stored expense or imported record.
- `ExpenseSplit`: per-person split allocation.
- `Settlement`: direct payment between users.
- `ImportRun`: one CSV import attempt.
- `ImportAnomaly`: anomaly rows belonging to an import run.