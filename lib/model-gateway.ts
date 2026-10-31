import { z } from "zod";

import type { ModelRecord } from "@/lib/types";

const antseedModelSchema = z.object({
  id: z.string(),
  object: z.string().optional(),
  created: z.number().optional(),
  owned_by: z.string().optional(),
  display_name: z.string().optional(),
  name: z.string().optional(),
  context_window: z.number().optional(),
  max_output_tokens: z.number().optional(),
  capabilities: z.record(z.string(), z.any()).optional(),
  pricing: z.record(z.string(), z.any()).optional(),
  features: z.record(z.string(), z.any()).optional(),
});

export type ProviderHealth = {
  provider: string;
  isHealthy: boolean;
  status: string;
  detail?: string;
};

export interface SignalifyModelProvider {
  listModels(): Promise<ModelRecord[]>;
  getModel(modelId: string): Promise<ModelRecord | null>;
  healthCheck(): Promise<ProviderHealth>;
  generateResponse(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  getUsage(): Promise<Record<string, unknown>>;
}

export const fallbackModelCatalogue: ModelRecord[] = [
  {
    id: "antseed-gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "antseed",
    modelType: "chat",
    contextLength: 128000,
    maxOutputTokens: 16384,
    supportedProtocols: ["openai-compatible"],
    capabilities: {
      toolCalling: true,
      structuredOutput: true,
      reasoning: false,
      vision: false,
    },
    pricing: { inputPer1kTokens: 0.00015, outputPer1kTokens: 0.0006 },
    available: true,
    providerAvailability: "available",
  },
  {
    id: "antseed-claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "antseed",
    modelType: "chat",
    contextLength: 200000,
    maxOutputTokens: 8192,
    supportedProtocols: ["anthropic-compatible"],
    capabilities: {
      toolCalling: true,
      structuredOutput: true,
      reasoning: true,
      vision: true,
    },
    pricing: { inputPer1kTokens: 0.0003, outputPer1kTokens: 0.0015 },
    available: true,
    providerAvailability: "available",
  },
];

export class AntseedProvider implements SignalifyModelProvider {
  constructor(
    private readonly baseUrl = process.env.ANTSEED_BASE_URL ?? "https://api.antseed.example.com",
    private readonly apiKey = process.env.ANTSEED_API_KEY ?? "",
    private readonly defaultModel = process.env.ANTSEED_DEFAULT_MODEL ?? "antseed-gpt-4.1-mini",
  ) {}

  private buildHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private normalizeModel(raw: Record<string, unknown>): ModelRecord {
    const parsed = antseedModelSchema.safeParse(raw);
    const data = parsed.success ? parsed.data : raw;
    const id = String(data.id ?? "unknown");
    const name = String(data.display_name ?? data.name ?? id);
    const capabilities: Record<string, unknown> = {
      ...(data.capabilities ?? {}),
      ...(data.features ?? {}),
      toolCalling: Boolean((data.capabilities as Record<string, unknown>)?.tool_calling ?? false),
      structuredOutput: Boolean((data.capabilities as Record<string, unknown>)?.structured_output ?? false),
      reasoning: Boolean((data.capabilities as Record<string, unknown>)?.reasoning ?? false),
      vision: Boolean((data.capabilities as Record<string, unknown>)?.vision ?? false),
    };

    return {
      id,
      name,
      provider: "antseed",
      modelType: String((data as Record<string, unknown>).model_type ?? "chat"),
      contextLength: Number((data as Record<string, unknown>).context_window ?? data.context_window ?? 0) || undefined,
      maxOutputTokens: Number((data as Record<string, unknown>).max_output_tokens ?? data.max_output_tokens ?? 0) || undefined,
      supportedProtocols: ["openai-compatible"],
      capabilities,
      pricing: (data.pricing as Record<string, unknown>) ?? {},
      available: true,
      providerAvailability: "available",
    };
  }

  async listModels(): Promise<ModelRecord[]> {
    if (!this.apiKey || this.baseUrl.includes("example.com")) {
      return fallbackModelCatalogue;
    }

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/v1/models`, {
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Antseed model lookup failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { data?: Record<string, unknown>[] };
      const normalized = Array.isArray(payload.data)
        ? payload.data.map((model) => this.normalizeModel(model))
        : fallbackModelCatalogue;

      return normalized.length ? normalized : fallbackModelCatalogue;
    } catch {
      return fallbackModelCatalogue;
    }
  }

  async getModel(modelId: string): Promise<ModelRecord | null> {
    const models = await this.listModels();
    return models.find((model) => model.id === modelId) ?? null;
  }

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey || this.baseUrl.includes("example.com")) {
      return {
        provider: "antseed",
        isHealthy: false,
        status: "mock-configured",
        detail: "Antseed is configured in fallback mode until real credentials are supplied.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/v1/models`, {
        headers: this.buildHeaders(),
      });

      if (response.ok) {
        return {
          provider: "antseed",
          isHealthy: true,
          status: "connected",
          detail: "Antseed gateway is responding.",
        };
      }

      return {
        provider: "antseed",
        isHealthy: false,
        status: "error",
        detail: `Gateway returned ${response.status}`,
      };
    } catch (error) {
      return {
        provider: "antseed",
        isHealthy: false,
        status: "unreachable",
        detail: error instanceof Error ? error.message : "Unknown failure",
      };
    }
  }

  async generateResponse(input: Record<string, unknown>) {
    return {
      id: `antseed-${Date.now()}`,
      provider: "antseed",
      model: this.defaultModel,
      content: String(input.prompt ?? "No prompt supplied."),
      usage: {
        input_tokens: 128,
        output_tokens: 256,
      },
      createdAt: new Date().toISOString(),
    };
  }

  async getUsage() {
    return {
      provider: "antseed",
      used: 0,
      currency: "USD",
      estimatedCost: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export function listAvailableModels(): Promise<ModelRecord[]> {
  return new AntseedProvider().listModels();
}
