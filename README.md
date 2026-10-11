# Seanime × Suwayomi: Tachiyomi/Mihon extensions for Seanime manga

**English** · [Bahasa Indonesia](README.id.md)

Read manga in [Seanime](https://seanime.app) from any **Tachiyomi / Mihon extension**
(the keiyoushi repo and others), with **zero setup**. You don't need to install Java or Docker or
edit any config files.

The plugin downloads a portable [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server)
and runs it in the background. Suwayomi is what runs the Mihon extensions on a PC.

- **Mihon Extensions page** in the Seanime sidebar: add repos, then search, filter, install, update and uninstall extensions.
- **Every installed source appears in Seanime's manga "Source" list**, e.g. `Komiku (ID) (Suwayomi)` or `MangaDex (Suwayomi)`. If one source has broken images or missing chapters, switch to another one.
- **"Suwayomi (Mihon/Tachiyomi)"** searches all sources at once. In **Manual match**, each result shows its source, its chapter count and its latest chapter, e.g. `[Komiku (ID) · 41 ch · latest 39]`.
- **Images load** through Seanime's image proxy.
- **Updates are automatic** through Seanime's extension updater.

## Install (1 minute)

1. In Seanime, open **Extensions** → **Add extension** and paste this URL:

   ```
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Click **Install**. The plugin then shows **"Permissions required"**. Click **Grant**.
   See [Permissions](#permissions) for exactly what it asks for.
3. Wait for the first start. Suwayomi is downloaded **once** (about 200–350 MB). Progress shows in the Suwayomi tray icon at the top of Seanime.
4. Open **Mihon Extensions** in the sidebar and add a repo URL, for example a Mihon/keiyoushi
   `index.min.json`. Then install the sources you want.
5. Seanime asks *"Allow Suwayomi Launcher to enable …?"* for each new source. Click **Allow**.
6. Open any manga in Seanime → **Source** → pick `<source> (Suwayomi)`.

The launcher also installs the "Suwayomi (Mihon/Tachiyomi)" manga provider, so you don't need to add it yourself.

## Supported platforms

| Platform | What happens |
|---|---|
| Windows x64 | Zero setup (Java included in the download) |
| Linux x64 | Zero setup (Java included) |
| macOS Apple Silicon / Intel | Zero setup (Java included) |
| Anything else (Linux ARM64, Raspberry Pi, …) | Needs **Java 21+** installed, see below |

### Java 21 on other devices

On these devices the plugin uses the plain `Suwayomi-Server.jar` with the system's Java. If Java
is missing or too old, the tray and the Mihon Extensions page tell you so, along with what to install:

| System | Command |
|---|---|
| Debian / Ubuntu / Raspberry Pi OS | `sudo apt install openjdk-21-jre-headless` |
| Fedora | `sudo dnf install java-21-openjdk-headless` |
| Arch | `sudo pacman -S jre21-openjdk-headless` |
| Alpine | `sudo apk add openjdk21-jre-headless` |
| Any OS | [Temurin 21 JRE](https://adoptium.net/temurin/releases/?version=21) |

Check it with `java -version` (it must print 21 or higher), then press **Start / Retry**.
If Seanime was already running when you installed Java, restart Seanime so it sees the new `PATH`.

## Permissions

The launcher is a Seanime plugin with the `system` and `extensions` scopes. What it may do:

| Permission | Why |
|---|---|
| Read/write `<config>/Seanime/suwayomi/**` | The Suwayomi download, its data and its installed extensions |
| Write `<config>/Seanime/extensions/suwayomi.json` and `suwayomi-src-*.json` | The manga providers it generates (one per source). No other extension files are touched |
| Enable/disable `suwayomi` and `suwayomi-src-*` extensions | Load a new source's provider right away. Seanime asks you first: *"Allow Suwayomi Launcher to enable …?"* |
| Run `jre/bin/java[.exe] … -jar bin/Suwayomi-Server.jar` | Start Suwayomi, bound to `127.0.0.1:4567` only |
| Run `java -version`, `tar -xzf` | Java check (other platforms) and unpacking the download (Linux/macOS) |
| Network: `127.0.0.1`, GitHub | The local Suwayomi server and Suwayomi's GitHub releases |

`<config>` is `%APPDATA%` on Windows, `~/Library/Application Support` on macOS and `~/.config` on Linux.
That is Seanime's default data folder.

## Troubleshooting

- **New sources don't appear in the Source list.** When you install a source, Seanime asks *"Allow Suwayomi Launcher to enable …?"*. Click **Allow**. If you clicked Don't Allow, or the question didn't show up, restart Seanime and the source is loaded at startup.
- **"Suwayomi did not start".** Another program may be using port 4567. Close it, or stop any other Suwayomi you run, then press **Start / Retry**. Seanime's logs show lines starting with `[suwayomi]`.
- **Custom Seanime data folder** (`--datadir`, Docker): Suwayomi still works, but the
  per-source providers can't be generated. Use "Suwayomi (Mihon/Tachiyomi)" and its
  **Sources** setting instead.
- **Extension Secure Mode** is on: Seanime asks before the plugin runs a command or touches files. Accept the prompts on first start.
- **A source fails or has Cloudflare.** That's the Mihon extension itself. Try another source for the same manga.

## Uninstall

Remove "Suwayomi Launcher", "Suwayomi (Mihon/Tachiyomi)" and the `… (Suwayomi)` providers in
**Extensions**. Then delete the folder `<config>/Seanime/suwayomi`, which holds the download, the Suwayomi data and its extensions.

## Using your own Suwayomi server

If you already run Suwayomi (e.g. in Docker), you can install only the provider:

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Then set its **Suwayomi server URL**, and optionally a username and password. You can also
add `https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` as a repository.

## Development

Requires Node.js 18+. There are no dependencies.

```
node build.js             # src/ → dist/
node build.js --install   # also copy into this machine's Seanime extensions folder
node scripts/test.js      # run the plugin against a fake Seanime on Windows/Linux/macOS/ARM
node scripts/check.js     # dist/ up to date, payloads parse, no machine-specific paths
node scripts/types.js     # download Seanime's .d.ts files into types/ for editor hints
```

| File | Purpose |
|---|---|
| `src/provider.js` | Manga provider (search, chapters, pages over Suwayomi's GraphQL API) |
| `src/plugin.js` | Launcher plugin (download, start, Mihon Extensions page, provider generation) |
| `src/webview.html` | The Mihon Extensions page |
| `dist/` | Built manifests, **committed** because Seanime installs and updates from these URLs |

To release a new version, bump `VERSION` in `build.js`, run `node build.js`, then commit and push.
Seanime offers the update to everyone who installed from the URL.

## Credits & disclaimer

Built on [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), which runs
[Mihon](https://mihon.app)/Tachiyomi extensions, and on [Seanime](https://github.com/5rahim/seanime).
This project hosts no content and ships no extensions. Sources come from repos that you add yourself.

[MIT License](LICENSE)
