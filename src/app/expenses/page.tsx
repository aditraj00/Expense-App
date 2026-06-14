import { db } from "@/lib/db";
import { createExpenseAction, createSettlementAction } from "./actions";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  const groups = await db.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: { include: { user: true } },
      expenses: { orderBy: { date: "desc" }, take: 10 }
    }
  });

  const firstGroup = groups[0] ?? null;

  return (
    <main>
      <section className="panel panel-inner" style={{ display: "grid", gap: 20 }}>
        <div>
          <span className="eyebrow">Create and manage expenses</span>
          <h1 className="title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>Add expenses, split them, and record payments</h1>
          <p className="lede">This page covers equal, unequal, percentage, and share splits plus settlement entries for direct payments.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <form action={createExpenseAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">New expense</h2>
            <label className="muted">Group</label>
            <select name="groupId" className="input" defaultValue={firstGroup?.id ?? ""}>
              {groups.map((group: (typeof groups)[number]) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Description</label>
            <input name="description" className="input" placeholder="Dinner at Marina Bites" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Amount minor units</label>
            <input name="amountMinor" className="input" type="number" placeholder="1200" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Currency</label>
            <input name="currency" className="input" defaultValue="INR" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Paid by user id</label>
            <input name="paidById" className="input" defaultValue={user?.id ?? ""} />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Split type</label>
            <input name="splitType" className="input" defaultValue="EQUAL" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Split with names</label>
            <input name="splitWith" className="input" placeholder="Aisha,Rohan,Priya,Meera" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Split details</label>
            <textarea name="splitDetails" className="input" rows={3} placeholder="Aisha 30%; Rohan 30%; Priya 30%; Meera 10%" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Date</label>
            <input name="date" className="input" type="datetime-local" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Notes</label>
            <textarea name="notes" className="input" rows={3} placeholder="Optional note" />
            <button className="button button-primary" style={{ marginTop: 16 }} type="submit">Save expense</button>
          </form>

          <form action={createSettlementAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Record payment / settlement</h2>
            <label className="muted">Group</label>
            <select name="groupId" className="input" defaultValue={firstGroup?.id ?? ""}>
              {groups.map((group: (typeof groups)[number]) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>From user id</label>
            <input name="fromUserId" className="input" placeholder="from user id" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>To user id</label>
            <input name="toUserId" className="input" placeholder="to user id" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Amount minor units</label>
            <input name="amountMinor" className="input" type="number" placeholder="5000" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Currency</label>
            <input name="currency" className="input" defaultValue="INR" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Note</label>
            <input name="note" className="input" placeholder="Rohan paid Aisha back" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Date</label>
            <input name="date" className="input" type="datetime-local" />
            <button className="button button-secondary" style={{ marginTop: 16 }} type="submit">Save settlement</button>
          </form>
        </div>

        <section className="panel panel-inner" style={{ boxShadow: "none" }}>
          <h2 className="section-title">Recent activity</h2>
          {groups.length === 0 ? (
            <p className="muted">Create a group first.</p>
          ) : (
            groups.map((group: (typeof groups)[number]) => (
              <div key={group.id} className="panel panel-inner" style={{ boxShadow: "none", marginBottom: 16 }}>
                <h3 className="section-title">{group.name}</h3>
                {group.expenses.length === 0 ? (
                  <p className="muted">No expenses yet.</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.expenses.map((expense: (typeof group.expenses)[number]) => (
                        <tr key={expense.id}>
                          <td>{expense.date.toISOString()}</td>
                          <td>{expense.description}</td>
                          <td>{expense.amountMinor} {expense.currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
        </section>
      </section>
    </main>
  );
}