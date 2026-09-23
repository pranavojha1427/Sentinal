import os

path = "src/app/api/agency/projects/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# We need to import NOTIFICATIONS_COLLECTION
if "NOTIFICATIONS_COLLECTION" not in content:
    content = content.replace('PROJECTS_COLLECTION } from', 'PROJECTS_COLLECTION, NOTIFICATIONS_COLLECTION } from')

if "NOTIFICATIONS_COLLECTION" not in content:
    content = content.replace('PROJECT_OVERRIDES_COLLECTION } from', 'PROJECT_OVERRIDES_COLLECTION, NOTIFICATIONS_COLLECTION } from')


# Handle Mongo Project Patch
old_mongo_patch = """        const changes = clean(body, session.agency || "");
      await collection.updateOne({ _id: existing._id }, { $set: { ...changes, updatedBy: session.email, updatedAt: new Date() } });"""
new_mongo_patch = """        const changes = clean(body, session.agency || "");
      
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
      }"""
content = content.replace(old_mongo_patch, new_mongo_patch)

# Handle Supabase Project Patch
old_supa_patch = """    const changes = clean(body, session.agency || "");
    delete (changes as any).agency;

    const client = await clientPromise;
    const overrides = client.db(DB_NAME).collection(PROJECT_OVERRIDES_COLLECTION);
    await overrides.updateOne(
      { project_id: projectId },
      { $set: { ...changes, updatedBy: session.email, updatedAt: new Date() } },
      { upsert: true }
    );"""
new_supa_patch = """    const { data: fullProj } = await supabase.from("projects").select("project_name, ministry, physical_progress").eq("id", projectId).maybeSingle();
    const changes = clean(body, session.agency || "");
    delete (changes as any).agency;
    
    const client = await clientPromise;
    const overrides = client.db(DB_NAME).collection(PROJECT_OVERRIDES_COLLECTION);
    const existingOverride = await overrides.findOne({ project_id: projectId });
    const currentProgress = existingOverride?.physical_progress ?? fullProj?.physical_progress ?? 0;
    
    const isCompleted = Number(changes.physical_progress) === 100 && currentProgress !== 100;
    if (isCompleted) {
      changes.is_completed = true;
    }

    await overrides.updateOne(
      { project_id: projectId },
      { $set: { ...changes, updatedBy: session.email, updatedAt: new Date() } },
      { upsert: true }
    );
    
    if (isCompleted) {
      const pName = fullProj?.project_name || `ID: ${projectId}`;
      const notifMsg = `Agency ${session.agency} has successfully completed the project: ${pName}!`;
      const notifs = [
        { targetRole: "admin", title: "Project Completed", message: notifMsg, isRead: false, createdAt: new Date() }
      ];
      if (fullProj?.ministry) {
        notifs.push({ targetMinistry: fullProj.ministry, title: "Project Completed", message: notifMsg, isRead: false, createdAt: new Date() } as any);
      }
      await client.db(DB_NAME).collection(NOTIFICATIONS_COLLECTION).insertMany(notifs);
    }"""
content = content.replace(old_supa_patch, new_supa_patch)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated route.ts to handle 100% physical progress completion")
