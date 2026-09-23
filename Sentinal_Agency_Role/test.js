import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const req1 = await supabase.from("projects").select("*").range(0, 999);
  console.log("projects req1:", req1.error);
  
  const { data: kpiData, error: kpiError } = await supabase.rpc("get_portfolio_kpis");
  console.log("rpc get_portfolio_kpis:", kpiError);
}
test();
