"use client";

import { useState } from "react";

export function TaskApprovalButton({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const [status, setStatus] = useState("Approve delivery");
  const [pending, setPending] = useState(false);

  async function handleApprove() {
    setPending(true);
    setStatus("Approving...");

    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: `Approved after review for ${taskTitle}` }),
      });

      const data = await response.json();
      setStatus(data.success ? "Approved" : `Approval failed: ${data.error ?? "unknown error"}`);
    } catch {
      setStatus("Approval failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button type="button" onClick={handleApprove} disabled={pending} className="secondary-button">
        {pending ? "Approving..." : status}
      </button>
    </div>
  );
}
