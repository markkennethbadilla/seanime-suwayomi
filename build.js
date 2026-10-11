// Builds the Seanime manifests into dist/.
//
//   node build.js            write dist/*.json
//   node build.js --install  also copy them into this machine's Seanime extensions folder (development)
//
// The output contains no machine-specific paths: the plugin resolves them at runtime.
const fs = require("fs");
const os = require("os");
const path = require("path");

const REPO = "oktavianto/seanime-suwayomi";
const BRANCH = "main";
const AUTHOR = "oktavianto";
const VERSION = "1.0.0";              // both manifests ship together
const PORT = 4567;                    // Suwayomi-Server, bound to 127.0.0.1
const PINNED = "v2.4.2366";           // Suwayomi release used if the GitHub API can't be reached

const SRC = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/dist`;

const read = f => fs.readFileSync(path.join(SRC, f), "utf8");

// ---------------------------------------------------------------- manga provider

const provider = {
  id: "suwayomi",
  name: "Suwayomi (Mihon/Tachiyomi)",
  version: VERSION,
  manifestURI: `${RAW}/suwayomi.json`,
  language: "javascript",
  type: "manga-provider",
  description: "Searches every installed Tachiyomi/Mihon source at once through Suwayomi-Server (started automatically by the Suwayomi Launcher plugin).",
  author: AUTHOR,
  lang: "multi",
  website: `https://github.com/${REPO}`,
  userConfig: {
    requiresConfig: false,
    version: 2,
    fields: [
      { name: "serverUrl", label: "Suwayomi server URL", type: "text", default: `http://127.0.0.1:${PORT}` },
      { name: "sources", label: "Sources (comma-separated name or ID, priority order; empty = all)", type: "text", default: "" },
      { name: "languages", label: "Source languages (e.g. en,id; empty = all)", type: "text", default: "" },
      { name: "maxSources", label: "Max sources searched at once", type: "text", default: "5" },
      { name: "username", label: "Basic auth username (optional)", type: "text", default: "" },
      { name: "password", label: "Basic auth password (optional)", type: "text", default: "" },
      { name: "multiScanlator", label: "Allow choosing scanlator", type: "switch", default: "false" },
    ],
  },
  payload: read("provider.js"),
};

// ---------------------------------------------------------------- launcher plugin

// Suwayomi is started from its own folder (<config>/Seanime/suwayomi/app), so the java command and
// the jar are relative paths that are the same on every machine. Seanime matches commands exactly,
// so these must equal what src/plugin.js passes to $osExtra.asyncCmd.
const JAVA_ARGS = [
  { validator: "^-Dsuwayomi\\.tachidesk\\.config\\.server\\.rootDir=.+[\\\\/]Seanime[\\\\/]suwayomi[\\\\/]data$" },
  { value: "-Dsuwayomi.tachidesk.config.server.ip=127.0.0.1" },
  { value: `-Dsuwayomi.tachidesk.config.server.port=${PORT}` },
  { value: "-Dsuwayomi.tachidesk.config.server.initialOpenInBrowserEnabled=false" },
  { value: "-Dsuwayomi.tachidesk.config.server.systemTrayEnabled=false" },
  { value: "-jar" },
  { value: "bin/Suwayomi-Server.jar" },
];

const pluginCode = read("plugin.js")
  .replace("{{PORT}}", String(PORT))
  .replace("{{PINNED}}", PINNED)
  .replace("{{PROVIDER_VERSION}}", VERSION)
  .replace("{{AUTHOR}}", AUTHOR)
  .replace("{{WEBVIEW_HTML}}", () => JSON.stringify(read("webview.html")))
  .replace("{{MAIN_PROVIDER}}", () => JSON.stringify(provider))
  // Last, so the {{…}} placeholders inside provider.js are left for the plugin to fill in.
  .replace("{{PROVIDER_CODE}}", () => JSON.stringify(provider.payload));

