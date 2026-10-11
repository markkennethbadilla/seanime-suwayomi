# Seanime × Suwayomi

[English](README.md) · **Bahasa Indonesia** · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Français](README.fr.md)

Baca manga di [Seanime](https://seanime.app) dengan **extension Tachiyomi / Mihon**, melalui Suwayomi.

Java sudah termasuk untuk Windows x64, Linux x64, dan macOS. Perangkat lain perlu **Java 21+**.

![Halaman Mihon Extensions di Seanime](docs/screenshots/mihon-extensions.jpg)

## Mulai di sini

1. Buka **Extensions → Add extension** di Seanime. Paste URL berikut, klik **Install**, lalu **Grant** saat diminta izin.

   ```text
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Setelah Suwayomi siap, buka **Mihon Extensions** di sidebar. Tambahkan URL repo (`index.min.json`), install source, lalu klik **Allow** untuk mengaktifkannya.
3. Buka manga → **Source** → pilih `<source> (Suwayomi)`. Mulai baca.

Start pertama mengunduh **200–350 MB sekali saja**. Pantau progres di ikon tray Suwayomi di bagian atas Seanime.

> [!IMPORTANT]
> Proyek ini tidak menyediakan, meng-host, atau mendistribusikan konten media apa pun. Pengguna bertanggung jawab untuk memperoleh media secara legal dan mematuhi hukum yang berlaku di wilayahnya. Extension yang tercantum di aplikasi tidak berafiliasi dengan proyek ini maupun Seanime, dan dapat dihapus jika melanggar hukum hak cipta.

---

[Fitur](#features) · [Troubleshooting](#troubleshooting) · [Platform & Java](#platform-yang-didukung) · [Izin](#izin) · [Server sendiri](#memakai-server-suwayomi-sendiri) · [Development](#development)

<a id="features"></a>

## Cara kerja & fitur

Launcher mengunduh [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) portable, menjalankannya di background, dan memasang provider manga secara otomatis.

- **Kelola extension:** tambah repo, cari, filter, install, update, dan uninstall lewat **Mihon Extensions**.
- **Pilih source:** setiap source terpasang muncul di Seanime, misalnya `Example (EN) (Suwayomi)`. Ganti source kalau gambar rusak atau chapter kurang.
- **Cari lintas source:** pilih **Suwayomi (Mihon/Tachiyomi)**. **Manual match** menampilkan source, jumlah chapter, dan chapter terbaru, misalnya `[Example (EN) · 41 ch · latest 39]`.
- **Gambar & update:** gambar lewat proxy Seanime; update plugin lewat updater extension Seanime.

| | |
|---|---|
| ![Halaman manga dengan source Suwayomi](docs/screenshots/manga-source.jpg) | ![Menu tray Suwayomi](docs/screenshots/tray.jpg) |
| Chapter dimuat dari source `(Suwayomi)` yang dipilih | Status server di tray |

## Troubleshooting

- **Source baru tidak muncul di daftar Source.** Saat source diinstall, Seanime bertanya *"Allow Suwayomi Launcher to enable …?"*. Klik **Allow**. Kalau terlanjur klik Don't Allow atau pertanyaannya tidak muncul, restart Seanime; source akan dimuat saat startup.
- **"Suwayomi did not start".** Mungkin port 4567 dipakai program lain. Tutup program itu atau matikan Suwayomi lain yang berjalan, lalu tekan **Start / Retry**. Log Seanime menampilkan baris yang diawali `[suwayomi]`.
- **Folder data Seanime custom** (`--datadir`, Docker): Suwayomi tetap jalan, tapi provider per source tidak bisa dibuat. Pakai "Suwayomi (Mihon/Tachiyomi)" dengan setting **Sources**.
- **Extension Secure Mode** aktif: Seanime akan bertanya dulu sebelum plugin menjalankan command atau mengakses file. Setujui prompt-nya saat start pertama.
- **Source error atau terkena Cloudflare.** Itu masalah extension Mihon-nya sendiri. Coba source lain untuk manga yang sama.

## Platform yang didukung

| Platform | Keterangan |
|---|---|
| Windows x64 | Tanpa setup (Java sudah termasuk dalam unduhan) |
| Linux x64 | Tanpa setup (Java sudah termasuk) |
| macOS Apple Silicon / Intel | Tanpa setup (Java sudah termasuk) |
| Lainnya (Linux ARM64, Raspberry Pi, …) | Perlu **Java 21+** terinstall, lihat di bawah |

### Java 21 untuk perangkat lain

Di perangkat ini plugin memakai `Suwayomi-Server.jar` dengan Java dari sistem. Kalau Java belum ada
atau versinya terlalu lama, tray dan halaman Mihon Extensions akan memberi tahu, lengkap dengan apa yang perlu diinstall:

| Sistem | Perintah |
|---|---|
| Debian / Ubuntu / Raspberry Pi OS | `sudo apt install openjdk-21-jre-headless` |
| Fedora | `sudo dnf install java-21-openjdk-headless` |
| Arch | `sudo pacman -S jre21-openjdk-headless` |
| Alpine | `sudo apk add openjdk21-jre-headless` |
| OS apa pun | [Temurin 21 JRE](https://adoptium.net/temurin/releases/?version=21) |

Cek dengan `java -version` (hasilnya harus 21 atau lebih tinggi), lalu tekan **Start / Retry**.
Kalau Seanime sudah berjalan saat Java diinstall, restart Seanime supaya `PATH` yang baru terbaca.

## Izin

Launcher adalah plugin Seanime dengan scope `system` dan `extensions`. Yang boleh dilakukannya:

| Izin | Alasan |
|---|---|
| Baca/tulis `<config>/Seanime/suwayomi/**` | Unduhan Suwayomi, datanya dan extension yang terinstall |
| Tulis `<config>/Seanime/extensions/suwayomi.json` dan `suwayomi-src-*.json` | Provider manga yang dibuatnya (satu per source). File extension lain tidak disentuh |
| Enable/disable extension `suwayomi` dan `suwayomi-src-*` | Supaya provider source baru langsung aktif. Seanime bertanya dulu: *"Allow Suwayomi Launcher to enable …?"* |
| Jalankan `jre/bin/java[.exe] … -jar bin/Suwayomi-Server.jar` | Menyalakan Suwayomi, hanya di `127.0.0.1:4567` |
| Jalankan `java -version`, `tar -xzf` | Cek Java (platform lain) dan ekstrak unduhan (Linux/macOS) |
| Jaringan: `127.0.0.1`, GitHub | Server Suwayomi lokal dan rilis Suwayomi di GitHub |

`<config>` adalah `%APPDATA%` di Windows, `~/Library/Application Support` di macOS dan `~/.config` di Linux.
Itu adalah folder data default Seanime.

## Memakai server Suwayomi sendiri

Kalau kamu sudah menjalankan Suwayomi sendiri (misalnya di Docker), cukup install provider-nya:

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Lalu isi **Suwayomi server URL** (dan username/password kalau perlu). Bisa juga tambahkan
`https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` sebagai repository.

## Uninstall

Hapus "Suwayomi Launcher", "Suwayomi (Mihon/Tachiyomi)" dan provider `… (Suwayomi)` di
**Extensions**. Setelah itu hapus folder `<config>/Seanime/suwayomi`, yang berisi unduhan, data Suwayomi dan extension-nya.

## Development

Lihat bagian [Development di README bahasa Inggris](README.md#development).

## Kredit & disclaimer

Dibangun di atas [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), yang
menjalankan extension [Mihon](https://mihon.app)/Tachiyomi, dan [Seanime](https://github.com/5rahim/seanime).
Proyek ini tidak meng-host konten apa pun dan tidak menyertakan extension. Source berasal dari repo yang kamu tambahkan sendiri.

[Lisensi MIT](LICENSE)
