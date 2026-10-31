import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createTask } from "@/lib/tasks";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      employee: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
      employeeName: task.employee?.name ?? "Unassigned",
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({ where: { slug: "acme-workspace" } });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const task = await createTask({
    workspaceId: workspace.id,
    employeeId: body.employeeId ?? null,
    createdByUserId: (await prisma.user.findFirst({ where: { email: "admin@signalify.ai" } }))?.id ?? null,
    title: body.title ?? "New task",
    description: body.description ?? "Task created from Signalify workspace",
    priority: body.priority ?? "normal",
    status: body.status ?? "queued",
    approvalRequired: Boolean(body.approvalRequired),
  });

  return NextResponse.json({ success: true, task });
}
