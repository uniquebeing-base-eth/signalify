"use client";

import { useEffect, useMemo, useState } from "react";

type TaskStep = {
  id: string;
  taskId: string;
  stepNumber: number;
  status: string;
  details: string | null;
  createdAt: string | Date;
};

type TaskStatusState = {
  status: string;
  steps: TaskStep[];
  finalResult?: string | null;
};

export function TaskLiveMonitor({
  taskId,
  initialStatus,
  initialSteps,
}: {
  taskId: string;
  initialStatus: string;
  initialSteps: TaskStep[];
}) {
  const [status, setStatus] = useState(initialStatus);
  const [steps, setSteps] = useState<TaskStep[]>(initialSteps);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data.task) {
          setStatus(data.task.status);
          setSteps(data.task.steps ?? []);
        }
      } catch {
        // Ignore transient polling failures.
      }
    };

    const timer = setInterval(() => {
      setLoading(true);
      void poll().finally(() => setLoading(false));
    }, 3000);

    void poll();

    return () => clearInterval(timer);
  }, [taskId]);

  const progress = useMemo(() => {
    if (status === "completed") {
      return 100;
    }

    if (status === "pending_approval") {
      return 85;
    }

    if (status === "failed") {
      return 100;
    }

    if (status === "running") {
      return 60;
    }

    if (steps.length > 0) {
      return Math.min(75, 25 + steps.length * 20);
    }

    return 20;
  }, [status, steps.length]);

  return (
    <section className="execution-panel live-monitor">
      <div className="live-monitor-header">
        <div>
          <h2>Execution timeline</h2>
          <small>{loading ? "Refreshing live updates…" : "Live status"}</small>
        </div>
        <button type="button" className="secondary-button small-button" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>

      <div className="progress-wrap" aria-label="task progress">
        <div className="progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}%</strong>
      </div>

      {open && (
        <ul className="timeline-list">
          {steps.length === 0 ? (
            <li className="timeline-item empty-state">
              <span className="timeline-status">Queued</span>
              <div>
                <strong>Task queued and waiting for execution.</strong>
                <small>Start the run to see the worker process.</small>
              </div>
            </li>
          ) : (
            steps.map((step) => (
              <li key={step.id} className="timeline-item">
                <span className="timeline-status">{step.status}</span>
                <div>
                  <strong>{step.details ?? `Step ${step.stepNumber}`}</strong>
                  <small>{new Date(step.createdAt).toLocaleString()}</small>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
