"use client";

import { useState } from "react";

export default function NewTaskPage() {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      category: String(form.get("category") ?? "general"),
      instructions: String(form.get("instructions") ?? ""),
      priority: String(form.get("priority") ?? "normal"),
      status: String(form.get("status") ?? "pending"),
      employeeId: form.get("employeeId") ? String(form.get("employeeId")) : null,
      referenceUrls: String(form.get("referenceUrls") ?? "")
        .split(/\n|,/) 
        .map((value) => value.trim())
        .filter(Boolean),
      expectedDeliverables: String(form.get("expectedDeliverables") ?? "")
        .split(/\n|,/) 
        .map((value) => value.trim())
        .filter(Boolean),
    };

    setStatus("Creating assignment...");

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setStatus(data.success ? `Assignment created: ${data.task.title}` : `Failed: ${data.error ?? "unknown error"}`);
  }

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Work intake</p>
          <h1>New assignment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel wide-panel" style={{ display: "grid", gap: 16 }}>
        <div className="form-grid">
          <label className="field">
            <span>Assignment title</span>
            <input name="title" defaultValue="Partnership proposal" required />
          </label>
          <label className="field">
            <span>Category</span>
            <select name="category" defaultValue="research">
              <option value="research">Research</option>
              <option value="document">Document creation</option>
              <option value="analysis">Data analysis</option>
              <option value="administrative">Administrative work</option>
              <option value="general">General operations</option>
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select name="priority" defaultValue="high">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue="pending">
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="queued">Queued</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea name="description" defaultValue="Review the company profile and draft a concise proposal for the partnership." required />
        </label>

        <label className="field">
          <span>Instructions</span>
          <textarea name="instructions" defaultValue="Read the reference material, extract the key business context, and produce a concise proposal draft with clear recommendations." />
        </label>

        <label className="field">
          <span>Reference URLs</span>
          <textarea name="referenceUrls" defaultValue="https://example.com/company-profile" />
        </label>

        <label className="field">
          <span>Expected deliverables</span>
          <textarea name="expectedDeliverables" defaultValue="proposal.md, email-draft.md" />
        </label>

        <div className="form-actions">
          <button type="submit" className="secondary-button">Create assignment</button>
        </div>

        {status && <p className="status-pill">{status}</p>}
      </form>
    </div>
  );
}
