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
  const contentType = request.headers.get("content-type") ?? "";
  let body: Record<string, any> = {};

  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries());
  }

  const normalizeStringList = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(/\n|,/) 
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const workspace = await prisma.workspace.findFirst({ where: { slug: "acme-workspace" } });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const task = await createTask({
    workspaceId: workspace.id,
    employeeId: body.employeeId ? String(body.employeeId) : null,
    createdByUserId: (await prisma.user.findFirst({ where: { email: "admin@signalify.ai" } }))?.id ?? null,
    title: String(body.title ?? "New task"),
    description: String(body.description ?? "Task created from Signalify workspace"),
    category: String(body.category ?? "general"),
    instructions: body.instructions ? String(body.instructions) : null,
    referenceUrls: normalizeStringList(body.referenceUrls),
    expectedDeliverables: normalizeStringList(body.expectedDeliverables ?? body.deliverables),
    metadata: {
      source: "assignment-form",
      ...(body.metadata ?? {}),
    },
    priority: String(body.priority ?? "normal"),
    deadline: body.deadline ?? null,
    status: String(body.status ?? "queued"),
    approvalRequired: Boolean(body.approvalRequired),
  });

  return NextResponse.json({ success: true, task });
}
