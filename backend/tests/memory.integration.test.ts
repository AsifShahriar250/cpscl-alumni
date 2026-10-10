import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";

import app from "../src/app.js";
import { prisma } from "../src/config/database.js";
import { signAccessToken } from "../src/utils/jwt.js";

describe("Memory API integration", () => {
  const testId = randomUUID();
  const emailA = `memory-test-a-${testId}@example.com`;
  const emailB = `memory-test-b-${testId}@example.com`;

  let userAId: string;
  let userBId: string;
  let tokenA: string;
  let tokenB: string;
  let memoryId: string;

  beforeAll(async () => {
    const databaseUrl = new URL(process.env.DATABASE_URL ?? "");

    if (
      databaseUrl.hostname !== "localhost" ||
      databaseUrl.pathname !== "/cpscl_alumni_test"
    ) {
      throw new Error("Integration tests require cpscl_alumni_test");
    }

    const userA = await prisma.user.create({
      data: {
        email: emailA,
        passwordHash: "integration-test-hash",
      },
    });

    const userB = await prisma.user.create({
      data: {
        email: emailB,
        passwordHash: "integration-test-hash",
      },
    });

    userAId = userA.id;
    userBId = userB.id;

    tokenA = signAccessToken(userAId);
    tokenB = signAccessToken(userBId);
  });

  afterAll(async () => {
    if (userAId || userBId) {
      const userIds = [userAId, userBId].filter(Boolean);

      await prisma.memory.deleteMany({
        where: { authorId: { in: userIds } },
      });

      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
  });

  it("rejects memory creation without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/memories")
      .send({
        title: "Integration Test Memory",
        content: "Testing unauthenticated access.",
      });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("creates a memory for an authenticated user", async () => {
    const response = await request(app)
      .post("/api/v1/memories")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Integration Test Memory",
        content: "This memory was created by an integration test.",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Integration Test Memory");
    expect(response.body.data.authorId).toBe(userAId);

    memoryId = response.body.data.id;
  });

  it("returns the created memory by ID", async () => {
    const response = await request(app).get(
      `/api/v1/memories/${memoryId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(memoryId);
    expect(response.body.data.title).toBe("Integration Test Memory");
  });

  it("lists the authenticated user's memories", async () => {
    const response = await request(app)
      .get("/api/v1/memories/me")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.status).toBe(200);
    expect(
      response.body.data.some(
        (memory: { id: string }) => memory.id === memoryId,
      ),
    ).toBe(true);
  });

  it("updates the memory owned by the authenticated user", async () => {
    const response = await request(app)
      .patch(`/api/v1/memories/${memoryId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Updated Integration Memory" });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated Integration Memory");
  });

  it("prevents another user from updating the memory", async () => {
    const response = await request(app)
      .patch(`/api/v1/memories/${memoryId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Unauthorized Update" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MEMORY_NOT_FOUND");

    const storedMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
    });

    expect(storedMemory?.title).toBe("Updated Integration Memory");
  });

  it("prevents another user from deleting the memory", async () => {
    const response = await request(app)
      .delete(`/api/v1/memories/${memoryId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MEMORY_NOT_FOUND");

    const storedMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
    });

    expect(storedMemory).not.toBeNull();
  });

  it("deletes the memory for its owner", async () => {
    const response = await request(app)
      .delete(`/api/v1/memories/${memoryId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const storedMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
    });

    expect(storedMemory).toBeNull();
  });
  it("rejects an invalid memory ID", async () => {
    const response = await request(app).get(
      "/api/v1/memories/not-a-valid-uuid",
    );

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_MEMORY_ID");
  });

  it("returns 404 for a memory that does not exist", async () => {
    const response = await request(app).get(
      `/api/v1/memories/${randomUUID()}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("MEMORY_NOT_FOUND");
  });

  it("rejects an invalid JWT token", async () => {
    const response = await request(app)
      .get("/api/v1/memories/me")
      .set("Authorization", "Bearer invalid.test.token");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_ACCESS_TOKEN");
  });

  it("rejects invalid pagination parameters", async () => {
    const response = await request(app).get(
      "/api/v1/memories?page=0&limit=101",
    );

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
