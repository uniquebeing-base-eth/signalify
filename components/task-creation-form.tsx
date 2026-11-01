"use client";

import { useState } from "react";

export function TaskCreationForm({ employees }: { employees: Array<{ id: string; name: string; profession: string }> }) {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Creating assignment...");

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      category: String(form.get("category") ?? "general"),
      instructions: String(form.get("instructions") ?? ""),
      employeeId: form.get("employeeId") ? String(form.get("employeeId")) : null,
      priority: String(form.get("priority") ?? "normal"),
      referenceUrls: String(form.get("referenceUrls") ?? "")
        .split(/\n|,/) 
        .map((value) => value.trim())
        .filter(Boolean),
      expectedDeliverables: String(form.get("expectedDeliverables") ?? "")
        .split(/\n|,/) 
        .map((value) => value.trim())
        .filter(Boolean),
      status: "queued",
    };

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus(`Failed: ${data.error ?? "unknown error"}`);
        return;
      }

      setStatus("Assignment created successfully.");
      window.location.href = "/tasks";
    } catch {
      setStatus("Failed to create assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel wide-panel task-form-shell">
      <div className="task-form-section">
        <h2>1. Brief</h2>
        <div className="form-grid">
          <label className="field">
            <span>Assignment title</span>
            <input name="title" defaultValue="Organize PDF and CSV workflow" required />
          </label>

          <label className="field">
            <span>Assigned employee</span>
            <select name="employeeId" defaultValue="">
              <option value="">Unassigned</option>
              {employees.map((employee) => (
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
      </div>

      <div className="task-form-section">
        <h2>2. Job details</h2>
        <label className="field">
          <span>Objective</span>
          <textarea name="description" defaultValue="Organize the attached PDF and CSV files into a clean summary, identify duplicates, and produce a concise final file structure for follow-up." required />
        </label>

        <label className="field">
          <span>Instructions</span>
          <textarea name="instructions" defaultValue="Review the files, standardize naming, flag issues, and produce a simple workflow summary with clear deliverables." />
        </label>
      </div>

      <div className="task-form-section">
        <h2>3. Inputs and output</h2>
        <label className="field">
          <span>Relevant files / references</span>
          <textarea name="referenceUrls" defaultValue="invoice.pdf, transactions.csv, folder-structure-summary.md" />
        </label>

        <label className="field">
          <span>Expected deliverables</span>
          <textarea name="expectedDeliverables" defaultValue="cleaned-file-list.md, organized-folder-plan.md" />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="secondary-button" disabled={submitting}>
          {submitting ? "Creating..." : "Create assignment"}
        </button>
      </div>

      {status && <p className="status-pill">{status}</p>}
    </form>
  );
}
