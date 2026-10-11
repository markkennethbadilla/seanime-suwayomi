# Seanime × Suwayomi：在 Seanime 中使用 Tachiyomi/Mihon 扩展看漫画

[English](README.md) · [Bahasa Indonesia](README.id.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · **简体中文** · [Русский](README.ru.md) · [Français](README.fr.md)

在 [Seanime](https://seanime.app) 中通过任意 **Tachiyomi / Mihon 扩展**（keiyoushi 仓库等）阅读漫画，
**无需任何配置**。不用安装 Java 或 Docker，也不用修改任何配置文件。

插件会下载便携版 [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) 并在后台运行。
Suwayomi 负责在电脑上运行 Mihon 扩展。

- Seanime 侧边栏中的 **Mihon Extensions 页面**：添加仓库，然后搜索、筛选、安装、更新和卸载扩展。
- **每个已安装的源都会出现在 Seanime 漫画的 "Source" 列表中**，例如 `Komiku (ID) (Suwayomi)` 或 `MangaDex (Suwayomi)`。如果某个源图片加载失败或缺少章节，换一个源即可。
- **"Suwayomi (Mihon/Tachiyomi)"** 可同时搜索所有源。在 **Manual match** 中，每条结果会显示所属源、章节数和最新章节，例如 `[Komiku (ID) · 41 ch · latest 39]`。
- **图片通过 Seanime 的图片代理加载**。
- **通过 Seanime 的扩展更新器自动更新**。

> [!IMPORTANT]
> 本项目不提供、托管或分发任何媒体内容。用户应通过合法途径获取媒体内容，并遵守当地法律。应用中列出的扩展与本项目及 Seanime 均无关联，如违反版权法可能会被移除。

## 安装（1 分钟）

1. 在 Seanime 中打开 **Extensions** → **Add extension**，粘贴以下 URL：

   ```
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. 点击 **Install**。插件会显示 **"Permissions required"**，点击 **Grant**。
   具体申请了哪些权限，请看[权限](#权限)。
3. 等待首次启动。Suwayomi 只需下载**一次**（约 200–350 MB）。进度显示在 Seanime 顶部的 Suwayomi 托盘图标中。
4. 在侧边栏打开 **Mihon Extensions**，添加一个仓库 URL，例如 Mihon/keiyoushi 的
   `index.min.json`，然后安装你需要的源。
5. 每添加一个新源，Seanime 都会询问 *"Allow Suwayomi Launcher to enable …?"*，点击 **Allow**。
6. 在 Seanime 中打开任意漫画 → **Source** → 选择 `<源名称> (Suwayomi)`。

启动器还会自动安装 "Suwayomi (Mihon/Tachiyomi)" 漫画提供器，无需手动添加。

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

## 故障排除

- **新源没有出现在 Source 列表中。** 安装源时，Seanime 会询问 *"Allow Suwayomi Launcher to enable …?"*，请点击 **Allow**。如果你点了 Don't Allow，或者没有弹出询问，重启 Seanime，源会在启动时加载。
- **"Suwayomi did not start"。** 可能有其他程序占用了 4567 端口。关闭该程序，或停止你正在运行的其他 Suwayomi，然后点击 **Start / Retry**。Seanime 日志中以 `[suwayomi]` 开头的行会显示相关信息。
- **自定义 Seanime 数据目录**（`--datadir`、Docker）：Suwayomi 仍可使用，但无法生成按源划分的提供器。
  请改用 "Suwayomi (Mihon/Tachiyomi)" 及其 **Sources** 设置。
- **已开启 Extension Secure Mode**：插件执行命令或访问文件前，Seanime 会先询问。首次启动时请同意这些提示。
- **某个源出错或有 Cloudflare 验证。** 这是该 Mihon 扩展本身的问题。请为同一部漫画换一个源。

## 卸载

在 **Extensions** 中移除 "Suwayomi Launcher"、"Suwayomi (Mihon/Tachiyomi)" 以及所有 `… (Suwayomi)` 提供器。
然后删除 `<config>/Seanime/suwayomi` 文件夹，其中包含下载文件、Suwayomi 数据及其扩展。

## 使用自己的 Suwayomi 服务器

如果你已经在运行 Suwayomi（例如在 Docker 中），可以只安装提供器：

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

然后设置它的 **Suwayomi server URL**，如有需要再填写用户名和密码。你也可以把
`https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` 添加为仓库。

## 开发

请参阅[英文 README 的 Development 部分](README.md#development)。

## 致谢与免责声明

基于 [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server)（MPL-2.0，用于运行
[Mihon](https://mihon.app)/Tachiyomi 扩展）和 [Seanime](https://github.com/5rahim/seanime) 构建。
本项目不托管任何内容，也不附带任何扩展。所有源都来自你自己添加的仓库。

[MIT 许可证](LICENSE)
