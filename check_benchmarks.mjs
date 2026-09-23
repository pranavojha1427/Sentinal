import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: b } = await supabase.from("sector_benchmarks").select("sector");
    console.log("Benchmarks sectors:", b?.map(x => x.sector));

    const { data: p } = await supabase.from("projects").select("sector").limit(50);
    console.log("Some project sectors:", Array.from(new Set(p?.map(x => x.sector))));
}
check();
