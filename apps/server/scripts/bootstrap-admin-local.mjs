import { spawnSync } from "node:child_process";

const email = process.argv[2]?.trim();

if (!email) {
  console.error("Usage: vp run admin:bootstrap:local <email>");
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`Invalid email: ${email}`);
  process.exit(1);
}

const sqlEmail = email.replaceAll("'", "''");
const sql = `
update user
set role = 'admin'
where lower(email) = lower('${sqlEmail}')
  and not exists (
    select 1 from user where role = 'admin'
  );

select id, email, role
from user
where lower(email) = lower('${sqlEmail}');
`;

console.log(`Bootstrapping first local admin for ${email}`);
console.log("This command will not promote anyone if an admin already exists.");

const result = spawnSync(
  "wrangler",
  ["d1", "execute", "DB", "--local", "--config", "wrangler.jsonc", "--command", sql],
  {
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
