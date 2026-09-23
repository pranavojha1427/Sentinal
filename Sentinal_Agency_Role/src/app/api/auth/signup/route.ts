import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise, { DB_NAME, USERS_COLLECTION } from "@/lib/mongodb";
import { ROLES, createSession } from "@/lib/auth";

const normalize = (v: unknown) => String(v ?? "").trim();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = normalize(body.name);
    const email = normalize(body.email).toLowerCase();
    const password = String(body.password ?? "");
    const requestedRole = normalize(body.role).toLowerCase();
    const ministry = normalize(body.ministry) || undefined;
    const agency = normalize(body.agency) || undefined;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    // Public registration is USER only. Privileged accounts are provisioned by admin.
    const role = requestedRole || "user";
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (role !== "user") {
      return NextResponse.json(
        { error: "Only user accounts can self-register. Admin, ministry, engineer and agency/company accounts must be created by an administrator." },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const users = client.db(DB_NAME).collection(USERS_COLLECTION);
    const existing = await users.findOne({ email });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await users.insertOne({
      name,
      email,
      passwordHash,
      role: "user",
      ministry: undefined,
      agency: undefined,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createSession({
      id: result.insertedId.toString(),
      name,
      email,
      role: "user",
    });

    return NextResponse.json({ ok: true, role: "user" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
