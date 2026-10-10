
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Root API", () => {
  it("should return API running status", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "CPSCL Alumni Platform API is running",
    );
    expect(response.body).toHaveProperty("environment");
  });
});

describe("Memory API authentication", () => {
  it("should reject memory creation without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/memories")
      .send({
        title: "Test Memory",
        content: "This is a test memory content.",
      });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
