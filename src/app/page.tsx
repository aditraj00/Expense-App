import { readFileSync } from "fs";
import { importExpensesCsv } from "@/lib/importer";
import { formatMinorUnits } from "@/lib/money";

let result = {
  summary: {
    totalRows: 0,
    skippedRows: 0,
  },
  anomalies: [] as unknown[],
};

try {
  const csvText = readFileSync("data/expenses_export.csv", "utf8");
  result = importExpensesCsv(csvText);
} catch (error) {
  console.log("CSV file not found, skipping import preview.");
}

const sampleBalances = [
  { name: "Aisha", amount: -182340 },
  { name: "Rohan", amount: 75420 },
  { name: "Priya", amount: 96050 },
  { name: "Dev", amount: -11350 },
];

export default function HomePage() {
  return (
    <main>
      <div className="shell">
        <section className="hero">
          <div className="panel panel-inner">
            <span className="eyebrow">Shared expenses workspace</span>
            <h1 className="title">Track shared spending without guessing.</h1>
            <p className="lede">
              The app now includes the six core flows the assignment asks for:
              login, changing group membership, expense creation, settlement
              recording, CSV import, and balance tracing. The next step is to
              connect real data and tune the import policy.
            </p>

            <div className="button-row" style={{ marginTop: 24 }}>
              <a className="button button-secondary" href="/login">
                Login
              </a>
              <a className="button button-primary" href="/import">
                Open import report
              </a>
              <a className="button button-secondary" href="/groups">
                View groups
              </a>
              <a className="button button-secondary" href="/expenses">
                Expenses
              </a>
              <a className="button button-secondary" href="/balances">
                Balances
              </a>
            </div>
          </div>

          <div className="panel panel-inner">
            <h2 className="section-title">Import summary</h2>

            <div className="grid" style={{ gap: 12 }}>
              <div className="metric">
                <span className="muted">Rows parsed</span>
                <strong>{result.summary.totalRows}</strong>
              </div>

              <div className="metric">
                <span className="muted">Anomalies detected</span>
                <strong>{result.anomalies.length}</strong>
              </div>

              <div className="metric">
                <span className="muted">Rows skipped</span>
                <strong>{result.summary.skippedRows}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="panel panel-inner">
          <h2 className="section-title">Current balance sketch</h2>

          <div className="grid metrics">
            {sampleBalances.map((balance) => (
              <div className="metric" key={balance.name}>
                <span className="muted">{balance.name}</span>
                <strong>
                  {formatMinorUnits(balance.amount, "INR")}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel-inner">
          <h2 className="section-title">What ships first</h2>

          <table className="table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Status</th>
                <th>Why it exists</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>CSV import</td>
                <td>
                  <span className="pill">Implemented</span>
                </td>
                <td>
                  Uploads the provided export, stores import runs, and records
                  anomalies in the database.
                </td>
              </tr>

              <tr>
                <td>Database schema</td>
                <td>
                  <span className="pill">Implemented</span>
                </td>
                <td>
                  Models users, memberships, expenses, settlements, sessions,
                  and import runs in Prisma.
                </td>
              </tr>

              <tr>
                <td>Login, groups, balances</td>
                <td>
                  <span className="pill">Implemented</span>
                </td>
                <td>
                  Session-backed login, dated memberships, and balance
                  summaries are now wired into the app.
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}