import { sendEmployeeChatMessage } from "@/lib/employee-workspace";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const result = await sendEmployeeChatMessage({
    employeeId: id,
    content: body.content,
    sender: body.sender ?? "company",
    userId: body.userId ?? null,
  });

  return Response.json(result);
}
