export default function SettingsPage() {
  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Workspace settings</p>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="panel wide-panel">
        <div className="stack-list">
          <div className="stat-row">
            <span>Workspace</span>
            <strong>Acme Workspace</strong>
          </div>
          <div className="stat-row">
            <span>Antseed provider</span>
            <strong>{process.env.ANTSEED_BASE_URL ?? "not configured"}</strong>
          </div>
          <div className="stat-row">
            <span>OAuth readiness</span>
            <strong>{process.env.GOOGLE_CLIENT_ID ? "Google configured" : "pending"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
