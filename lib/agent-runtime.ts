import { getEmployeeById } from "@/lib/agent-factory";
import { getEmployeeMemory } from "@/lib/memory";
import { AntseedProvider } from "@/lib/model-gateway";
import { prisma } from "@/lib/prisma";
import { isToolAuthorized } from "@/lib/tools";
import { recordTaskUsage, updateTaskStatus } from "@/lib/tasks";

export async function executeEmployeeTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      employee: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (!task.employeeId) {
    throw new Error("Task is not assigned to an employee");
  }

  const employee = await getEmployeeById(task.employeeId);
  const model = employee?.model ?? null;
  const memory = task.employeeId
    ? await getEmployeeMemory(task.employeeId, task.workspaceId, "professional")
    : [];

  const provider = new AntseedProvider();
  const startedAt = Date.now();
  const response = await provider.generateResponse({
    prompt: task.description,
    context: memory.map((entry: { content: string }) => entry.content).slice(0, 6),
  });
  const durationMs = Date.now() - startedAt;

  const toolName = "web-research";
  const toolPermission = employee ? await isToolAuthorized(employee.id, toolName) : false;

  if (!toolPermission && task.description.toLowerCase().includes("research")) {
    await updateTaskStatus(task.id, "failed", undefined, "Research tool permission denied");
    return {
      taskId: task.id,
      status: "failed",
      content: "The employee is not authorized for the required research tool.",
    };
  }

  await updateTaskStatus(task.id, "completed", String(response.content ?? "Task completed"));

  await recordTaskUsage({
    taskId: task.id,
    employeeId: task.employeeId,
    provider: "antseed",
    model: model?.modelId ?? process.env.ANTSEED_DEFAULT_MODEL ?? "antseed-gpt-4.1-mini",
    inputTokens: Number((response.usage as Record<string, unknown>)?.input_tokens ?? 0),
    outputTokens: Number((response.usage as Record<string, unknown>)?.output_tokens ?? 0),
    cost: 0,
    durationMs,
    success: !(response as { error?: string }).error,
    requestId: (response as { id?: string }).id,
  });

  return {
    taskId: task.id,
    status: "completed",
    content: response.content,
  };
}
