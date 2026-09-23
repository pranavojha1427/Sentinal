import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: p } = await supabase.from("projects").select("project_name, sector, ministry").ilike("ministry", "%industry%");
    console.log("Ministry projects:", p?.map(x => x.sector));
}
check();
