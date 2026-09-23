import os

path = "src/app/api/agency/projects/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

new_patch = """export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["agency"]);
    const body = await req.json();
    const projectId = String(body.projectId ?? "").trim();
    if (!projectId) return NextResponse.json({ error: "projectId is required." }, { status: 400 });

    const client = await clientPromise;

    // New agency-created projects live directly in MongoDB.
    if (isMongoProjectId(projectId)) {
      const collection = client.db(DB_NAME).collection(PROJECTS_COLLECTION);
      const existing = await collection.findOne({ _id: new ObjectId(projectId), agency: session.agency });
      if (!existing) return NextResponse.json({ error: "You can only modify projects owned by your agency/company." }, { status: 403 });
      
      const changes = clean(body, session.agency || "");
      
      const isCompleted = Number(changes.physical_progress) === 100 && existing.physical_progress !== 100;
      if (isCompleted) {
        changes.is_completed = true;
      }
      
      await collection.updateOne({ _id: existing._id }, { $set: { ...changes, updatedBy: session.email, updatedAt: new Date() } });
      
      if (isCompleted) {
        const notifMsg = `Agency ${session.agency} has successfully completed the project: ${existing.project_name || existing.project_code}!`;
        const notifs = [
          { targetRole: "admin", title: "Project Completed", message: notifMsg, isRead: false, createdAt: new Date() }
        ];
        if (existing.ministry) {
          notifs.push({ targetMinistry: existing.ministry, title: "Project Completed", message: notifMsg, isRead: false, createdAt: new Date() } as any);
        }
        await client.db(DB_NAME).collection(NOTIFICATIONS_COLLECTION).insertMany(notifs);
      }
      return NextResponse.json({ ok: true });
    }

    // Existing government projects remain in Supabase. MongoDB stores an audit-friendly override.
    const supabase = await createClient();
    const { data: project, error } = await supabase.from("projects").select("id, agency, project_name, ministry, physical_progress").eq("id", projectId).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!project || project.agency !== session.agency) return NextResponse.json({ error: "You can only modify projects owned by your agency/company." }, { status: 403 });

    const overridesColl = client.db(DB_NAME).collection("project_overrides");
    const existingOverride = await overridesColl.findOne({ project_id: projectId });
    const currentProgress = existingOverride?.physical_progress ?? project?.physical_progress ?? 0;

    const changes = clean(body, session.agency || "");
    delete (changes as any).agency;
    
    const isCompleted = Number(changes.physical_progress) === 100 && currentProgress !== 100;
    if (isCompleted) {
      changes.is_completed = true;
    }

    await upsertProjectOverride(projectId, changes, session.email);
    
    if (isCompleted) {
      const pName = project?.project_name || `ID: ${projectId}`;
      const notifMsg = `Agency ${session.agency} has successfully completed the project: ${pName}!`;
      const notifs = [
        { targetRole: "admin", title: "Project Completed", message: notifMsg, isRead: false, createdAt: new Date() }
      ];
      if (project?.ministry) {
        notifs.push({ targetMinistry: project.ministry, title: "Project Completed", message: notifMsg, isRead: false, createdAt: new Date() } as any);
      }
      await client.db(DB_NAME).collection(NOTIFICATIONS_COLLECTION).insertMany(notifs);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const status = error?.message === "FORBIDDEN" ? 403 : error?.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: status === 403 ? "Agency/company access required." : "Unable to update project." }, { status });
  }
}"""

start_idx = content.find("export async function PATCH")
content = content[:start_idx] + new_patch

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Correctly updated route.ts")
