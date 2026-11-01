import { describe, expect, it } from "vitest";

import { createEmployee, ensureDefaultWorkspace, ensureSeedUser } from "@/lib/agent-factory";
import { executeEmployeeTask } from "@/lib/agent-runtime";
import { AntseedProvider, fallbackModelCatalogue } from "@/lib/model-gateway";
import { createOAuthState, validateOAuthState } from "@/lib/oauth";
import { prisma } from "@/lib/prisma";
import { approveTask, createTask } from "@/lib/tasks";

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

  it("creates assignment-style tasks with richer metadata", async () => {
    const workspace = await ensureDefaultWorkspace();
    const user = await ensureSeedUser();

    const task = await createTask({
      workspaceId: workspace.id,
      createdByUserId: user.id,
      title: "Partnership proposal",
      description: "Review company profile and draft a proposal.",
      instructions: "Review the attachment and draft the proposal in a concise executive style.",
      category: "research",
      referenceUrls: ["https://example.com/profile"],
      deliverables: ["proposal.md", "email-draft.md"],
      priority: "high",
      status: "pending",
    });

    expect(task.category).toBe("research");
    expect(task.instructions).toContain("proposal");
    expect(task.referenceUrls).toEqual(["https://example.com/profile"]);
    expect(task.expectedDeliverables).toEqual(["proposal.md", "email-draft.md"]);
  });

  it("records a visible execution step when a task runs", async () => {
    const workspace = await ensureDefaultWorkspace();
    const user = await ensureSeedUser();
    const employee = await createEmployee({
      name: "Process Tracker",
      title: "Operations Analyst",
      profession: "Document Organizer",
      specialization: "File operations",
      description: "Tracks task runs and organizes file workflows",
      avatar: "📁",
      modelId: "z-ai/glm-5.3-flash",
      modelName: "z-ai/glm-5.3-flash",
      instructions: "Keep notes concise.",
      workspaceId: workspace.id,
      toolIds: [],
    });

    const task = await createTask({
      workspaceId: workspace.id,
      employeeId: employee.id,
      createdByUserId: user.id,
      title: "Organize CSV and PDF set",
      description: "Review the provided PDF and CSV files and produce a clean, organized summary.",
      priority: "normal",
      status: "queued",
    });

    await executeEmployeeTask(task.id);

    const persistedTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: { steps: true },
    });

    expect(persistedTask?.status).toBe("completed");
    expect(persistedTask?.steps.some((step) => step.status === "running" || step.status === "completed")).toBe(true);
  });

  it("holds approval-required tasks for human review before final completion", async () => {
    const workspace = await ensureDefaultWorkspace();
    const user = await ensureSeedUser();
    const employee = await createEmployee({
      name: "Approver",
      title: "Operations Lead",
      profession: "Document Manager",
      specialization: "Approval workflows",
      description: "Reviews work before final delivery",
      avatar: "✅",
      modelId: "z-ai/glm-5.3-flash",
      modelName: "z-ai/glm-5.3-flash",
      instructions: "Prepare concise outputs for review.",
      workspaceId: workspace.id,
      toolIds: [],
    });

    const task = await createTask({
      workspaceId: workspace.id,
      employeeId: employee.id,
      createdByUserId: user.id,
      title: "Review customer files",
      description: "Organize and summarize the latest customer file exports.",
      priority: "high",
      status: "queued",
      approvalRequired: true,
    });

    const result = await executeEmployeeTask(task.id);
    expect(result.status).toBe("pending_approval");

    const approved = await approveTask(task.id, "Approved after verification");
    expect(approved.status).toBe("completed");
    expect(approved.finalResult).toContain("Approved after verification");
  });
});
