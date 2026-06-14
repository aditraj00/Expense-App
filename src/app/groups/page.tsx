import { db } from "@/lib/db";
import { addMemberAction, createGroupAction, endMembershipAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await db.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        include: { user: true },
        orderBy: { startsAt: "asc" }
      }
    }
  });

  return (
    <main>
      <section className="panel panel-inner" style={{ display: "grid", gap: 20 }}>
        <div>
          <span className="eyebrow">Group membership changes over time</span>
          <h1 className="title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>Create groups and manage membership windows</h1>
          <p className="lede">Memberships are dated so expenses can be attributed only to people who were in the group at that point in time.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <form action={createGroupAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Create group</h2>
            <label className="muted">Name</label>
            <input name="name" className="input" placeholder="Flatmates house" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Currency</label>
            <input name="currency" className="input" placeholder="INR" />
            <button className="button button-primary" style={{ marginTop: 16 }} type="submit">Create group</button>
          </form>

          <form action={addMemberAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Add member</h2>
            <label className="muted">Group</label>
            <select name="groupId" className="input">
              <option value="">Select a group</option>
              {groups.map((group: (typeof groups)[number]) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>User name</label>
            <input name="userName" className="input" placeholder="Sam" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Starts at</label>
            <input name="startsAt" className="input" type="datetime-local" />
            <button className="button button-secondary" style={{ marginTop: 16 }} type="submit">Add member</button>
          </form>
        </div>

        <section className="panel panel-inner" style={{ boxShadow: "none" }}>
          <h2 className="section-title">Current groups</h2>
          {groups.length === 0 ? (
            <p className="muted">No groups yet.</p>
          ) : (
            groups.map((group: (typeof groups)[number]) => (
              <div key={group.id} className="panel panel-inner" style={{ marginBottom: 16, boxShadow: "none" }}>
                <div className="grid" style={{ gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
                  <div>
                    <h3 className="section-title">{group.name}</h3>
                    <p className="muted">Currency: {group.currency}</p>
                    <p className="muted">Members now: {group.memberships.length}</p>
                  </div>
                  <form action={endMembershipAction}>
                    <label className="muted">Membership to end</label>
                    <select name="membershipId" className="input">
                      <option value="">Choose membership</option>
                      {group.memberships.map((membership: (typeof group.memberships)[number]) => (
                        <option key={membership.id} value={membership.id}>
                          {membership.user.displayName} {membership.endsAt ? `(ended ${membership.endsAt.toISOString()})` : "(active)"}
                        </option>
                      ))}
                    </select>
                    <label className="muted" style={{ marginTop: 12, display: "block" }}>Ends at</label>
                    <input name="endsAt" className="input" type="datetime-local" />
                    <button className="button button-secondary" style={{ marginTop: 16 }} type="submit">Close membership</button>
                  </form>
                </div>
              </div>
            ))
          )}
        </section>
      </section>
    </main>
  );
}