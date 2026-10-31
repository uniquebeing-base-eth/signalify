import { prisma } from "@/lib/prisma";

export type ProfessionTemplate = {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  specializations: string[];
  recommendedTools: string[];
  defaultInstructions: string;
};

export const professionTemplates: ProfessionTemplate[] = [
  {
    id: "executive-assistant",
    name: "Executive Assistant",
    description: "Organizes information, supports leadership workflows and keeps high-value administrative operations moving.",
    responsibilities: [
      "Organizing information",
      "Preparing meeting summaries",
      "Drafting emails",
      "Managing administrative documents",
      "Researching requested information",
      "Preparing reports",
      "Supporting scheduling workflows",
    ],
    specializations: ["Leadership support", "Operations coordination", "Research support"],
    recommendedTools: ["web-research", "document-creator", "email-draft", "task-management"],
    defaultInstructions: "Support the executive with precise, organized work, concise communication and careful verification before sending follow-up material.",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Reads datasets, identifies trends, creates reports and communicates analytical findings clearly.",
    responsibilities: [
      "Reading and processing datasets",
      "Cleaning data",
      "Identifying trends",
      "Performing calculations",
      "Preparing reports",
      "Producing visualizations",
      "Explaining analytical findings",
    ],
    specializations: ["Marketing analytics", "Operations analytics", "Executive reporting"],
    recommendedTools: ["spreadsheet-processor", "document-creator", "data-visualization", "web-research"],
    defaultInstructions: "Produce structured, evidence-based analysis with clear assumptions, calculations and explanations. Validate data quality before drawing conclusions.",
  },
];

export async function ensureDefaultWorkspace() {
  return prisma.workspace.upsert({
    where: { slug: "acme-workspace" },
    update: {},
    create: {
      name: "Acme Workspace",
      slug: "acme-workspace",
      ownerId: "user_default",
    },
  });
}

export async function ensureSeedUser() {
  return prisma.user.upsert({
    where: { email: "admin@signalify.ai" },
    update: {},
    create: {
      email: "admin@signalify.ai",
      name: "Signalify Admin",
      role: "admin",
    },
  });
}

export async function listProfessions() {
  const records = await prisma.profession.findMany({
    orderBy: { createdAt: "asc" },
  });

  return records.length > 0
    ? records.map((item: { id: string; name: string; description: string; responsibilities: string[]; specializations: string[]; recommendedTools: string[]; defaultInstructions: string }) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
        specializations: Array.isArray(item.specializations) ? item.specializations : [],
        recommendedTools: Array.isArray(item.recommendedTools) ? item.recommendedTools : [],
        defaultInstructions: item.defaultInstructions,
      }))
    : professionTemplates;
}

export async function createEmployee({
  name,
  title,
  profession,
  specialization,
  description,
  avatar,
  modelId,
  modelName,
  instructions,
  workspaceId,
  toolIds,
}: {
  name: string;
  title: string;
  profession: string;
  specialization?: string;
  description?: string;
  avatar?: string;
  modelId: string;
  modelName: string;
  instructions: string;
  workspaceId: string;
  toolIds?: string[];
}) {
  const employee = await prisma.$transaction(async (tx: any) => {
    const profile = await tx.aIEmployee.create({
      data: {
        workspaceId,
        name,
        title,
        employeeId: `emp_${Math.random().toString(36).slice(2, 10)}`,
        profession,
        specialization: specialization ?? "General",
        description: description ?? "Signalify AI employee",
        avatar: avatar ?? "👩‍💼",
        status: "active",
      },
    });

    await tx.employeeIdentity.create({
      data: {
        employeeId: profile.id,
        internalEmployeeId: `sig-${profile.employeeId}`,
        emailIdentity: `${name.toLowerCase().replace(/\s+/g, ".")}@agents.signalify.ai`,
        professionalTitle: title,
        status: "active",
      },
    });

    await tx.employeeInstruction.create({
      data: {
        employeeId: profile.id,
        role: title,
        responsibilities: [profession, specialization ?? "General operations"],
        outputExpectations: ["Deliver clear, professional output", "Acknowledge assumptions"],
        procedures: ["Prioritize accuracy and safety", "Check required tool permissions"],
        communicationStyle: "Professional, concise and structured",
        boundaries: ["No unrestricted system access"],
        limitations: ["Use approved tools only"],
        escalation: ["Escalate ambiguous tasks"],
        qualityExpectations: ["Verify work before completion"],
      },
    });

    await tx.employeeModel.create({
      data: {
        employeeId: profile.id,
        provider: "antseed",
        modelId,
        modelName,
        isDefault: true,
      },
    });

    if (instructions) {
      await tx.employeeInstruction.update({
        where: { employeeId: profile.id },
        data: {
          role: title,
          outputExpectations: [instructions],
        },
      });
    }

    if (toolIds?.length) {
      const availableTools = await tx.registeredTool.findMany({
        where: {
          name: {
            in: toolIds,
          },
        },
      });

      await Promise.all(
        availableTools.map((tool: any) =>
          tx.employeeToolPermission.upsert({
            where: {
              employeeId_toolId: {
                employeeId: profile.id,
                toolId: tool.id,
              },
            },
            update: {
              allowed: true,
            },
            create: {
              employeeId: profile.id,
              toolId: tool.id,
              allowed: true,
            },
          }),
        ),
      );
    }

    return profile;
  });

  return employee;
}

export async function listEmployees(workspaceId?: string) {
  const employees = await prisma.aIEmployee.findMany({
    where: workspaceId ? { workspaceId } : undefined,
    include: {
      model: true,
      identity: true,
      instructions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return employees.map((employee: any) => ({
    id: employee.id,
    name: employee.name,
    title: employee.title,
    employeeId: employee.employeeId,
    profession: employee.profession,
    specialization: employee.specialization ?? "General",
    description: employee.description ?? "Signalify AI employee",
    status: employee.status,
    modelName: employee.model?.modelName ?? "Not assigned",
    modelProvider: employee.model?.provider ?? "antseed",
    emailIdentity: employee.identity?.emailIdentity ?? "",
  }));
}

export async function switchEmployeeModel(employeeId: string, modelId: string, modelName: string) {
  const employee = await prisma.employeeModel.upsert({
    where: { employeeId },
    update: {
      modelId,
      modelName,
      provider: "antseed",
      updatedAt: new Date(),
    },
    create: {
      employeeId,
      modelId,
      modelName,
      provider: "antseed",
      isDefault: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      employeeId,
      eventType: "model_switch",
      message: `Model changed to ${modelName}`,
      metadata: { modelId, modelName },
    },
  });

  return employee;
}

export async function getEmployeeById(employeeId: string) {
  return prisma.aIEmployee.findUnique({
    where: { id: employeeId },
    include: {
      model: true,
      identity: true,
      instructions: true,
      toolPermissions: { include: { tool: true } },
    },
  });
}
