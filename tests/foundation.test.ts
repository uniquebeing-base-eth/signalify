import { describe, expect, it } from "vitest";

import { AntseedProvider, fallbackModelCatalogue } from "@/lib/model-gateway";
import { createOAuthState, validateOAuthState } from "@/lib/oauth";

describe("Signalify foundation", () => {
  it("keeps the Antseed fallback model catalog available without runtime secrets", async () => {
    const provider = new AntseedProvider();
    const models = await provider.listModels();

    expect(models.length).toBeGreaterThan(0);
    expect(models[0].provider).toBe("antseed");
    expect(fallbackModelCatalogue[0].provider).toBe("antseed");
  });

  it("creates and validates OAuth state values securely", () => {
    const state = createOAuthState();
    expect(validateOAuthState(state, state)).toBe(true);
    expect(validateOAuthState(state, "different-state")).toBe(false);
  });

  it("tracks model metadata in a provider-independent shape", async () => {
    const provider = new AntseedProvider();
    const model = (await provider.listModels())[0];

    expect(model).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      provider: "antseed",
    });
  });
});
