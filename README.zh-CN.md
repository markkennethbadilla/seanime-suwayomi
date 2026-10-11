# Seanime × Suwayomi

[English](README.md) · [Bahasa Indonesia](README.id.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · **简体中文** · [Русский](README.ru.md) · [Français](README.fr.md)

通过 Suwayomi，在 [Seanime](https://seanime.app) 中使用 **Tachiyomi / Mihon 扩展**阅读漫画。

Windows x64、Linux x64 和 macOS 已包含 Java。其他设备需要 **Java 21+**。

![Seanime 中的 Mihon Extensions 页面](docs/screenshots/mihon-extensions.jpg)

## 快速开始

1. 在 Seanime 中打开 **Extensions → Add extension**。粘贴下方 URL，点击 **Install**，提示权限时点击 **Grant**。

   ```text
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Suwayomi 就绪后，在侧边栏打开 **Mihon Extensions**。添加仓库 URL（`index.min.json`），安装漫画源，然后点击 **Allow** 启用。
3. 打开漫画 → **Source** → 选择 `<源名称> (Suwayomi)`，开始阅读。

首次启动需下载 **200–350 MB，仅一次**。可在 Seanime 顶部的 Suwayomi 托盘图标中查看进度。

> [!IMPORTANT]
> 本项目不提供、托管或分发任何媒体内容。用户应通过合法途径获取媒体内容，并遵守当地法律。应用中列出的扩展与本项目及 Seanime 均无关联，如违反版权法可能会被移除。

---

[功能](#features) · [故障排除](#故障排除) · [平台与 Java](#支持的平台) · [权限](#权限) · [自有服务器](#使用自己的-suwayomi-服务器) · [开发](#开发)

<a id="features"></a>

## 工作原理与功能

启动器会下载便携版 [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server)，在后台运行，并自动安装漫画提供器。

- **管理扩展：**在 **Mihon Extensions** 中添加仓库、搜索、筛选、安装、更新和卸载扩展。
- **选择漫画源：**每个已安装的源都会出现在 Seanime 中，例如 `Example (EN) (Suwayomi)`。图片或章节缺失时可切换源。
- **跨源搜索：**选择 **Suwayomi (Mihon/Tachiyomi)**。**Manual match** 显示源名称、章节数和最新章节，例如 `[Example (EN) · 41 ch · latest 39]`。
- **图片与更新：**图片通过 Seanime 的代理加载；插件通过 Seanime 的扩展更新器更新。

| | |
|---|---|
| ![使用 Suwayomi 源的漫画页面](docs/screenshots/manga-source.jpg) | ![Suwayomi 托盘菜单](docs/screenshots/tray.jpg) |
| 章节从所选的 `(Suwayomi)` 源加载 | 托盘中的服务器状态 |

## 故障排除

- **新源没有出现在 Source 列表中。** 安装源时，Seanime 会询问 *"Allow Suwayomi Launcher to enable …?"*，请点击 **Allow**。如果你点了 Don't Allow，或者没有弹出询问，重启 Seanime，源会在启动时加载。
- **"Suwayomi did not start"。** 可能有其他程序占用了 4567 端口。关闭该程序，或停止你正在运行的其他 Suwayomi，然后点击 **Start / Retry**。Seanime 日志中以 `[suwayomi]` 开头的行会显示相关信息。
- **自定义 Seanime 数据目录**（`--datadir`、Docker）：Suwayomi 仍可使用，但无法生成按源划分的提供器。
  请改用 "Suwayomi (Mihon/Tachiyomi)" 及其 **Sources** 设置。
- **已开启 Extension Secure Mode**：插件执行命令或访问文件前，Seanime 会先询问。首次启动时请同意这些提示。
- **某个源出错或有 Cloudflare 验证。** 这是该 Mihon 扩展本身的问题。请为同一部漫画换一个源。

## 支持的平台

| 平台 | 说明 |
|---|---|
| Windows x64 | 零配置（下载内容已包含 Java） |
| Linux x64 | 零配置（已包含 Java） |
| macOS Apple Silicon / Intel | 零配置（已包含 Java） |
| 其他平台（Linux ARM64、树莓派等） | 需要安装 **Java 21+**，见下文 |

### 在其他设备上安装 Java 21

在这些设备上，插件会使用普通的 `Suwayomi-Server.jar` 和系统自带的 Java。如果缺少 Java 或版本过旧，
托盘和 Mihon Extensions 页面会提示你，并告诉你该安装什么：

| 系统 | 命令 |
|---|---|
| Debian / Ubuntu / Raspberry Pi OS | `sudo apt install openjdk-21-jre-headless` |
| Fedora | `sudo dnf install java-21-openjdk-headless` |
| Arch | `sudo pacman -S jre21-openjdk-headless` |
| Alpine | `sudo apk add openjdk21-jre-headless` |
| 任意系统 | [Temurin 21 JRE](https://adoptium.net/temurin/releases/?version=21) |

用 `java -version` 检查（必须显示 21 或更高），然后点击 **Start / Retry**。
如果安装 Java 时 Seanime 已在运行，请重启 Seanime，让它读取新的 `PATH`。

## 权限

启动器是一个拥有 `system` 和 `extensions` 作用域的 Seanime 插件。它可以执行的操作：

| 权限 | 用途 |
|---|---|
| 读写 `<config>/Seanime/suwayomi/**` | Suwayomi 的下载文件、数据和已安装的扩展 |
| 写入 `<config>/Seanime/extensions/suwayomi.json` 和 `suwayomi-src-*.json` | 生成的漫画提供器（每个源一个）。不会改动其他任何扩展文件 |
| 启用/禁用 `suwayomi` 和 `suwayomi-src-*` 扩展 | 立即加载新源的提供器。Seanime 会先询问你：*"Allow Suwayomi Launcher to enable …?"* |
| 运行 `jre/bin/java[.exe] … -jar bin/Suwayomi-Server.jar` | 启动 Suwayomi，仅监听 `127.0.0.1:4567` |
| 运行 `java -version`、`tar -xzf` | 检查 Java（其他平台）以及解压下载文件（Linux/macOS） |
| 网络：`127.0.0.1`、GitHub | 本地 Suwayomi 服务器以及 Suwayomi 在 GitHub 上的发布版本 |

`<config>` 在 Windows 上是 `%APPDATA%`，在 macOS 上是 `~/Library/Application Support`，在 Linux 上是 `~/.config`。
也就是 Seanime 的默认数据目录。

## 使用自己的 Suwayomi 服务器

如果你已经在运行 Suwayomi（例如在 Docker 中），可以只安装提供器：

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

然后设置它的 **Suwayomi server URL**，如有需要再填写用户名和密码。你也可以把
`https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` 添加为仓库。

## 卸载

在 **Extensions** 中移除 "Suwayomi Launcher"、"Suwayomi (Mihon/Tachiyomi)" 以及所有 `… (Suwayomi)` 提供器。
然后删除 `<config>/Seanime/suwayomi` 文件夹，其中包含下载文件、Suwayomi 数据及其扩展。

## 开发

请参阅[英文 README 的 Development 部分](README.md#development)。

## 致谢与免责声明

基于 [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server)（MPL-2.0，用于运行
[Mihon](https://mihon.app)/Tachiyomi 扩展）和 [Seanime](https://github.com/5rahim/seanime) 构建。
本项目不托管任何内容，也不附带任何扩展。所有源都来自你自己添加的仓库。

[MIT 许可证](LICENSE)
