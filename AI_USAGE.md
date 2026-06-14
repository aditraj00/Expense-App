# AI Usage

## Tools Used

- GitHub Copilot in VS Code

## Key Prompts

- Scaffold a shared expenses app with Next.js, Prisma, PostgreSQL, and CSV import handling.
- Design a schema that supports changing membership over time.
- Build deterministic anomaly detection for the provided export.

## Incorrect AI Output Caught So Far

1. The initial generator command failed because the folder name contained spaces and npm rejected the inferred package name.
   - Caught by: the terminal error.
   - Fix: switched to a manual scaffold and set a valid package name in `package.json`.

2. The first automatic scaffold path assumed a ready-made Next.js project would be created in place.
   - Caught by: the workspace staying empty after the tool call.
   - Fix: created the project files manually instead of relying on that helper.

3. The import page originally relied on a raw import path that would not be stable in Next.js.
   - Caught by: code review before validation.
   - Fix: switched to server-side `fs.readFileSync` against the provided CSV path.