import { NextResponse } from "next/server";

import { executeEmployeeTask } from "@/lib/agent-runtime";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await executeEmployeeTask(id);
    return NextResponse.json({ success: true, task: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Task execution failed",
      },
      { status: 400 },
    );
  }
}
