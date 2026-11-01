"use client";

import { useState } from "react";

export function TaskExecutionButton({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const [status, setStatus] = useState<string>("Run task");
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    setStatus("Running...");

    try {
      const response = await fetch(`/api/tasks/${taskId}/execute`, {
        method: "POST",
      });

      const data = await response.json();
      setStatus(data.success ? `Completed: ${taskTitle}` : `Failed: ${data.error ?? "unknown error"}`);
    } catch {
      setStatus("Execution failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button type="button" onClick={handleRun} disabled={running} className="secondary-button">
        {running ? "Running..." : "Run task"}
      </button>
      <small>{status}</small>
    </div>
  );
}
