import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise, { DB_NAME, USERS_COLLECTION } from "@/lib/mongodb";
import { requireRole, ROLES } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["admin", "state_admin"]);
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    let role = String(body.role ?? "").trim().toLowerCase();
    const ministry = String(body.ministry ?? "").trim() || undefined;
    const agency = String(body.agency ?? "").trim() || undefined;
    const state = String(body.state ?? "").trim() || undefined;

    // Normalizing role naming
    if (role === "state admin") role = "state_admin";

    if (!name || !email || !password || !ROLES.includes(role as any) || role === "admin") {
      return NextResponse.json({ error: "Invalid account details." }, { status: 400 });
    }

    // Role-based creation limits
    if (admin.role === "state_admin" && role !== "ministry") {
      return NextResponse.json({ error: "State Admins can only create Ministry accounts." }, { status: 403 });
    }

    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    
    if (role === "ministry" && (!ministry || !state)) return NextResponse.json({ error: "Ministry and State are required for Ministry accounts." }, { status: 400 });
    if (role === "state_admin" && !state) return NextResponse.json({ error: "State is required for State Admin accounts." }, { status: 400 });
    if ((role === "engineer" || role === "agency") && !agency) return NextResponse.json({ error: "Agency/company is required for this role." }, { status: 400 });

    const client = await clientPromise;
    const users = client.db(DB_NAME).collection(USERS_COLLECTION);
    if (await users.findOne({ email })) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: any = { name, email, password: hashedPassword, role, createdAt: new Date() };
    if (ministry) newUser.ministry = ministry;
    if (agency) newUser.agency = agency;
    if (state) newUser.state = state;

    await users.insertOne(newUser);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
