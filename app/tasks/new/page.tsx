import { TaskCreationForm } from "@/components/task-creation-form";
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

      <TaskCreationForm employees={employees} />
    </div>
  );
}
