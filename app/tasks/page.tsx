import { prisma } from "@/lib/prisma";
import { TaskExecutionButton } from "@/components/task-execution-button";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Execution layer</p>
          <h1>Tasks & Work</h1>
        </div>
      </div>

      <div className="panel wide-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task: any) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.employee?.name ?? "Unassigned"}</td>
                <td><span className="status-pill">{task.status}</span></td>
                <td>{task.priority}</td>
                <td>
                  {task.employee ? (
                    <TaskExecutionButton taskId={task.id} taskTitle={task.title} />
                  ) : (
                    <span>Assign employee</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
