import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

interface AccessTokenPayload {
  userId: string;
}

function getAccessTokenExpiresInSeconds(): number {
  const value = env.jwtAccessExpiresIn;

  if (value.endsWith("m")) {
    const minutes = Number(value.slice(0, -1));

    if (!Number.isFinite(minutes) || minutes <= 0) {
      throw new Error(
        "JWT_ACCESS_EXPIRES_IN must contain a valid positive duration",
      );
    }

    return minutes * 60;
  }

  if (value.endsWith("h")) {
    const hours = Number(value.slice(0, -1));

    if (!Number.isFinite(hours) || hours <= 0) {
      throw new Error(
        "JWT_ACCESS_EXPIRES_IN must contain a valid positive duration",
      );
    }

    return hours * 60 * 60;
  }

  if (value.endsWith("s")) {
    const seconds = Number(value.slice(0, -1));

    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error(
        "JWT_ACCESS_EXPIRES_IN must contain a valid positive duration",
      );
    }

    return seconds;
  }

  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("JWT_ACCESS_EXPIRES_IN must be a valid duration");
  }

  return seconds;
}

export function signAccessToken(userId: string): string {
  const expiresIn = getAccessTokenExpiresInSeconds();

  return jwt.sign(
    {
      userId,
    },
    env.jwtAccessSecret,
    {
      expiresIn,
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string"
  ) {
    throw new Error("Invalid access token");
  }

  return {
    userId: decoded.userId,
  };
}
