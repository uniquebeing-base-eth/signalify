import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type MemoryCategory = "identity" | "professional" | "employer" | "task" | "learning";

export async function saveEmployeeMemory({
  employeeId,
  workspaceId,
  category,
  title,
  content,
  metadata,
}: {
  employeeId: string;
  workspaceId: string;
  category: MemoryCategory;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.employeeMemory.create({
    data: {
      employeeId,
      workspaceId,
      category,
      title,
      content,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getEmployeeMemory(employeeId: string, workspaceId: string, category?: MemoryCategory) {
  return prisma.employeeMemory.findMany({
    where: {
      employeeId,
      workspaceId,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function assertWorkspaceIsolation(workspaceId: string, employeeId: string) {
  const memory = await prisma.employeeMemory.findFirst({
    where: { employeeId, workspaceId },
  });

  return Boolean(memory);
}
