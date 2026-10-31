import { registeredTools } from "@/lib/tools";

export default async function ToolsPage() {
  const tools = await registeredTools();

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Tool registry</p>
          <h1>Tools & Integrations</h1>
        </div>
      </div>

      <div className="panel wide-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Category</th>
              <th>Version</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool: any) => (
              <tr key={tool.id}>
                <td>{tool.name}</td>
                <td>{tool.category}</td>
                <td>{tool.version}</td>
                <td>{tool.requiredPermissions.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
