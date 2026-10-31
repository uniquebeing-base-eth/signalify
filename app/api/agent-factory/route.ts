import { NextResponse } from "next/server";

import { createEmployee, ensureDefaultWorkspace } from "@/lib/agent-factory";

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await ensureDefaultWorkspace();

  const employee = await createEmployee({
    name: body.name,
    title: body.title,
    profession: body.profession,
    specialization: body.specialization,
    description: body.description,
    avatar: body.avatar,
    modelId: body.modelId,
    modelName: body.modelName,
    instructions: body.instructions,
    workspaceId: body.workspaceId ?? workspace.id,
    toolIds: body.toolIds ?? [],
  });

  return NextResponse.json({ success: true, employee });
}
