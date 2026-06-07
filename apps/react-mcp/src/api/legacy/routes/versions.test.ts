/**
 * Legacy API Tests for Versions Routes
 * Tests legacy version endpoints (without /v1/ prefix)
 * These tests ensure legacy endpoints continue to work as expected
 */

import {SELF} from "cloudflare:test";
import {describe, expect, it} from "vitest";

describe("Legacy Versions API", () => {
  describe("GET /versions", () => {
    it("should return version information", async () => {
      const res = await SELF.fetch("http://localhost:8787/versions");

      expect(res.status).toBe(200);

      const data = (await res.json()) as any;
      expect(data).toHaveProperty("blakeuiReact");
      expect(data).toHaveProperty("mcp");
      expect(data.blakeuiReact).toHaveProperty("latest");
      expect(data.blakeuiReact).toHaveProperty("versions");
      expect(data.mcp).toHaveProperty("current");
      expect(Array.isArray(data.blakeuiReact.versions)).toBe(true);
    });

    it("should have proper CORS headers", async () => {
      const res = await SELF.fetch("http://localhost:8787/versions");

      expect(res.headers.get("access-control-allow-origin")).toBe("*");
    });
  });
});
