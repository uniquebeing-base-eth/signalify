import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type TaskDraft = {
  workspaceId: string;
  employeeId?: string | null;
  createdByUserId?: string | null;
  title: string;
  description: string;
  category?: string;
  instructions?: string | null;
  referenceUrls?: string[];
  expectedDeliverables?: string[];
  deliverables?: string[];
  metadata?: Record<string, unknown>;
  priority?: string;
  deadline?: Date | string | null;
  status?: string;
  approvalRequired?: boolean;
};

export async function createTask(input: TaskDraft) {
  const workspace = await prisma.workspace.findUnique({ where: { id: input.workspaceId } });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const expectedDeliverables = input.expectedDeliverables ?? input.deliverables ?? [];

  return prisma.task.create({
    data: {
      workspaceId: input.workspaceId,
      employeeId: input.employeeId ?? null,
      createdByUserId: input.createdByUserId ?? null,
      title: input.title,
      description: input.description,
      category: input.category ?? "general",
      instructions: input.instructions ?? null,
      referenceUrls: (input.referenceUrls ?? []) as Prisma.InputJsonValue,
      expectedDeliverables: expectedDeliverables as Prisma.InputJsonValue,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      priority: input.priority ?? "normal",
      deadline: input.deadline ? new Date(input.deadline) : null,
      status: input.status ?? "queued",
      approvalRequired: Boolean(input.approvalRequired),
    },
  });
}

export async function recordTaskUsage({
  taskId,
  employeeId,
  provider,
  model,
  inputTokens,
  outputTokens,
  cachedTokens,
  cost,
  durationMs,
  success,
  requestId,
}: {
  taskId?: string | null;
  employeeId?: string | null;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedTokens?: number;
  cost?: number;
  durationMs?: number;
  success?: boolean;
  requestId?: string;
}) {
  return prisma.modelUsage.create({
    data: {
      taskId: taskId ?? null,
      employeeId: employeeId ?? null,
      provider,
      model,
      inputTokens: inputTokens ?? 0,
      outputTokens: outputTokens ?? 0,
      cachedTokens: cachedTokens ?? 0,
      cost: cost ?? 0,
      durationMs: durationMs ?? 0,
      success: success ?? true,
      requestId: requestId ?? null,
    },
  });
}

export async function createTaskStep(taskId: string, stepNumber: number, status: string, details?: string) {
  return prisma.taskStep.create({
    data: {
      taskId,
      stepNumber,
      status,
      details: details ?? null,
    },
  });
}

export async function updateTaskStatus(taskId: string, status: string, finalResult?: string, failureInfo?: string) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      finalResult: finalResult ?? undefined,
      failureInfo: failureInfo ?? undefined,
      completedAt: status === "completed" || status === "failed" ? new Date() : undefined,
    },
  });
}
