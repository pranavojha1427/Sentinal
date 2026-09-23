import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import clientPromise, { DB_NAME, USERS_COLLECTION } from "./mongodb";

export const ROLES = ["admin", "ministry", "engineer", "agency", "user"] as const;
export type Role = (typeof ROLES)[number];

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  ministry?: string;
  agency?: string;
};

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("Missing AUTH_SECRET environment variable");
const secretKey = new TextEncoder().encode(secret);

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set("pp_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pp_session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.id || !payload.email || !payload.role) return null;

    return {
      id: String(payload.id),
      name: String(payload.name || ""),
      email: String(payload.email),
      role: payload.role as Role,
      ministry: payload.ministry ? String(payload.ministry) : undefined,
      agency: payload.agency ? String(payload.agency) : undefined,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("pp_session");
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireRole(allowed: Role[]) {
  const session = await requireSession();
  if (!allowed.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}

export async function findUserByEmail(email: string) {
  const client = await clientPromise;
  return client.db(DB_NAME).collection(USERS_COLLECTION).findOne({
    email: email.toLowerCase().trim(),
  });
}
