import Link from "next/link";

import { TaskApprovalButton } from "@/components/task-approval-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      employee: true,
      steps: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    return (
      <div className="page-header">
        <div className="panel wide-panel">
          <h1>Task not found</h1>
          <Link href="/tasks" className="secondary-button">Back to tasks</Link>
        </div>
      </div>
    );
  }

  const deliverables = Array.isArray(task.expectedDeliverables)
    ? task.expectedDeliverables
    : Array.isArray(task.expectedDeliverables ? JSON.parse(String(task.expectedDeliverables)) : null)
      ? JSON.parse(String(task.expectedDeliverables))
      : [];

  const referenceUrls = Array.isArray(task.referenceUrls)
    ? task.referenceUrls
    : Array.isArray(task.referenceUrls ? JSON.parse(String(task.referenceUrls)) : null)
      ? JSON.parse(String(task.referenceUrls))
      : [];

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Execution record</p>
          <h1>{task.title}</h1>
        </div>
        <Link href="/tasks" className="secondary-button">Back to tasks</Link>
      </div>

      <div className="panel wide-panel" style={{ display: "grid", gap: 18 }}>
        <div className="form-grid">
          <div className="field"><span>Status</span><strong>{task.status}</strong></div>
          <div className="field"><span>Priority</span><strong>{task.priority}</strong></div>
          <div className="field"><span>Category</span><strong>{task.category ?? "general"}</strong></div>
          <div className="field"><span>Employee</span><strong>{task.employee?.name ?? "Unassigned"}</strong></div>
        </div>

        <div className="field">
          <span>Description</span>
          <p>{task.description}</p>
        </div>

        {task.instructions && (
          <div className="field">
            <span>Instructions</span>
            <p>{task.instructions}</p>
          </div>
        )}

        {referenceUrls.length > 0 && (
          <div className="field">
            <span>References</span>
            <ul>
              {referenceUrls.map((item: string) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}

        {deliverables.length > 0 && (
          <div className="field">
            <span>Deliverables</span>
            <ul>
              {deliverables.map((item: string) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}

        {task.finalResult && (
          <div className="field">
            <span>Result</span>
            <p>{task.finalResult}</p>
          </div>
        )}

        {task.approvalRequired && task.status === "pending_approval" && (
          <TaskApprovalButton taskId={task.id} taskTitle={task.title} />
        )}

        <div className="field">
          <span>Execution steps</span>
          <ul>
            {task.steps.length === 0 ? <li>No steps recorded yet.</li> : task.steps.map((step) => (
              <li key={step.id}><strong>{step.status}</strong> — {step.details ?? "No detail"}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
