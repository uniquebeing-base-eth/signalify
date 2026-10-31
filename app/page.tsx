import { getDashboardStats } from "@/lib/data";

export default async function HomePage() {
  const stats = await getDashboardStats();

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>Signalify operations</h1>
        </div>
        <a href="/agent-factory" className="primary-button">
          Create employee
        </a>
      </div>

      <div className="metrics-grid">
        <div className="panel metric-card">
          <span>Total AI employees</span>
          <strong>{stats.totalEmployees}</strong>
        </div>
        <div className="panel metric-card">
          <span>Active employees</span>
          <strong>{stats.activeEmployees}</strong>
        </div>
        <div className="panel metric-card">
          <span>Tasks completed</span>
          <strong>{stats.tasksCompleted}</strong>
        </div>
        <div className="panel metric-card">
          <span>Current activity</span>
          <strong>{stats.currentActivity}</strong>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel wide-panel">
          <div className="section-header">
            <h2>Model usage</h2>
            <span className="badge">Live</span>
          </div>
          <div className="stack-list">
            <div className="stat-row">
              <span>Model catalog</span>
              <strong>{stats.modelCatalog}</strong>
            </div>
            <div className="stat-row">
              <span>Estimated cost</span>
              <strong>${Number(stats.estimatedCost).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="panel wide-panel">
          <div className="section-header">
            <h2>Recent activity</h2>
          </div>
          <ul className="activity-list">
            {stats.recentActivity.map((entry) => (
              <li key={`${entry.label}-${entry.timestamp}`}>
                <span>{entry.label}</span>
                <small>{entry.timestamp}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
