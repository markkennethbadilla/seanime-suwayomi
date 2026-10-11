// Downloads Seanime's type definitions into types/ for editor autocompletion (not committed:
// they are part of Seanime, GPL-3.0).   node scripts/types.js
const fs = require("fs");
const path = require("path");

const BASE = "https://raw.githubusercontent.com/5rahim/seanime/main/internal/extension_repo";
const FILES = {
  "plugin.d.ts": "goja_plugin_types/plugin.d.ts",
  "system.d.ts": "goja_plugin_types/system.d.ts",
  "app.d.ts": "goja_plugin_types/app.d.ts",
  "core.d.ts": "goja_plugin_types/core.d.ts",
  "manga-provider.d.ts": "goja_manga_test/manga-provider.d.ts",
};

(async () => {
  const dir = path.join(__dirname, "..", "types");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, src] of Object.entries(FILES)) {
    const res = await fetch(`${BASE}/${src}`);
    if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
    fs.writeFileSync(path.join(dir, name), await res.text());
    console.log("wrote", path.join("types", name));
  }
})().catch(e => { console.error(e.message); process.exit(1); });
