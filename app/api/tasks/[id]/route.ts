import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      employee: true,
      steps: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      employee: task.employee ? { id: task.employee.id, name: task.employee.name } : null,
      finalResult: task.finalResult,
      steps: task.steps.map((step) => ({
        id: step.id,
        taskId: step.taskId,
        stepNumber: step.stepNumber,
        status: step.status,
        details: step.details,
        createdAt: step.createdAt.toISOString(),
      })),
    },
  });
}
