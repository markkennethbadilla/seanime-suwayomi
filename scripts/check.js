// CI check: dist/ is up to date, payloads parse, and nothing machine-specific leaked in.
//   node scripts/check.js
const fs = require("fs");
const path = require("path");
const { provider, launcher } = require("../build.js");

const DIST = path.join(__dirname, "..", "dist");
let failed = 0;
const fail = msg => { console.error("FAIL:", msg); failed++; };

for (const m of [provider, launcher]) {
  const file = path.join(DIST, `${m.id}.json`);
  const expected = JSON.stringify(m, null, 2) + "\n";
  if (!fs.existsSync(file)) fail(`${file} is missing, run: node build.js`);
  else if (fs.readFileSync(file, "utf8") !== expected) fail(`dist/${m.id}.json is stale, run: node build.js`);

  try { new Function(m.payload); } catch (e) { fail(`${m.id} payload does not parse: ${e.message}`); }
  if (m.manifestURI && !m.manifestURI.endsWith(`/dist/${m.id}.json`)) fail(`${m.id} manifestURI points elsewhere: ${m.manifestURI}`);
}

// The launcher payload must have every build-time placeholder filled in. The provider's own
// {{…}} placeholders are filled by Seanime from userConfig, so they only appear inside strings.
const leftover = launcher.payload.replace(JSON.stringify(provider.payload), "").match(/\{\{[A-Z_]+\}\}/g);
if (leftover) fail(`launcher payload has unfilled placeholders: ${leftover.join(", ")}`);

// No absolute paths from the build machine.
for (const name of fs.readdirSync(DIST)) {
  const text = fs.readFileSync(path.join(DIST, name), "utf8");
  const hit = text.match(/[A-Za-z]:\\\\(Users|Documents and Settings)\\\\[^"\\]+|\/(home|Users)\/[A-Za-z0-9._-]+\//);
  if (hit) fail(`dist/${name} contains a machine-specific path: ${hit[0]}`);
}

if (failed) process.exit(1);
console.log("check ok");
