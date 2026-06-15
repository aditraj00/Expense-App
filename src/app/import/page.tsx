import { readFileSync } from "fs";
import { db } from "@/lib/db";
import { importCsvAction, seedDemoDataAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const groups = await db.group.findMany({ orderBy: { createdAt: "desc" } });

  const latestRun = await db.importRun.findFirst({
    orderBy: { createdAt: "desc" },
    include: { anomalies: true }
  });

  let csvText = "CSV file not found.";

  try {
    csvText = readFileSync("data/expenses_export.csv", "utf8");
  } catch (error) {
    console.log("CSV file not found, skipping preview.");
  }

  return (
    
    <main>
      <section className="panel panel-inner" style={{ display: "grid", gap: 20 }}>
        <div>
          <span className="eyebrow">Core Requirement: Data Import</span>
          <h1 className="title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>Import the CSV and review anomalies</h1>
          <p className="lede">Upload the file through the app, persist the import run, and keep every detected anomaly visible for approval.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <form action={importCsvAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Upload import</h2>
            <label className="muted">Group</label>
            <select name="groupId" className="input">
              <option value="">Select a group</option>
              {groups.map((group: (typeof groups)[number]) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>CSV file</label>
            <input type="file" name="csv" className="input" accept=".csv,text/csv" />
            <button className="button button-primary" type="submit" style={{ marginTop: 16 }}>Import CSV</button>
          </form>

          <form action={seedDemoDataAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Quick start</h2>
            <p className="muted">If you have not created a group yet, seed a demo household so the import can be tested immediately.</p>
            <button className="button button-secondary" type="submit">Seed demo group</button>
            <details style={{ marginTop: 16 }}>
              <summary className="muted">Preview bundled CSV</summary>
              <pre style={{ whiteSpace: "pre-wrap", overflow: "auto", maxHeight: 240 }}>{csvText.slice(0, 2000)}</pre>
            </details>
          </form>
        </div>

        <section className="panel panel-inner" style={{ boxShadow: "none" }}>
          <h2 className="section-title">Latest import run</h2>
          {latestRun ? (
            <>
              <div className="grid metrics">
                <div className="metric"><span className="muted">File</span><strong>{latestRun.fileName}</strong></div>
                <div className="metric"><span className="muted">Status</span><strong>{latestRun.status}</strong></div>
                <div className="metric"><span className="muted">Anomalies</span><strong>{latestRun.anomalies.length}</strong></div>
              </div>
              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Action</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRun.anomalies.slice(0, 10).map((anomaly: (typeof latestRun.anomalies)[number]) => (
                    <tr key={anomaly.id}>
                      <td>{anomaly.code}</td>
                      <td>{anomaly.actionTaken}</td>
                      <td>{anomaly.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="muted">No import run yet. Upload the provided CSV to create one.</p>
          )}
        </section>
      </section>
    </main>
  );
}