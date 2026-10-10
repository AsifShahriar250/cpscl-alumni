
import { describe, it, expect } from "vitest";

import {
  createMemorySchema,
  updateMemorySchema,
  memoryQuerySchema,
} from "../src/validators/memory.validator.js";

describe("Create Memory Validation", () => {
  it("should accept valid memory data", () => {
    const result = createMemorySchema.safeParse({
      title: "School Reunion",
      content: "Memories from our school reunion.",
      imageUrl: "https://example.com/memory.jpg",
    });

    expect(result.success).toBe(true);
  });

  it("should reject a title shorter than 3 characters", () => {
    const result = createMemorySchema.safeParse({
      title: "AB",
      content: "Memories from our school reunion.",
    });

    expect(result.success).toBe(false);
  });

  it("should reject content shorter than 10 characters", () => {
    const result = createMemorySchema.safeParse({
      title: "School Reunion",
      content: "Too short",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an invalid image URL", () => {
    const result = createMemorySchema.safeParse({
      title: "School Reunion",
      content: "Memories from our school reunion.",
      imageUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  it("should accept memory data without an image URL", () => {
    const result = createMemorySchema.safeParse({
      title: "School Reunion",
      content: "Memories from our school reunion.",
    });

    expect(result.success).toBe(true);
  });
});

describe("Update Memory Validation", () => {
  it("should accept a valid partial update", () => {
    const result = updateMemorySchema.safeParse({
      title: "Updated Reunion",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an empty update object", () => {
    const result = updateMemorySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("should reject an invalid field in a partial update", () => {
    const result = updateMemorySchema.safeParse({
      title: "AB",
    });

    expect(result.success).toBe(false);
  });
});

describe("Memory Query Validation", () => {
  it("should use default pagination values", () => {
    const result = memoryQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should coerce valid query strings into numbers", () => {
    const result = memoryQuerySchema.safeParse({
      page: "2",
      limit: "20",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should reject page zero", () => {
    const result = memoryQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a limit greater than 100", () => {
    const result = memoryQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });
});
