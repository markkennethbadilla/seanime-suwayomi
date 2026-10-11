/// <reference path="../types/plugin.d.ts" />
/// <reference path="../types/system.d.ts" />

// Zero-setup companion for the "suwayomi" manga provider.
// On Seanime start it downloads a portable Suwayomi-Server (with its own Java on Windows, Linux x64
// and macOS), launches it hidden on 127.0.0.1, and adds a "Mihon Extensions" page to install sources.
//
// Nothing machine-specific is baked in: every path is resolved at runtime from the OS config dir,
// which is where Seanime keeps its data by default (%APPDATA%, ~/Library/Application Support, ~/.config).
// Commands are started relative to the Suwayomi folder so they match the manifest's commandScopes on
// every machine. Everything lives inside the $ui.register callback because the UI runs in its own
// runtime and can't see top-level declarations.

function init() {
  $ui.register(ctx => {
    // Injected by build.js
    const PORT = {{PORT}};
    const PINNED = "{{PINNED}}";                 // Suwayomi release used if the GitHub API is unreachable
    const WEBVIEW_HTML = {{WEBVIEW_HTML}};       // src/webview.html
    const PROVIDER_CODE = {{PROVIDER_CODE}};     // src/provider.js
    const PROVIDER_VERSION = "{{PROVIDER_VERSION}}";
    const MAIN_PROVIDER = {{MAIN_PROVIDER}};     // dist/suwayomi.json, kept installed by this plugin
    const AUTHOR = "{{AUTHOR}}";

    const GQL = `http://127.0.0.1:${PORT}/api/graphql`;
    const MIN_JAVA = 21;

    // ------------------------------------------------------------ paths & platform

    const CONFIG_DIR = $os.configDir();
    const SEANIME_DIR = $filepath.join(CONFIG_DIR, "Seanime");
    const ROOT = $filepath.join(SEANIME_DIR, "suwayomi");   // everything this plugin downloads
    const APP_DIR = $filepath.join(ROOT, "app");            // unpacked Suwayomi release
    const DATA_DIR = $filepath.join(ROOT, "data");          // Suwayomi's own database, extensions, cache
    const EXT_DIR = $filepath.join(SEANIME_DIR, "extensions");

    // Suwayomi ships a build with its own Java for these platforms. They all unpack to
    // <top>/jre/bin/java[.exe] and <top>/bin/Suwayomi-Server.jar.
    const BUNDLES = {
      "windows/amd64": { suffix: "-windows-x64.zip", java: "jre/bin/java.exe" },
      "linux/amd64": { suffix: "-linux-x64.tar.gz", java: "jre/bin/java" },
      "darwin/amd64": { suffix: "-macOS-x64.tar.gz", java: "jre/bin/java" },
      "darwin/arm64": { suffix: "-macOS-arm64.tar.gz", java: "jre/bin/java" },
    };
    const PLATFORM = `${$os.platform}/${$os.arch}`;
    const BUNDLE = BUNDLES[PLATFORM] || null;
    // Elsewhere (Linux ARM, Raspberry Pi, …) the plain .jar runs on the system's Java.
    const JAVA = BUNDLE ? BUNDLE.java : "java";
    const JAR = "bin/Suwayomi-Server.jar";
    // Relative to APP_DIR; must match the manifest's commandScopes exactly.
    const JAVA_ARGS = [
      `-Dsuwayomi.tachidesk.config.server.rootDir=${DATA_DIR}`,
      "-Dsuwayomi.tachidesk.config.server.ip=127.0.0.1",
      `-Dsuwayomi.tachidesk.config.server.port=${PORT}`,
      "-Dsuwayomi.tachidesk.config.server.initialOpenInBrowserEnabled=false",
      "-Dsuwayomi.tachidesk.config.server.systemTrayEnabled=false",
      "-jar",
      JAR,
    ];

    // ------------------------------------------------------------ state

    const status = ctx.state("Checking…");
    const help = ctx.state([]);   // extra lines explaining what the user has to do, shown in tray and page
    const busy = ctx.state(false);
    const running = ctx.state(false);
    const extensions = ctx.state([]);
    const stores = ctx.state([]);
    const busyList = ctx.state([]); // pkgNames (or "__repo__") with an operation in flight
    let proc = null;

    const tray = ctx.newTray({
      tooltipText: "Suwayomi (Mihon)",
      iconUrl: "https://raw.githubusercontent.com/Suwayomi/Suwayomi-Server/master/server/src/main/resources/icon/faviconlogo.png",
      withContent: true,
    });

    // ------------------------------------------------------------ helpers

    function exists(p) {
      try { $os.stat(p); return true; } catch (e) { return false; }
    }

    function sleep(ms) {
      return new Promise(r => ctx.setTimeout(r, ms));
    }

    async function gql(q, variables) {
      const res = await ctx.fetch(GQL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, variables: variables || {} }),
        timeout: 120,
      });
      const json = await res.json();
      if (json.errors && json.errors.length) throw new Error(json.errors.map(e => e.message).join("; "));
      return json.data;
    }

    async function ping() {
      try { await gql("{ __typename }"); return true; } catch (e) { return false; }
    }

    async function waitUntilUp(seconds) {
      for (let i = 0; i < seconds / 2; i++) {
        if (await ping()) return true;
        if (!proc) return false; // the process already exited
        await sleep(2000);
      }
      return false;
    }

    // Runs a short command to completion and returns its exit code and output.
    function runCmd(name, args, dir) {
      return new Promise((resolve, reject) => {
        let cmd;
        try { cmd = $osExtra.asyncCmd(name, ...args); } catch (e) { reject(e); return; }
        if (dir) cmd.getCommand().dir = dir;
        let out = "";
        try {
          cmd.run((data, err, exitCode) => {
            if (data) out += $toString(data) + "\n";
            if (err) out += $toString(err) + "\n";
            if (exitCode !== undefined) resolve({ code: exitCode, out });
          });
        } catch (e) { reject(e); }
      });
    }

    function compareVersions(a, b) {
      const pa = String(a || "0").split(".").map(n => parseInt(n, 10) || 0);
      const pb = String(b || "0").split(".").map(n => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] || 0) - (pb[i] || 0);
        if (d) return d;
      }
      return 0;
    }

    // ------------------------------------------------------------ java (fallback platforms)

    function javaHelp(reason) {
      return [
        `${reason} Suwayomi needs Java ${MIN_JAVA} or newer on this device (${PLATFORM}).`,
        "Install one of these, then press \"Start / Retry\":",
        "• Debian / Ubuntu / Raspberry Pi OS: sudo apt install openjdk-21-jre-headless",
        "• Fedora: sudo dnf install java-21-openjdk-headless",
        "• Arch: sudo pacman -S jre21-openjdk-headless",
        "• Alpine: sudo apk add openjdk21-jre-headless",
        "• Any OS: Temurin 21 JRE from https://adoptium.net/temurin/releases/?version=21",
        "Make sure `java -version` works in a terminal (Java must be on PATH), then restart Seanime if it was already running.",
      ];
    }

    // Returns null if a usable Java is on PATH, otherwise the lines to show the user.
    async function checkSystemJava() {
      let res;
      try {
        res = await runCmd("java", ["-version"]);
      } catch (e) {
        return javaHelp("Java was not found.");
      }
      const m = res.out.match(/version "(\d+)(?:\.(\d+))?/);
      if (res.code !== 0 || !m) return javaHelp("Java was not found.");
      // Java 8 and older report "1.x"
      const major = m[1] === "1" ? parseInt(m[2] || "0", 10) : parseInt(m[1], 10);
      if (major < MIN_JAVA) return javaHelp(`Java ${major} is too old.`);
      return null;
    }

    // ------------------------------------------------------------ install

    // Picks the release asset for this platform: the bundle with Java, or the plain jar.
    function pickAsset(assets) {
      return assets.find(a => BUNDLE ? a.name.endsWith(BUNDLE.suffix) : /^Suwayomi-Server-v[\d.]+\.jar$/.test(a.name));
    }

    async function resolveDownloadUrl() {
      try {
        const res = await ctx.fetch("https://api.github.com/repos/Suwayomi/Suwayomi-Server/releases/latest", {
          headers: { Accept: "application/vnd.github+json" },
        });
        const asset = pickAsset((await res.json()).assets || []);
        if (asset) return asset.browser_download_url;
      } catch (e) {
        console.warn("[suwayomi] GitHub lookup failed, using pinned release:", e);
      }
      const name = `Suwayomi-Server-${PINNED}${BUNDLE ? BUNDLE.suffix : ".jar"}`;
      return `https://github.com/Suwayomi/Suwayomi-Server/releases/download/${PINNED}/${name}`;
    }

    function download(url, dest, label) {
      return new Promise((resolve, reject) => {
        const id = ctx.downloader.download(url, dest, { timeout: 3600 });
        const stop = ctx.downloader.watch(id, p => {
          if (!p) return;
          if (p.status === "completed") { stop && stop(); resolve(); }
          else if (p.status === "error" || p.status === "cancelled") { stop && stop(); reject(new Error(`download failed: ${p.error || p.status}`)); }
          else status.set(`${label} ${Math.floor(p.percentage || 0)}%`);
        });
      });
    }

    function installed() {
      return exists($filepath.join(APP_DIR, JAR)) && (!BUNDLE || exists($filepath.join(APP_DIR, BUNDLE.java)));
    }

    async function installServer() {
      $os.mkdirAll(ROOT, 493); // 0755
      const url = await resolveDownloadUrl();

      if (!BUNDLE) {
        // Plain jar: no archive to unpack.
        $os.mkdirAll($filepath.join(APP_DIR, "bin"), 493);
        await download(url, $filepath.join(APP_DIR, JAR), "Downloading Suwayomi (~100 MB, one time only)…");
        return;
      }

      const archive = $filepath.join(ROOT, BUNDLE.suffix.endsWith(".zip") ? "suwayomi.zip" : "suwayomi.tar.gz");
      const tmp = $filepath.join(ROOT, "extract");
      await download(url, archive, "Downloading Suwayomi (~200–350 MB, one time only)…");

      status.set("Extracting…");
      if (exists(tmp)) $os.removeAll(tmp);
      $os.mkdirAll(tmp, 493);
      if (archive.endsWith(".zip")) {
        $osExtra.unzip(archive, tmp);
      } else {
        // tar keeps the executable bit on jre/bin/java. It ships with macOS and every Linux distro.
        const res = await runCmd("tar", ["-xzf", archive, "-C", tmp]);
        if (res.code !== 0) throw new Error(`could not extract the archive (tar exit ${res.code}): ${res.out.trim()}`);
      }
      const top = $os.readDir(tmp).find(e => e.isDir());
      if (!top) throw new Error("unexpected archive layout");
      if (exists(APP_DIR)) $os.removeAll(APP_DIR);
      $os.rename($filepath.join(tmp, top.name()), APP_DIR);
      $os.removeAll(tmp);
      $os.remove(archive);
      if (!installed()) throw new Error("the bundled Java was not found after extraction");
    }

    // ------------------------------------------------------------ process

    function launch() {
      status.set("Starting Suwayomi…");
      const cmd = $osExtra.asyncCmd(JAVA, ...JAVA_ARGS);
      cmd.getCommand().dir = APP_DIR; // JAVA and JAR are relative to it
      proc = cmd;
      cmd.run((data, err, exitCode) => {
        if (err) console.log("[suwayomi]", $toString(err));
        if (exitCode !== undefined) {
          proc = null;
          running.set(false);
          status.set(`Suwayomi stopped (exit ${exitCode})`);
        }
      });
    }

    function stopServer() {
      if (proc) {
        try { proc.getCommand().process.kill(); } catch (e) { console.warn(e); }
      }
    }

    // ------------------------------------------------------------ repos & extensions

    const EXT_FIELDS = "pkgName name lang versionName iconUrl contentWarning isInstalled hasUpdate isObsolete extensionStore { name }";

    // Plain JS objects (not wrapped Go values) with an absolute icon URL.
    function normalize(e) {
      return {
        pkgName: e.pkgName, name: e.name, lang: e.lang, versionName: e.versionName,
        iconUrl: e.iconUrl ? `http://127.0.0.1:${PORT}${e.iconUrl}` : "",
        contentWarning: e.contentWarning, isInstalled: !!e.isInstalled, hasUpdate: !!e.hasUpdate,
        isObsolete: !!e.isObsolete, store: e.extensionStore ? e.extensionStore.name : "",
      };
    }

    function setBusy(key, on) {
      busyList.set(prev => on ? prev.concat([key]) : prev.filter(k => k !== key));
    }

    async function refreshExtensions() {
      const data = await gql(`mutation { fetchExtensions(input: {}) { extensions { ${EXT_FIELDS} } } }`);
      const list = ((data && data.fetchExtensions && data.fetchExtensions.extensions) || []).map(normalize);
      console.log(`[suwayomi] ${list.length} extensions available`);
      extensions.set(list);
    }

    // Repos are "extension stores" in Suwayomi. addExtensionStore accepts Mihon's index.pb,
    // repo.json and legacy index.min.json URLs, and fetches the store synchronously.
    async function refreshStores() {
      const data = await gql(`{ extensionStores { nodes { indexUrl name } } }`);
      stores.set(((data && data.extensionStores && data.extensionStores.nodes) || []).map(n => ({ indexUrl: n.indexUrl, name: n.name })));
    }

    async function storeOp(fn) {
      setBusy("__repo__", true);
      try {
        await fn();
        await refreshStores();
        await refreshExtensions();
        await trySyncProviders();
      } catch (e) {
        ctx.toast.alert(`Suwayomi: ${e}`);
      } finally {
        setBusy("__repo__", false);
      }
    }

    function addStore(url) {
      return storeOp(async () => {
        const data = await gql(`mutation($u: String!) { addExtensionStore(input: { indexUrl: $u }) { extensionStore { name } } }`, { u: url });
        ctx.toast.success(`Repo added: ${data.addExtensionStore.extensionStore.name}`);
      });
    }

    function removeStore(url) {
      return storeOp(() => gql(`mutation($u: String!) { removeExtensionStore(input: { indexUrl: $u }) { clientMutationId } }`, { u: url }));
    }

    async function extensionAction(pkg, action) {
      if (!pkg || !["install", "update", "uninstall"].includes(action) || busyList.get().includes(pkg)) return;
      setBusy(pkg, true);
      try {
        const data = await gql(`mutation($id: String!, $p: UpdateExtensionPatchInput!) {
          updateExtension(input: { id: $id, patch: $p }) { extension { ${EXT_FIELDS} } }
        }`, { id: pkg, p: { [action]: true } });
        const updated = data && data.updateExtension && data.updateExtension.extension;
        if (updated) {
          const n = normalize(updated);
          extensions.set(prev => prev.map(e => e.pkgName === pkg ? n : e));
        } else {
          await refreshExtensions();
        }
        await trySyncProviders();
        ctx.toast.success(action === "uninstall" ? "Extension removed" : "Extension installed. Its sources are now in the manga Source list.");
      } catch (e) {
        ctx.toast.alert(`Suwayomi: ${e}`);
      } finally {
        setBusy(pkg, false);
      }
    }

    // ------------------------------------------------------------ manga providers

    // Seanime lists one entry per manga provider, so every installed Mihon source gets its own
    // generated provider ("VoraToon (ID) (Suwayomi)") next to the all-sources "suwayomi" one.
    // Files are named suwayomi-src-<sourceId>.json; anything else in the folder is left alone.
    const GEN_PREFIX = "suwayomi-src-";

    function sourceManifest(src) {
      const code = PROVIDER_CODE
        .replace('"__FIXED_SOURCE__"', JSON.stringify(src.id))
        .replace(/\{\{(\w+)\}\}/g, (_, k) => ({ serverUrl: `http://127.0.0.1:${PORT}`, maxSources: "1", multiScanlator: "false" })[k] || "");
      return JSON.stringify({
        id: GEN_PREFIX + src.id.replace(/[^0-9A-Za-z]/g, "n"),
        name: `${src.displayName} (Suwayomi)`,
        version: PROVIDER_VERSION,
        manifestURI: "",
        language: "javascript",
        type: "manga-provider",
        description: `Reads manga from the "${src.displayName}" Mihon source through Suwayomi. Generated by the Suwayomi Launcher plugin.`,
        author: AUTHOR,
        lang: src.lang === "all" ? "multi" : src.lang,
        payload: code,
      }, null, 2);
    }

    // Loads (or unloads) one of our provider files in Seanime through the official plugin API.
    // Seanime asks the user once per provider; if it can't (no UI yet, denied, strict mode), the
    // file is still on disk and Seanime picks it up on its next start.
    async function activate(id, on) {
      if (!ctx.extensions) return false;
      try {
        await (on ? ctx.extensions.enable(id) : ctx.extensions.disable(id));
        return true;
      } catch (e) {
        console.warn(`[suwayomi] could not ${on ? "load" : "unload"} ${id}: ${e}`);
        return false;
      }
    }

    // Installs the all-sources provider, or updates it if this plugin carries a newer version.
    // Returns its id if the file changed.
    function ensureMainProvider() {
      const file = $filepath.join(EXT_DIR, `${MAIN_PROVIDER.id}.json`);
      let current = null;
      try { current = JSON.parse($toString($os.readFile(file))); } catch (e) { /* not installed */ }
      if (current && compareVersions(current.version, MAIN_PROVIDER.version) >= 0) return null;
      $os.writeFile(file, $toBytes(JSON.stringify(MAIN_PROVIDER, null, 2)), 420); // 0644
      return MAIN_PROVIDER.id;
    }

    async function syncProviders() {
      if (!exists(EXT_DIR)) {
        console.warn(`[suwayomi] ${EXT_DIR} not found (custom Seanime data dir?), skipping provider sync`);
        return;
      }
      const added = [], removed = [];
      const main = ensureMainProvider();
      if (main) added.push(main);

      const data = await gql(`{ sources { nodes { id lang displayName extension { pkgName } } } }`);
      const wanted = new Map();
      for (const s of (data && data.sources && data.sources.nodes) || []) {
        if (s.id === "0" || ((s.extension && s.extension.pkgName) || "").endsWith(".tachidesk")) continue;
        const json = sourceManifest(s);
        wanted.set(JSON.parse(json).id, json);
      }

      for (const [id, json] of wanted) {
        const file = $filepath.join(EXT_DIR, `${id}.json`);
        let current = "";
        try { current = $toString($os.readFile(file)); } catch (e) { /* new source */ }
        if (current !== json) {
          $os.writeFile(file, $toBytes(json), 420); // 0644
          added.push(id);
        }
      }
      for (const entry of $os.readDir(EXT_DIR)) {
        const name = entry.name();
        if (!name.startsWith(GEN_PREFIX) || !name.endsWith(".json")) continue;
        const id = name.slice(0, -5);
        if (!wanted.has(id)) removed.push(id); // its extension was uninstalled
      }

      let failed = 0;
      for (const id of removed) {
        if (!(await activate(id, false))) failed++; // unload before the file disappears
        $os.remove($filepath.join(EXT_DIR, `${id}.json`));
      }
      for (const id of added) if (!(await activate(id, true))) failed++;
      if (added.length || removed.length) {
        console.log(`[suwayomi] providers: ${added.length} added/updated, ${removed.length} removed, ${failed} not reloaded`);
      }
      if (failed) ctx.toast.info("Suwayomi: restart Seanime to see the updated manga sources.");
    }

    async function trySyncProviders() {
      try { await syncProviders(); } catch (e) { console.warn("[suwayomi] provider sync failed:", e); }
    }

    // ------------------------------------------------------------ bootstrap

    async function bootstrap() {
      if (busy.get()) return;
      busy.set(true);
      help.set([]);
      try {
        if (!(await ping())) {
          if (!BUNDLE) {
            status.set("Checking Java…");
            const missing = await checkSystemJava();
            if (missing) {
              help.set(missing);
              status.set(`Java ${MIN_JAVA}+ required`);
              return;
            }
          }
          if (!installed()) await installServer();
          launch();
          if (!(await waitUntilUp(240))) throw new Error("Suwayomi did not start. Check Seanime's logs for lines starting with [suwayomi].");
        }
        running.set(true);
        status.set(`Running on 127.0.0.1:${PORT}`);
        await refreshStores();
        await refreshExtensions();
        await trySyncProviders();
      } catch (e) {
        status.set(`Error: ${e}`);
        console.error("[suwayomi]", e);
      } finally {
        busy.set(false);
      }
    }

    // ------------------------------------------------------------ extensions page (webview)

    const page = ctx.newWebview({
      slot: "screen",
      fullWidth: true,
      autoHeight: true,
      sidebar: {
        label: "Mihon Extensions",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
      },
    });

    page.channel.sync("exts", extensions);
    page.channel.sync("stores", stores);
    page.channel.sync("busy", busyList);
    page.channel.sync("status", status);
    page.channel.sync("help", help);

    page.channel.on("ready", () => {
      // Re-push current values so a freshly mounted page isn't empty.
      extensions.set(extensions.get().slice());
      stores.set(stores.get().slice());
      busyList.set(busyList.get().slice());
      help.set(help.get().slice());
      status.set(status.get());
    });
    page.channel.on("ext-action", p => { if (p) extensionAction(p.pkg, p.action); });
    page.channel.on("add-repo", url => { if (typeof url === "string" && url.trim()) addStore(url.trim()); });
    page.channel.on("remove-repo", url => { if (typeof url === "string") removeStore(url); });
    page.channel.on("refresh", () => storeOp(async () => {}));
    page.channel.on("start", () => bootstrap());

    page.setContent(() => WEBVIEW_HTML);

    // ------------------------------------------------------------ tray

    ctx.registerEventHandler("start", () => bootstrap());
    ctx.registerEventHandler("stop", () => stopServer());
    ctx.registerEventHandler("open-page", () => ctx.screen.navigateTo("/webview", { id: "suwayomi-launcher" }));

    tray.render(() => {
      const items = [tray.text(`Status: ${status.get()}`)];
      for (const line of help.get()) items.push(tray.text(line, { style: { fontSize: "12px", opacity: 0.85 } }));
      if (!running.get()) {
        items.push(tray.button({ label: busy.get() ? "Working…" : "Start / Retry", onClick: "start", disabled: busy.get(), size: "sm" }));
      } else {
        const count = extensions.get().filter(e => e.isInstalled).length;
        const updates = extensions.get().filter(e => e.hasUpdate).length;
        items.push(
          tray.text(`${stores.get().length} repo(s) · ${count} installed${updates ? ` · ${updates} update(s)` : ""}`),
          tray.button({ label: "Open Mihon Extensions", onClick: "open-page", size: "sm", intent: "primary" }),
          tray.button({ label: "Stop server", onClick: "stop", size: "sm", intent: "alert-subtle" }),
        );
      }
      return tray.stack(items, { gap: 2 });
    });

    // Give the UI client a moment to connect (needed if Extension Secure Mode prompts), then boot.
    ctx.setTimeout(() => bootstrap(), 3000);
  });
}
