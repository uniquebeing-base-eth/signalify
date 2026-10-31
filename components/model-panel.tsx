"use client";

import { useEffect, useState } from "react";

export default function ModelPanel() {
  const [models, setModels] = useState<Array<Record<string, unknown>>>([]);
  const [status, setStatus] = useState("checking");

  async function fetchModels() {
    const response = await fetch("/api/models");
    const data = await response.json();
    setModels(data.models ?? []);
    setStatus(data.health?.status ?? "unknown");
  }

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="panel wide-panel">
      <div className="section-header">
        <h2>Antseed model catalogue</h2>
        <button className="secondary-button" type="button" onClick={fetchModels}>
          Refresh
        </button>
      </div>

      <div className="status-pill" style={{ marginBottom: 12 }}>{status}</div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Model</th>
            <th>Provider</th>
            <th>Capabilities</th>
            <th>Context</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={String(model.id)}>
              <td>{String(model.name)}</td>
              <td>{String(model.provider)}</td>
              <td>{String((model.capabilities as Record<string, unknown>)?.toolCalling ? "tool-calling" : "chat")}</td>
              <td>{String(model.contextLength ?? "n/a")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
