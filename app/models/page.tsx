import { getModelCatalog } from "@/lib/data";
import ModelPanel from "@/components/model-panel";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const catalog = await getModelCatalog();

  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Model infrastructure</p>
          <h1>Models & Providers</h1>
        </div>
      </div>

      <div className="panel wide-panel" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <h2>Provider status</h2>
          <span className="status-pill">{catalog.provider?.isEnabled ? "connected" : "offline"}</span>
        </div>
        <div className="stack-list">
          <div className="stat-row">
            <span>Provider</span>
            <strong>{catalog.provider?.name ?? "antseed"}</strong>
          </div>
          <div className="stat-row">
            <span>Base URL</span>
            <strong>{catalog.provider?.baseUrl ?? "https://api.antseed.example.com"}</strong>
          </div>
        </div>
      </div>

      <ModelPanel />
    </div>
  );
}
