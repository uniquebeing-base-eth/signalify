import AgentFactoryForm from "@/components/agent-factory-form";

export const dynamic = "force-dynamic";

export default function AgentFactoryPage() {
  return (
    <div className="page-header">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Factory workflow</p>
          <h1>Agent Factory</h1>
        </div>
      </div>

      <AgentFactoryForm />
    </div>
  );
}
