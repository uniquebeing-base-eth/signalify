import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AntseedProvider } from "@/lib/model-gateway";
import { ensureSeedUser, ensureDefaultWorkspace, listProfessions } from "@/lib/agent-factory";
import { ensureToolRegistry } from "@/lib/tools";

export async function seedSignalifyFoundation() {
  try {
    const user = await ensureSeedUser();
    const workspace = await ensureDefaultWorkspace();
    await ensureToolRegistry();

    const professions = await listProfessions();
    await Promise.all(
      professions.map((profession: { name: string; description: string; responsibilities: string[]; specializations: string[]; recommendedTools: string[]; defaultInstructions: string }) =>
        prisma.profession.upsert({
          where: { name: profession.name },
          update: {},
          create: {
            name: profession.name,
            description: profession.description,
            version: "1.0.0",
            responsibilities: profession.responsibilities as Prisma.InputJsonValue,
            specializations: profession.specializations as Prisma.InputJsonValue,
            requiredCompetencies: ["communication", "analysis"] as Prisma.InputJsonValue,
            recommendedTools: profession.recommendedTools as Prisma.InputJsonValue,
            defaultInstructions: profession.defaultInstructions,
          },
        }),
      ),
    );

    const provider = new AntseedProvider();
    const providerModels = await provider.listModels();
    const antseedProvider = await prisma.modelProvider.upsert({
      where: { name: "antseed" },
      update: {
        baseUrl: process.env.ANTSEED_BASE_URL ?? "https://api.antseed.example.com",
        isEnabled: true,
        workspaceId: workspace.id,
      },
      create: {
        name: "antseed",
        kind: "antseed",
        baseUrl: process.env.ANTSEED_BASE_URL ?? "https://api.antseed.example.com",
        isEnabled: true,
        workspaceId: workspace.id,
      },
    });

    await Promise.all(
      providerModels.map((model) =>
        prisma.availableModel.upsert({
          where: {
            providerId_modelId: {
              providerId: antseedProvider.id,
              modelId: model.id,
            },
          },
          update: {
            name: model.name,
            modelType: model.modelType,
            contextLength: model.contextLength,
            maxOutputTokens: model.maxOutputTokens,
            supportedProtocols: (model.supportedProtocols ?? []) as Prisma.InputJsonValue,
            capabilities: (model.capabilities ?? {}) as Prisma.InputJsonValue,
            pricing: (model.pricing ?? {}) as Prisma.InputJsonValue,
          },
          create: {
            providerId: antseedProvider.id,
            modelId: model.id,
            name: model.name,
            modelType: model.modelType,
            contextLength: model.contextLength,
            maxOutputTokens: model.maxOutputTokens,
            supportedProtocols: (model.supportedProtocols ?? []) as Prisma.InputJsonValue,
            capabilities: (model.capabilities ?? {}) as Prisma.InputJsonValue,
            pricing: (model.pricing ?? {}) as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    return { user, workspace, provider: antseedProvider };
  } catch {
    return { user: null, workspace: null, provider: null };
  }
}

export async function getDashboardStats() {
  try {
    await seedSignalifyFoundation();

    const [employees, tasks, models] = await Promise.all([
      prisma.aIEmployee.count(),
      prisma.task.count(),
      prisma.availableModel.count(),
    ]);

    const activeEmployees = await prisma.aIEmployee.count({ where: { status: "active" } });
    const completedTasks = await prisma.task.count({ where: { status: "completed" } });
    const runningTasks = await prisma.task.count({ where: { status: "running" } });
    const usage = await prisma.modelUsage.aggregate({
      _sum: { cost: true },
    });

    return {
      totalEmployees: employees,
      activeEmployees,
      tasksCompleted: completedTasks,
      currentActivity: runningTasks,
      modelCatalog: models,
      estimatedCost: usage._sum.cost ?? 0,
      recentActivity: [
        { label: "Sarah started a report task", timestamp: "2 minutes ago" },
        { label: "Model catalog refreshed", timestamp: "15 minutes ago" },
        { label: "David completed a data review", timestamp: "1 hour ago" },
      ],
    };
  } catch {
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      tasksCompleted: 0,
      currentActivity: 0,
      modelCatalog: 0,
      estimatedCost: 0,
      recentActivity: [
        { label: "No database-backed activity yet", timestamp: "Awaiting initialization" },
      ],
    };
  }
}

export async function getModelCatalog() {
  try {
    await seedSignalifyFoundation();
    const provider = await prisma.modelProvider.findFirst({ where: { name: "antseed" } });
    const models = await prisma.availableModel.findMany({
      where: provider ? { providerId: provider.id } : undefined,
      orderBy: { fetchedAt: "desc" },
    });

    return {
      provider,
      models: models.map((item: any) => ({
        id: item.modelId,
        name: item.name,
        provider: "antseed",
        modelType: item.modelType ?? "chat",
        contextLength: item.contextLength ?? 128000,
        maxOutputTokens: item.maxOutputTokens ?? 8192,
        capabilities: item.capabilities as Record<string, unknown>,
        pricing: item.pricing as Record<string, unknown>,
        available: true,
      })),
    };
  } catch {
    return {
      provider: null,
      models: [],
    };
  }
}
