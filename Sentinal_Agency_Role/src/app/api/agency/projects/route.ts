import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { createClient } from "@/utils/supabase/server";
import { createMongoProject, upsertProjectOverride, isMongoProjectId } from "@/lib/project-store";
import clientPromise, { DB_NAME, PROJECTS_COLLECTION } from "@/lib/mongodb";

const numberOrUndefined = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function clean(body: any, agency: string) {
  return {
    project_code: String(body.project_code ?? "").trim(), project_name: String(body.project_name ?? "").trim(),
    sector: String(body.sector ?? "Others").trim(), ministry: String(body.ministry ?? "").trim() || undefined,
    agency, state: String(body.state ?? "").trim() || undefined,
    original_cost: numberOrUndefined(body.original_cost) ?? 0, revised_cost: numberOrUndefined(body.revised_cost),
    cumulative_expenditure: numberOrUndefined(body.cumulative_expenditure), physical_progress: numberOrUndefined(body.physical_progress),
    land_acquisition_issue: Boolean(body.land_acquisition_issue), forest_clearance_issue: Boolean(body.forest_clearance_issue), contractor_delay: Boolean(body.contractor_delay),
    burn_rate_6m: numberOrUndefined(body.burn_rate_6m), phys_burn_rate_6m: numberOrUndefined(body.phys_burn_rate_6m),
  };
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["agency"]);
    const data = clean(await req.json(), session.agency || "");
    if (!data.agency || !data.project_code || !data.project_name || !data.sector) return NextResponse.json({ error: "Project code, name and sector are required." }, { status: 400 });
    const id = await createMongoProject(data, session.email);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error: any) {
    const status = error?.message === "FORBIDDEN" ? 403 : error?.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: status === 403 ? "Agency/company access required." : "Unable to create project." }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["agency"]);
    const body = await req.json();
    const projectId = String(body.projectId ?? "").trim();
    if (!projectId) return NextResponse.json({ error: "projectId is required." }, { status: 400 });

    // New agency-created projects live directly in MongoDB.
    if (isMongoProjectId(projectId)) {
      const client = await clientPromise;
      const collection = client.db(DB_NAME).collection(PROJECTS_COLLECTION);
      const existing = await collection.findOne({ _id: new ObjectId(projectId), agency: session.agency });
      if (!existing) return NextResponse.json({ error: "You can only modify projects owned by your agency/company." }, { status: 403 });
      const changes = clean(body, session.agency || "");
      await collection.updateOne({ _id: existing._id }, { $set: { ...changes, updatedBy: session.email, updatedAt: new Date() } });
      return NextResponse.json({ ok: true });
    }

    // Existing government projects remain in Supabase. MongoDB stores an audit-friendly override.
    const supabase = await createClient();
    const { data: project, error } = await supabase.from("projects").select("id, agency").eq("id", projectId).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!project || project.agency !== session.agency) return NextResponse.json({ error: "You can only modify projects owned by your agency/company." }, { status: 403 });

    const changes = clean(body, session.agency || "");
    delete (changes as any).agency;
    await upsertProjectOverride(projectId, changes, session.email);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const status = error?.message === "FORBIDDEN" ? 403 : error?.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: status === 403 ? "Agency/company access required." : "Unable to update project." }, { status });
  }
}
