import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "venv/**",
    "predictive_service/**",
    "*.js",
    "scripts/**",
    "src/components/ProjectTableAI.tsx",
    "src/components/ProposalForm.tsx",
    "src/components/StateRiskMap.tsx",
    "src/components/WorkflowInbox.tsx",
    "src/lib/mongodb.ts",
    "src/lib/project-store.ts",
    "src/utils/supabase/server.ts",
  ]),
]);

export default eslintConfig;
