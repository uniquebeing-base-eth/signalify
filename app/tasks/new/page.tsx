import { listEmployees } from "@/lib/agent-factory";

export default async function NewTaskPage() {
  const employees = await listEmployees();

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Work intake</p>
          <h1>New assignment</h1>
        </div>
      </div>

      <form action="/api/tasks" method="post" className="panel wide-panel" style={{ display: "grid", gap: 16 }}>
        <div className="form-grid">
          <label className="field">
            <span>Assignment title</span>
            <input name="title" defaultValue="Organize PDF and CSV workflow" required />
          </label>

          <label className="field">
            <span>Assigned employee</span>
            <select name="employeeId" defaultValue="">
              <option value="">Unassigned</option>
              {employees.map((employee: any) => (
                <option key={employee.id} value={employee.id}>{employee.name} — {employee.profession}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select name="category" defaultValue="document">
              <option value="research">Research</option>
              <option value="document">Document creation</option>
              <option value="analysis">Data analysis</option>
              <option value="administrative">Administrative work</option>
              <option value="general">General operations</option>
            </select>
          </label>

          <label className="field">
            <span>Priority</span>
            <select name="priority" defaultValue="normal">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea name="description" defaultValue="Organize the attached PDF and CSV files into a clean summary, identify duplicates, and produce a concise final file structure for follow-up." required />
        </label>

        <label className="field">
          <span>Instructions</span>
          <textarea name="instructions" defaultValue="Review the files, standardize naming, flag issues, and produce a simple workflow summary with clear deliverables." />
        </label>

        <label className="field">
          <span>Relevant files / references</span>
          <textarea name="referenceUrls" defaultValue="invoice.pdf, transactions.csv, folder-structure-summary.md" />
        </label>

        <label className="field">
          <span>Expected deliverables</span>
          <textarea name="expectedDeliverables" defaultValue="cleaned-file-list.md, organized-folder-plan.md" />
        </label>

        <div className="form-actions">
          <button type="submit" className="secondary-button">Create assignment</button>
        </div>
      </form>
    </div>
  );
}
