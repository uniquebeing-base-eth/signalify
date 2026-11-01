import { prisma } from "@/lib/prisma";

export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  requiredPermissions: string[];
  approvalRequired: boolean;
  adapterName: string;
};

export const toolCatalog: ToolDefinition[] = [
  {
    id: "web-research",
    name: "web-research",
    description: "Search the web for public information relevant to a task.",
    category: "research",
    version: "1.0.0",
    requiredPermissions: ["research:read"],
    approvalRequired: false,
    adapterName: "browser-research",
  },
  {
    id: "document-creator",
    name: "document-creator",
    description: "Create polished reports and internal documents.",
    category: "documents",
    version: "1.0.0",
    requiredPermissions: ["documents:write"],
    approvalRequired: false,
    adapterName: "document-adapter",
  },
  {
    id: "spreadsheet-processor",
    name: "spreadsheet-processor",
    description: "Process CSV and spreadsheet inputs for analysis.",
    category: "data",
    version: "1.0.0",
    requiredPermissions: ["data:analyse"],
    approvalRequired: false,
    adapterName: "spreadsheet-adapter",
  },
  {
    id: "email-draft",
    name: "email-draft",
    description: "Draft polished email content for approval before sending.",
    category: "communication",
    version: "1.0.0",
    requiredPermissions: ["email:write"],
    approvalRequired: true,
    adapterName: "email-adapter",
  },
];

export async function registeredTools() {
  try {
    const tools = await prisma.registeredTool.findMany({
      orderBy: { createdAt: "asc" },
    });

    return tools.length > 0
      ? tools.map((tool) => ({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          version: tool.version,
          requiredPermissions: Array.isArray(tool.requiredPermissions)
            ? tool.requiredPermissions
            : [],
        }))
      : toolCatalog;
  } catch {
    return toolCatalog;
  }
}

export async function ensureToolRegistry() {
  try {
    await Promise.all(
      toolCatalog.map(async (tool: ToolDefinition) => {
        await prisma.registeredTool.upsert({
          where: { name: tool.name },
          update: {},
          create: {
            name: tool.name,
            category: tool.category,
            description: tool.description,
            version: tool.version,
            inputSchema: { type: "object", properties: {} },
            outputSchema: { type: "object", properties: {} },
            requiredPermissions: tool.requiredPermissions,
            riskLevel: "low",
            approvalRequired: tool.approvalRequired,
            adapterName: tool.adapterName,
          },
        });
      }),
    );
  } catch {
    return;
  }
}

export async function isToolAuthorized(employeeId: string, toolName: string) {
  const tool = await prisma.registeredTool.findUnique({
    where: { name: toolName },
  });

  if (!tool) {
    return false;
  }

  const permission = await prisma.employeeToolPermission.findUnique({
    where: {
      employeeId_toolId: {
        employeeId,
        toolId: tool.id,
      },
    },
  });

  return Boolean(permission?.allowed);
}

export async function executeTool({
  employeeId,
  toolName,
  params,
}: {
  employeeId: string;
  toolName: string;
  params: Record<string, unknown>;
}) {
  const isAllowed = await isToolAuthorized(employeeId, toolName);

  if (!isAllowed) {
    throw new Error("Tool execution denied: employee is not authorized");
  }

  const tool = toolCatalog.find((item) => item.name === toolName) ?? toolCatalog[0];

  if (tool.approvalRequired) {
    return {
      status: "awaiting_approval",
      tool: tool.name,
      payload: params,
      message: "This action requires approval before external execution.",
    };
  }

  return {
    status: "success",
    tool: tool.name,
    payload: params,
    result: `Executed ${tool.name} successfully in Signalify sandbox mode.`,
  };
}
