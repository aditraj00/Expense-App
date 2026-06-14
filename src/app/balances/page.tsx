import { db } from "@/lib/db";
import { getGroupBalances } from "@/lib/balances";
import { formatMinorUnits } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function BalancesPage() {
  const groups = await db.group.findMany({ orderBy: { createdAt: "desc" } });
  const selectedGroup = groups[0] ?? null;
  const balances = selectedGroup ? await getGroupBalances(selectedGroup.id) : null;

  return (
    <main>
      <section className="panel panel-inner" style={{ display: "grid", gap: 20 }}>
        <div>
          <span className="eyebrow">Balance summary</span>
          <h1 className="title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>Who owes whom, with traceability</h1>
          <p className="lede">This summary is computed from expenses, settlements, and dated memberships so the result can be explained row by row.</p>
        </div>

        {balances ? (
          <>
            <div className="grid metrics">
              {balances.users.map((row: (typeof balances.users)[number]) => (
                <div className="metric" key={row.userId}>
                  <span className="muted">{row.displayName}</span>
                  <strong>{formatMinorUnits(row.balanceMinor, balances.group.currency)}</strong>
                  <p className="muted">Paid {formatMinorUnits(row.contributedMinor, balances.group.currency)} and owed {formatMinorUnits(row.owedMinor, balances.group.currency)}</p>
                </div>
              ))}
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Balance</th>
                  <th>Trace</th>
                </tr>
              </thead>
              <tbody>
                {balances.users.map((row: (typeof balances.users)[number]) => (
                  <tr key={row.userId}>
                    <td>{row.displayName}</td>
                    <td>{formatMinorUnits(row.balanceMinor, balances.group.currency)}</td>
                    <td>
                      {row.entries.slice(0, 5).map((entry: (typeof row.entries)[number]) => (
                        <div key={`${entry.label}-${entry.date.toISOString()}`}>
                          {entry.date.toISOString()} - {entry.label} - {formatMinorUnits(entry.amountMinor, balances.group.currency)}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="muted">Create a group and add expenses to see balances.</p>
        )}
      </section>
    </main>
  );
}