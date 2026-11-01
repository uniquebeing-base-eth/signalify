import Link from "next/link";

import { TaskApprovalButton } from "@/components/task-approval-button";
import { TaskLiveMonitor } from "@/components/task-live-monitor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatResultBlocks(text: string) {
  const normalized = text.replace(/\r/g, "").trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const listItems = block
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /^[-*•]\s+/.test(line));

      if (listItems.length > 0) {
        return {
          type: "list" as const,
          items: listItems.map((line) => line.replace(/^[-*•]\s+/, "")),
        };
      }

      return {
        type: "text" as const,
        value: block,
      };
    });
}

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

  const resultBlocks = task.finalResult ? formatResultBlocks(task.finalResult) : [];

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Execution record</p>
          <h1>{task.title}</h1>
        </div>
        <Link href="/tasks" className="secondary-button">Back to tasks</Link>
      </div>

      <div className="panel wide-panel workflow-shell">
        <div className="meta-grid">
          <div className="meta-card"><span>Status</span><strong className={`status-chip status-${task.status}`}>{task.status}</strong></div>
          <div className="meta-card"><span>Priority</span><strong>{task.priority}</strong></div>
          <div className="meta-card"><span>Category</span><strong>{task.category ?? "general"}</strong></div>
          <div className="meta-card"><span>Employee</span><strong>{task.employee?.name ?? "Unassigned"}</strong></div>
        </div>

        <div className="detail-grid">
          <section className="result-panel">
            <h2>Input summary</h2>
            <div className="summary-card">
              <h3>Objective</h3>
              <p>{task.description}</p>
            </div>

            {task.instructions && (
              <div className="summary-card">
                <h3>Instructions</h3>
                <p>{task.instructions}</p>
              </div>
            )}

            {referenceUrls.length > 0 && (
              <div className="info-block">
                <h3>References</h3>
                <ul>
                  {referenceUrls.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}

            {deliverables.length > 0 && (
              <div className="info-block">
                <h3>Deliverables</h3>
                <ul>
                  {deliverables.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
          </section>

          <section className="result-panel">
            <h2>Clear output</h2>
            {resultBlocks.length > 0 ? (
              <div className="result-stack">
                {resultBlocks.map((block, index) => (
                  <div key={`${block.type}-${index}`} className="result-block">
                    {block.type === "list" ? (
                      <ul>
                        {block.items.map((item: string) => <li key={item}>{item}</li>)}
                      </ul>
                    ) : (
                      <p>{block.value}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-copy">No final output yet. The task is still running or waiting on review.</p>
            )}

            {task.approvalRequired && task.status === "pending_approval" && (
              <div className="approval-box">
                <TaskApprovalButton taskId={task.id} taskTitle={task.title} />
              </div>
            )}
          </section>
        </div>

        <TaskLiveMonitor taskId={task.id} initialStatus={task.status} initialSteps={task.steps} />
      </div>
    </div>
  );
}
