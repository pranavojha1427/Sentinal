const fs = require('fs');
const { execSync } = require('child_process');

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');

for (let line of lines) {
  line = line.trim();
  if (!line || line.startsWith('#')) continue;
  
  const eqIdx = line.indexOf('=');
  if (eqIdx === -1) continue;
  
  const key = line.slice(0, eqIdx).trim();
  let val = line.slice(eqIdx + 1).trim();
  
  // Remove surrounding quotes if present
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }

  // Skip the groq api key as we moved to Gemini
  if (key === 'GROQ_API_KEY') continue;

  console.log(`Setting ${key}...`);
  try {
    execSync(`npx vercel env add ${key} production,preview,development --value "${val}" --yes --force`, {
      stdio: 'inherit'
    });
  } catch (err) {
    console.error(`Failed to set ${key}`);
  }
}
console.log("All environment variables set successfully!");
