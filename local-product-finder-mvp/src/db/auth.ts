import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "local-product-finder-secret-key-min32chars-token-jwt"
);

export interface AuthSession {
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      fullName: payload.fullName as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAuth(): Promise<AuthSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
