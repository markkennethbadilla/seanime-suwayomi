// Runs the launcher plugin against a fake Seanime runtime on several platforms and checks that
// every command and file access it makes is allowed by the manifest's permissions, the same way
// Seanime does (exact command name, fixed values / regex / $PATH validators, $CONFIG globs).
//   node scripts/test.js
const assert = require("assert");
const path = require("path");
const { launcher, provider } = require("../build.js");

const RELEASE = "v9.9.9999";
const ASSETS = [
  "-windows-x64.zip", "-windows-x64.msi", "-linux-x64.tar.gz", "-macOS-x64.tar.gz", "-macOS-arm64.tar.gz",
  "-appimage.AppImage", "-debian-all.deb", ".jar",
].map(s => ({ name: `Suwayomi-Server-${RELEASE}${s}`, browser_download_url: `https://github.com/dl/Suwayomi-Server-${RELEASE}${s}` }));

const SOURCES = [
  { id: "0", lang: "localsourcelang", displayName: "Local source", extension: null },
  { id: "4838485846640015979", lang: "id", displayName: "Komiku (ID)", extension: { pkgName: "eu.kanade.tachiyomi.extension.id.komiku" } },
  { id: "2499283573021220255", lang: "all", displayName: "MangaDex", extension: { pkgName: "eu.kanade.tachiyomi.extension.all.mangadex" } },
  { id: "123", lang: "en", displayName: "Suwayomi", extension: { pkgName: "eu.kanade.tachiyomi.extension.all.tachidesk" } },
];

