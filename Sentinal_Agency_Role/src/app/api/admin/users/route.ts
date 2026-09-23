import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise, { DB_NAME, USERS_COLLECTION } from "@/lib/mongodb";
import { requireRole, ROLES } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["admin"]);
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "").trim().toLowerCase();
    const ministry = String(body.ministry ?? "").trim() || undefined;
    const agency = String(body.agency ?? "").trim() || undefined;

    if (!name || !email || !password || !ROLES.includes(role as any) || role === "admin") {
      return NextResponse.json({ error: "Invalid account details." }, { status: 400 });
    }
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (role === "ministry" && !ministry) return NextResponse.json({ error: "Ministry is required." }, { status: 400 });
    if ((role === "engineer" || role === "agency") && !agency) return NextResponse.json({ error: "Agency/company is required for this role." }, { status: 400 });

    const client = await clientPromise;
    const users = client.db(DB_NAME).collection(USERS_COLLECTION);
    if (await users.findOne({ email })) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    await users.insertOne({
      name, email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      ministry,
      agency,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: admin.email,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    const status = error?.message === "FORBIDDEN" ? 403 : error?.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: status === 403 ? "Admin access required." : "Unable to create account." }, { status });
  }
}
