const fs = require('fs');
const path = 'src/lib/auth.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace the entire function
const newFunc = `
export async function findUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const fallback = FALLBACK_USERS.find(u => u.email === normalizedEmail);

  try {
    const client = await clientPromise;
    const user = await client.db(DB_NAME).collection(USERS_COLLECTION).findOne({
      email: normalizedEmail,
    });
    return user || fallback;
  } catch (e) {
    console.error("Mongo Auth Fallback Used:", e);
    return fallback;
  }
}
`;

content = content.replace(/export async function findUserByEmail[\s\S]*\}\s*\n/g, newFunc);
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed auth.ts completely");
