import { loginAction, registerAction, logoutAction } from "./actions";

export default function LoginPage() {
  return (
    <main>
      <section className="panel panel-inner" style={{ display: "grid", gap: 24 }}>
        <div>
          <span className="eyebrow">Login module</span>
          <h1 className="title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>Sign in or create a user</h1>
          <p className="lede">This starter uses simple session cookies backed by the relational database so the rest of the app can be protected.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <form action={loginAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Sign in</h2>
            <label className="muted">Name</label>
            <input name="name" className="input" placeholder="Aisha" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Password</label>
            <input name="password" type="password" className="input" placeholder="password123" />
            <button className="button button-primary" style={{ marginTop: 16 }} type="submit">Sign in</button>
          </form>

          <form action={registerAction} className="panel panel-inner" style={{ boxShadow: "none" }}>
            <h2 className="section-title">Register</h2>
            <label className="muted">Name</label>
            <input name="name" className="input" placeholder="Sam" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Display name</label>
            <input name="displayName" className="input" placeholder="Sam" />
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Password</label>
            <input name="password" type="password" className="input" placeholder="password123" />
            <button className="button button-primary" style={{ marginTop: 16 }} type="submit">Create user</button>
          </form>
        </div>

        <form action={logoutAction}>
          <button className="button button-secondary" type="submit">Log out current session</button>
        </form>
      </section>
    </main>
  );
}