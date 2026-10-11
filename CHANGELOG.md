# Changelog

## 1.0.0

- First public release.
- **Suwayomi Launcher plugin**
  - Downloads and runs a portable Suwayomi-Server: Windows x64, Linux x64 and macOS (Intel, Apple Silicon) with Java included. Other devices use the system Java 21+, with clear install instructions when it's missing.
  - Adds a "Mihon Extensions" page with repos, search, language/repo/status filters and install/update/uninstall.
  - Installs the "Suwayomi (Mihon/Tachiyomi)" provider, plus one provider per installed source ("Komiku (ID) (Suwayomi)", …). They are added and removed automatically.
  - No machine-specific paths: everything is resolved from the OS config folder at runtime.
- **Manga provider**
  - Manual match shows the source, the distinct chapter count and the latest chapter.
  - Chapter titles show the source.
  - Images load through Seanime's image proxy.
