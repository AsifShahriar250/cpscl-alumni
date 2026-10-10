import crypto from "node:crypto";

const TOKEN_BYTES = 32;

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashEmailVerificationToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}