const launcher = {
  id: "suwayomi-launcher",
  name: "Suwayomi Launcher",
  version: VERSION,
  manifestURI: `${RAW}/suwayomi-launcher.json`,
  language: "javascript",
  type: "plugin",
  description: "Zero-setup Tachiyomi/Mihon extensions for Seanime manga. Downloads and runs a portable Suwayomi-Server in the background, adds a \"Mihon Extensions\" page, and adds every installed source to the manga Source list.",
  author: AUTHOR,
  lang: "multi",
  website: `https://github.com/${REPO}`,
  icon: "https://raw.githubusercontent.com/Suwayomi/Suwayomi-Server/master/server/src/main/resources/icon/faviconlogo.png",
  plugin: {
    version: "1",
    permissions: {
      scopes: ["system", "extensions"],
      allow: {
        networkAccess: {
          allowedDomains: ["127.0.0.1", "api.github.com", "github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"],
          reasoning: "Talks to the local Suwayomi server (127.0.0.1:4567) and downloads Suwayomi-Server from its GitHub releases.",
        },
        // $CONFIG is the OS config dir (%APPDATA%, ~/Library/Application Support, ~/.config).
        // Only the Seanime/suwayomi folder and this plugin's own provider files are written.
        readPaths: [
          "$CONFIG",
          "$CONFIG/Seanime/suwayomi",
          "$CONFIG/Seanime/suwayomi/**",
          "$CONFIG/Seanime/extensions",
          "$CONFIG/Seanime/extensions/suwayomi.json",
          "$CONFIG/Seanime/extensions/suwayomi-src-*.json",
        ],
        writePaths: [
          "$CONFIG/Seanime/suwayomi",
          "$CONFIG/Seanime/suwayomi/**",
          "$CONFIG/Seanime/extensions/suwayomi.json",
          "$CONFIG/Seanime/extensions/suwayomi-src-*.json",
        ],
        commandScopes: [
          { description: "Run Suwayomi-Server with its bundled Java (Windows)", command: "jre/bin/java.exe", args: JAVA_ARGS },
          { description: "Run Suwayomi-Server with its bundled Java (Linux, macOS)", command: "jre/bin/java", args: JAVA_ARGS },
          { description: "Run Suwayomi-Server with the system Java (other platforms)", command: "java", args: JAVA_ARGS },
          { description: "Check the system Java version (other platforms)", command: "java", args: [{ value: "-version" }] },
          {
            description: "Extract the Suwayomi download (Linux, macOS)",
            command: "tar",
            args: [{ value: "-xzf" }, { validator: "$PATH" }, { value: "-C" }, { validator: "$PATH" }],
          },
        ],
      },
    },
  },
  payload: pluginCode,
};

// ---------------------------------------------------------------- output

const repoIndex = { urls: [`${RAW}/suwayomi.json`] };

function build() {
  fs.mkdirSync(DIST, { recursive: true });
  const out = {
    "suwayomi.json": provider,
    "suwayomi-launcher.json": launcher,
    "repo.json": repoIndex,
  };
  for (const [name, obj] of Object.entries(out)) {
    fs.writeFileSync(path.join(DIST, name), JSON.stringify(obj, null, 2) + "\n");
    console.log("wrote", path.join("dist", name));
  }
  return out;
}

// Seanime's default data folder: <OS config dir>/Seanime.
function seanimeExtensionsDir() {
  const home = os.homedir();
  const config = process.platform === "win32" ? process.env.APPDATA || path.join(home, "AppData", "Roaming")
    : process.platform === "darwin" ? path.join(home, "Library", "Application Support")
    : process.env.XDG_CONFIG_HOME || path.join(home, ".config");
  return path.join(config, "Seanime", "extensions");
}

if (require.main === module) {
  build();
  if (process.argv.includes("--install")) {
    const dir = seanimeExtensionsDir();
    if (!fs.existsSync(dir)) throw new Error(`Seanime extensions folder not found: ${dir}`);
    for (const name of ["suwayomi.json", "suwayomi-launcher.json"]) {
      fs.copyFileSync(path.join(DIST, name), path.join(dir, name));
      console.log("installed", path.join(dir, name));
    }
    console.log("Reload the extensions in Seanime (or restart it), then grant the launcher's permissions.");
  }
}

module.exports = { build, provider, launcher, JAVA_ARGS, PORT };
