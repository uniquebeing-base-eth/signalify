import { prisma } from "@/lib/prisma";
import { executeEmployeeTask } from "@/lib/agent-runtime";
import { saveEmployeeMemory } from "@/lib/memory";
import { createTask } from "@/lib/tasks";

export type EmployeeChatSender = "company" | "employee" | "system";

export async function getEmployeeWorkspace(employeeId: string) {
  const employee = await prisma.aIEmployee.findUnique({
    where: { id: employeeId },
    include: {
      model: true,
      identity: true,
      instructions: true,
      workspace: true,
    },
  });

  if (!employee) {
    return {
      employee: null,
      conversations: [],
      tasks: [],
      memory: [],
    };
  }

  const [conversations, tasks, memory] = await Promise.all([
    prisma.employeeConversation.findMany({
      where: { employeeId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.employeeMemory.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
  ]);

  const instructionsSummary = Array.isArray(employee.instructions?.outputExpectations)
    ? employee.instructions.outputExpectations.filter((value): value is string => typeof value === "string").join("; ")
    : employee.instructions?.role ?? "General operations";

  return {
    employee: {
      ...employee,
      modelName: employee.model?.modelName ?? "Unknown model",
      email: employee.identity?.emailIdentity,
      instructionsSummary,
    },
    conversations,
    tasks,
    memory,
  };
}

export async function sendEmployeeChatMessage({
  employeeId,
  content,
  sender = "company",
  userId,
}: {
  employeeId: string;
  content: string;
  sender?: EmployeeChatSender;
  userId?: string | null;
}) {
  if (!content.trim()) {
    throw new Error("Message content cannot be empty.");
  }

  const employee = await prisma.aIEmployee.findUnique({
    where: { id: employeeId },
    include: { workspace: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const conversation =
    (await prisma.employeeConversation.findFirst({
      where: { employeeId },
      orderBy: { updatedAt: "desc" },
    })) ??
    (await prisma.employeeConversation.create({
      data: {
        employeeId,
        title: `${employee.name} workspace`,
        status: "active",
      },
    }));

  const companyMessage = await prisma.employeeConversationMessage.create({
    data: {
      conversationId: conversation.id,
      employeeId,
      sender,
      content: content.trim(),
      metadata: {
        userId: userId ?? null,
      },
    },
  });

  const messages = [companyMessage];

  if (sender === "company") {
    const taskTitle = content.length > 72 ? `${content.slice(0, 69)}...` : content;

    const task = await createTask({
      workspaceId: employee.workspaceId,
      employeeId: employee.id,
      createdByUserId: userId ?? null,
      title: taskTitle,
      description: content,
      instructions: `Execute this instruction in the employee's workspace and return an operational result.`,
      category: "conversation",
      priority: "normal",
      status: "queued",
    });

    const taskResult = await executeEmployeeTask(task.id);
    const employeeResponse = taskResult.content || `Task ${task.id} moved to status ${taskResult.status}.`;

    const answer = await prisma.employeeConversationMessage.create({
      data: {
        conversationId: conversation.id,
        employeeId,
        sender: "employee",
        content: employeeResponse,
        metadata: {
          taskId: task.id,
          taskStatus: taskResult.status,
        },
      },
    });

    messages.push(answer);

    await saveEmployeeMemory({
      employeeId: employee.id,
      workspaceId: employee.workspaceId,
      category: "professional",
      title: `Direct instruction: ${taskTitle}`,
      content: `${content}\n\nResult: ${employeeResponse}`,
      metadata: {
        source: "conversation",
        taskId: task.id,
        status: taskResult.status,
      },
    });

    return {
      conversation,
      task,
      messages,
    };
  }

  return {
    conversation,
    task: null,
    messages,
  };
}
