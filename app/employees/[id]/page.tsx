import { getEmployeeWorkspace } from "@/lib/employee-workspace";

export const dynamic = "force-dynamic";

export default async function EmployeeWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getEmployeeWorkspace(id);

  if (!workspace.employee) {
    return (
      <div className="page-header">
        <div className="panel wide-panel">
          <h1>Employee not found</h1>
          <p>The requested employee workspace does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Employee workspace</p>
          <h1>{workspace.employee.name}</h1>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel wide-panel">
          <div className="section-header">
            <h2>Identity</h2>
          </div>
          <div className="stack-list">
            <div className="stat-row"><span>Title</span><strong>{workspace.employee.title}</strong></div>
            <div className="stat-row"><span>Profession</span><strong>{workspace.employee.profession}</strong></div>
            <div className="stat-row"><span>Model</span><strong>{workspace.employee.modelName}</strong></div>
            <div className="stat-row"><span>Status</span><strong>{workspace.employee.status}</strong></div>
          </div>
        </div>

        <div className="panel wide-panel">
          <div className="section-header">
            <h2>Active conversations</h2>
          </div>
          <ul className="activity-list">
            {workspace.conversations.length === 0 ? (
              <li>No conversations yet.</li>
            ) : (
              workspace.conversations.map((conversation) => (
                <li key={conversation.id}>
                  <span>{conversation.title ?? "Workspace conversation"}</span>
                  <small>{conversation.messages.length} messages</small>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="panel wide-panel">
        <div className="section-header">
          <h2>Recent tasks</h2>
        </div>
        <ul className="activity-list">
          {workspace.tasks.length === 0 ? (
            <li>No tasks assigned yet.</li>
          ) : (
            workspace.tasks.map((task) => (
              <li key={task.id}>
                <span>{task.title}</span>
                <small>{task.status}</small>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
