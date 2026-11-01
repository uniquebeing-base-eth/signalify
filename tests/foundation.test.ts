import { describe, expect, it } from "vitest";

import { createEmployee, ensureDefaultWorkspace, ensureSeedUser } from "@/lib/agent-factory";
import { executeEmployeeTask } from "@/lib/agent-runtime";
import { AntseedProvider, fallbackModelCatalogue } from "@/lib/model-gateway";
import { createOAuthState, validateOAuthState } from "@/lib/oauth";
import { createTask } from "@/lib/tasks";

describe("Signalify foundation", () => {
  it("keeps the Antseed fallback model catalog available without runtime secrets", async () => {
    const provider = new AntseedProvider();
    const models = await provider.listModels();

    expect(models.length).toBeGreaterThan(0);
    expect(models[0].provider).toBe("antseed");
    expect(fallbackModelCatalogue[0].provider).toBe("antseed");
  });

  it("creates and validates OAuth state values securely", () => {
    const state = createOAuthState();
    expect(validateOAuthState(state, state)).toBe(true);
    expect(validateOAuthState(state, "different-state")).toBe(false);
  });

  it("tracks model metadata in a provider-independent shape", async () => {
    const provider = new AntseedProvider();
    const model = (await provider.listModels())[0];

    expect(model).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      provider: "antseed",
    });
  });

  it("executes a task assigned to an employee", async () => {
    const workspace = await ensureDefaultWorkspace();
    const user = await ensureSeedUser();
    const employee = await createEmployee({
      name: "Task Runner",
      title: "Operations Analyst",
      profession: "Data Analyst",
      specialization: "Executive reporting",
      description: "Runs operational tasks",
      avatar: "📊",
      modelId: "z-ai/glm-5.3-flash",
      modelName: "z-ai/glm-5.3-flash",
      instructions: "Respond clearly and concisely.",
      workspaceId: workspace.id,
      toolIds: [],
    });

    const task = await createTask({
      workspaceId: workspace.id,
      employeeId: employee.id,
      createdByUserId: user.id,
      title: "Summarize results",
      description: "Summarize the latest AI tooling trends in one sentence.",
      priority: "normal",
      status: "queued",
    });

    const result = await executeEmployeeTask(task.id);

    expect(result.status).toBe("completed");
    expect(result.content).toBeTruthy();
  });
});
