import { getEmployeeWorkspace } from "@/lib/employee-workspace";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEmployeeWorkspace(id);

  return Response.json(result);
}