function globToRegex(p) {
  let re = "";
  for (let i = 0; i < p.length; i++) {
    if (p.startsWith("**", i)) { re += ".*"; i++; }
    else if (p[i] === "*") re += "[^/]*";
    else re += p[i].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

async function scenario(name, opts) {
  const sep = opts.platform === "windows" ? "\\" : "/";
  const fp = opts.platform === "windows" ? path.win32 : path.posix;
  const CONFIG = opts.platform === "windows" ? "C:\\Users\\someone\\AppData\\Roaming"
    : opts.platform === "darwin" ? "/Users/someone/Library/Application Support" : "/home/someone/.config";
  const norm = p => p.split("\\").join("/");
  const allowed = list => list.map(p => globToRegex(norm(p.replace("$CONFIG", CONFIG))));
  const perms = launcher.plugin.permissions.allow;
  const readRe = allowed(perms.readPaths), writeRe = allowed(perms.writePaths);
  const canRead = p => readRe.some(r => r.test(norm(p))) || writeRe.some(r => r.test(norm(p)));
  const canWrite = p => writeRe.some(r => r.test(norm(p)));

  // ---- fake filesystem: path -> "dir" | string contents
  const fs = new Map();
  const mkdirp = p => { for (let d = p; d && !fs.has(d); d = fp.dirname(d)) { fs.set(d, "dir"); if (fp.dirname(d) === d) break; } };
  const put = (p, c) => { mkdirp(fp.dirname(p)); fs.set(p, c); };
  const SEANIME = fp.join(CONFIG, "Seanime");
  mkdirp(fp.join(SEANIME, "extensions"));
  put(fp.join(SEANIME, "extensions", "suwayomi-src-999.json"), "{}"); // stale generated provider
  put(fp.join(SEANIME, "extensions", "other.json"), "{}");            // must be left alone
  if (opts.preinstalled) {
    const app = fp.join(SEANIME, "suwayomi", "app");
    put(fp.join(app, "bin", "Suwayomi-Server.jar"), "jar");
    put(fp.join(app, ...opts.javaRel.split("/")), "java");
  }

  const log = { downloads: [], commands: [], extensions: [], toasts: [] };
  let serverUp = false;
  const check = (ok, what) => { if (!ok) throw new Error(`[${name}] not allowed: ${what}`); };

  // ---- command allowlist, same rules as Seanime's isAllowedCommand
  function allowedCommand(cmd, args) {
    return perms.commandScopes.some(scope => {
      if (scope.command !== cmd) return false;
      if (args.length > scope.args.length) return false;
      return scope.args.every((a, i) => {
        if (i >= args.length) return false;
        if (a.value) return a.value === args[i];
        if (a.validator === "$PATH") return fs.has(args[i]) ? canRead(args[i]) : canWrite(args[i]);
        return new RegExp(a.validator).test(args[i]);
      });
    });
  }

  const $os = {
    platform: opts.platform, arch: opts.arch,
    configDir() { check(canRead(CONFIG), `read ${CONFIG}`); return CONFIG; },
    stat(p) { check(canRead(p), `stat ${p}`); if (!fs.has(p)) throw new Error("not found"); return {}; },
    mkdirAll(p) { check(canWrite(p), `mkdir ${p}`); mkdirp(p); },
    readFile(p) { check(canRead(p), `read ${p}`); if (!fs.has(p) || fs.get(p) === "dir") throw new Error("not found"); return fs.get(p); },
    writeFile(p, data) { check(canWrite(p), `write ${p}`); put(p, data); },
    readDir(p) {
      check(canRead(p), `readDir ${p}`);
      return [...fs.keys()].filter(k => fp.dirname(k) === p && k !== p)
        .map(k => ({ name: () => fp.basename(k), isDir: () => fs.get(k) === "dir" }));
    },
    rename(a, b) {
      check(canWrite(a) && canWrite(b), `rename ${a} -> ${b}`);
      for (const k of [...fs.keys()]) if (k === a || k.startsWith(a + sep)) { fs.set(b + k.slice(a.length), fs.get(k)); fs.delete(k); }
    },
    remove(p) { check(canWrite(p), `remove ${p}`); fs.delete(p); },
    removeAll(p) { check(canWrite(p), `removeAll ${p}`); for (const k of [...fs.keys()]) if (k === p || k.startsWith(p + sep)) fs.delete(k); },
  };

  const releaseTop = d => fp.join(d, `Suwayomi-Server-${RELEASE}-x`);
  const unpack = dest => {
    put(fp.join(releaseTop(dest), "bin", "Suwayomi-Server.jar"), "jar");
    put(fp.join(releaseTop(dest), ...opts.javaRel.split("/")), "java");
  };

  const $osExtra = {
    unzip(src, dest) { check(canRead(src) && canWrite(dest), `unzip ${src}`); unpack(dest); },
    asyncCmd(cmd, ...args) {
      check(allowedCommand(cmd, args), `command ${cmd} ${args.join(" ")}`);
      const command = { dir: "", process: { kill() { serverUp = false; } } };
      return {
        getCommand: () => command,
        run(cb) {
          log.commands.push({ cmd, args, dir: command.dir });
          setTimeout(() => {
            if (cmd === "tar") { unpack(args[3]); cb(undefined, undefined, 0); }
            else if (args[0] === "-version") {
              if (opts.systemJava == null) throw new Error(`exec: "java": executable file not found in $PATH`);
              cb(undefined, `openjdk version "${opts.systemJava}" 2024-01-16`); cb(undefined, undefined, 0);
            } else {
              assert.strictEqual(command.dir, fp.join(SEANIME, "suwayomi", "app"), "java must run from the app folder");
              assert.ok(fs.has(fp.join(command.dir, ...cmd.split("/"))) || cmd === "java", `${cmd} must exist in the app folder`);
              serverUp = true;
            }
          }, 0);
        },
      };
    },
  };

  // asyncCmd for a missing binary fails at run time in Go; emulate by throwing from run for the probe
  const origAsync = $osExtra.asyncCmd;
  $osExtra.asyncCmd = (cmd, ...args) => {
    const c = origAsync(cmd, ...args);
    if (cmd === "java" && args[0] === "-version" && opts.systemJava == null) c.run = () => { throw new Error("executable file not found"); };
    return c;
  };

  const state = v => { let x = v; return { get: () => x, set: n => { x = typeof n === "function" ? n(x) : n; } }; };
  const json = obj => ({ ok: true, json: async () => obj });
  const ctx = {
    state,
    newTray: () => ({ render() {} }),
    newWebview: () => ({ channel: { sync() {}, on() {} }, setContent() {} }),
    registerEventHandler() {},
    screen: { navigateTo() {} },
    // Seanime's extensions API: reloads the extension from its file, which must exist.
    extensions: {
      async enable(id) { assert.ok(fs.has(extFile({ fp, SEANIME }, `${id}.json`)), `enable(${id}) before its file exists`); log.extensions.push(`+${id}`); return true; },
      async disable(id) { assert.ok(fs.has(extFile({ fp, SEANIME }, `${id}.json`)), `disable(${id}) after its file was removed`); log.extensions.push(`-${id}`); return true; },
    },
    toast: { success: m => log.toasts.push(m), info: m => log.toasts.push(m), alert: m => log.toasts.push("ALERT " + m) },
    setTimeout: (f, ms) => setTimeout(f, Math.min(ms, 5)),
    downloader: {
      download(url, dest) { check(canWrite(dest), `download to ${dest}`); log.downloads.push({ url, dest }); put(dest, "bytes"); return url; },
      watch(id, cb) { setTimeout(() => cb({ status: "completed", percentage: 100 }), 0); return () => {}; },
    },
    async fetch(url, init = {}) {
      const host = new URL(url).hostname;
      check(perms.networkAccess.allowedDomains.includes(host), `fetch ${host}`);
      if (url.includes("api.github.com")) return json({ assets: ASSETS });
      if (url.endsWith("/api/graphql")) {
        if (!serverUp) throw new Error("connection refused");
        const q = JSON.parse(init.body).query;
        if (q.includes("sources")) return json({ data: { sources: { nodes: SOURCES } } });
        if (q.includes("extensionStores")) return json({ data: { extensionStores: { nodes: [] } } });
        if (q.includes("fetchExtensions")) return json({ data: { fetchExtensions: { extensions: [] } } });
        return json({ data: { __typename: "Query" } });
      }
      throw new Error(`unexpected fetch ${url}`);
    },
  };

  let registered;
  const sandbox = {
    $ui: { register: cb => { registered = cb; } },
    $os, $osExtra,
    $filepath: { join: (...p) => fp.join(...p) },
    $toString: x => String(x), $toBytes: x => x,
    console: { log() {}, warn() {}, error: (...a) => log.toasts.push("ERROR " + a.join(" ")) },
  };
  new Function(...Object.keys(sandbox), `${launcher.payload}\ninit();`)(...Object.values(sandbox));

  let st, help;
  const origState = ctx.state;
  ctx.state = v => { const s = origState(v); if (v === "Checking…") st = s; if (Array.isArray(v) && !help && v.length === 0) help = s; return s; };
  registered(ctx);
  for (let i = 0; i < 200 && !/Running|Error|required/.test(st.get()); i++) await new Promise(r => setTimeout(r, 10));
  return { status: st.get(), help: help.get(), log, fs, SEANIME, fp };
}

const extFile = (r, n) => r.fp.join(r.SEANIME, "extensions", n);

(async () => {
  const cases = [
    { name: "windows x64 fresh", platform: "windows", arch: "amd64", javaRel: "jre/bin/java.exe", asset: "-windows-x64.zip", cmd: "jre/bin/java.exe" },
    { name: "linux x64 fresh", platform: "linux", arch: "amd64", javaRel: "jre/bin/java", asset: "-linux-x64.tar.gz", cmd: "jre/bin/java", tar: true },
    { name: "macOS arm64 fresh", platform: "darwin", arch: "arm64", javaRel: "jre/bin/java", asset: "-macOS-arm64.tar.gz", cmd: "jre/bin/java", tar: true },
    { name: "macOS x64 fresh", platform: "darwin", arch: "amd64", javaRel: "jre/bin/java", asset: "-macOS-x64.tar.gz", cmd: "jre/bin/java", tar: true },
    { name: "windows x64 already installed", platform: "windows", arch: "amd64", javaRel: "jre/bin/java.exe", preinstalled: true, cmd: "jre/bin/java.exe" },
    { name: "linux arm64 with Java 21", platform: "linux", arch: "arm64", javaRel: "", systemJava: "21.0.2", asset: ".jar", cmd: "java" },
    { name: "linux arm64 without Java", platform: "linux", arch: "arm64", javaRel: "", systemJava: null, expectHelp: "Java was not found" },
    { name: "linux arm64 with Java 17", platform: "linux", arch: "arm64", javaRel: "", systemJava: "17.0.9", expectHelp: "Java 17 is too old" },
  ];

  for (const c of cases) {
    const r = await scenario(c.name, c);
    try {
      if (c.expectHelp) {
        assert.match(r.status, /Java 21\+ required/);
        assert.ok(r.help.some(l => l.includes(c.expectHelp)), "help explains the problem");
        assert.ok(r.help.some(l => l.includes("apt install openjdk-21-jre-headless")), "help lists install commands");
        assert.strictEqual(r.log.downloads.length, 0, "nothing downloaded without Java");
      } else {
        assert.match(r.status, /^Running/, `status: ${r.status} ${r.log.toasts.join(" | ")}`);
        if (c.preinstalled) assert.strictEqual(r.log.downloads.length, 0, "no re-download");
        else assert.ok(r.log.downloads[0].url.endsWith(c.asset), `downloaded ${r.log.downloads[0].url}`);
        assert.strictEqual(r.log.commands.some(x => x.cmd === "tar"), !!c.tar, "tar used only for .tar.gz");
        const run = r.log.commands.find(x => x.args.includes("-jar"));
        assert.strictEqual(run.cmd, c.cmd);
        // generated providers
        assert.ok(r.fs.has(extFile(r, "suwayomi.json")), "main provider installed");
        assert.strictEqual(JSON.parse(r.fs.get(extFile(r, "suwayomi.json"))).version, provider.version);
        const komiku = JSON.parse(r.fs.get(extFile(r, "suwayomi-src-4838485846640015979.json")));
        assert.strictEqual(komiku.name, "Komiku (ID) (Suwayomi)");
        assert.ok(komiku.payload.includes('"4838485846640015979"') && !komiku.payload.includes("{{"));
        assert.strictEqual(JSON.parse(r.fs.get(extFile(r, "suwayomi-src-2499283573021220255.json"))).lang, "multi");
        assert.ok(!r.fs.has(extFile(r, "suwayomi-src-123.json")), "Suwayomi-to-Suwayomi source skipped");
        assert.ok(!r.fs.has(extFile(r, "suwayomi-src-999.json")), "stale provider removed");
        assert.ok(r.fs.has(extFile(r, "other.json")), "unrelated extension untouched");
        assert.deepStrictEqual(r.log.extensions.sort(), [
          "+suwayomi", "+suwayomi-src-2499283573021220255", "+suwayomi-src-4838485846640015979", "-suwayomi-src-999",
        ], "providers loaded/unloaded in Seanime");
        assert.ok(!r.log.toasts.some(t => t.includes("restart")), "no restart needed");
      }
      console.log("ok  ", c.name);
    } catch (e) {
      console.error("FAIL", c.name, "\n    ", e.message);
      process.exitCode = 1;
    }
  }
})();
