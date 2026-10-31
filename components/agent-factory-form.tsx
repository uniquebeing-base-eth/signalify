"use client";

import { FormEvent, useState } from "react";

export default function AgentFactoryForm() {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      title: form.get("title"),
      profession: form.get("profession"),
      specialization: form.get("specialization"),
      description: form.get("description"),
      avatar: form.get("avatar"),
      modelId: form.get("modelId"),
      modelName: form.get("modelName"),
      instructions: form.get("instructions"),
      toolIds: ["web-research", "document-creator"],
    };

    setStatus("Creating employee...");

    const response = await fetch("/api/agent-factory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setStatus(data.success ? `Employee created: ${data.employee.name}` : "Creation failed");
  }

  return (
    <form onSubmit={handleSubmit} className="panel wide-panel">
      <div className="section-header">
        <h2>Create native employee</h2>
        <span className="badge">Signalify identity</span>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Employee name</span>
          <input name="name" placeholder="Sarah" defaultValue="Sarah" required />
        </label>
        <label className="field">
          <span>Professional title</span>
          <input name="title" placeholder="Executive Assistant" defaultValue="Executive Assistant" required />
        </label>
        <label className="field">
          <span>Profession</span>
          <select name="profession" defaultValue="Executive Assistant">
            <option>Executive Assistant</option>
            <option>Data Analyst</option>
          </select>
        </label>
        <label className="field">
          <span>Specialization</span>
          <input name="specialization" placeholder="Leadership support" defaultValue="Leadership support" />
        </label>
        <label className="field">
          <span>Avatar</span>
          <input name="avatar" placeholder="👩‍💼" defaultValue="👩‍💼" />
        </label>
        <label className="field">
          <span>Model ID</span>
          <input name="modelId" placeholder="antseed-gpt-4.1-mini" defaultValue="antseed-gpt-4.1-mini" required />
        </label>
        <label className="field">
          <span>Model name</span>
          <input name="modelName" placeholder="GPT-4.1 Mini" defaultValue="GPT-4.1 Mini" required />
        </label>
      </div>

      <label className="field">
        <span>Professional description</span>
        <textarea name="description" defaultValue="Coordinates executive communications, research, documentation and scheduling workflows." />
      </label>

      <label className="field">
        <span>Instructions</span>
        <textarea
          name="instructions"
          defaultValue="Support leadership with carefully organized information, concise notes, thorough research and professional communication."
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="secondary-button">
          Create employee
        </button>
      </div>

      {status && <p className="status-pill" style={{ marginTop: 16 }}>{status}</p>}
    </form>
  );
}
