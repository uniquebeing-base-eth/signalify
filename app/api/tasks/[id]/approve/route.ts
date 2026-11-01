import { NextResponse } from "next/server";

import { approveTask } from "@/lib/tasks";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const task = await approveTask(id, typeof body.note === "string" ? body.note : undefined);
    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Approval failed",
      },
      { status: 400 },
    );
  }
}
