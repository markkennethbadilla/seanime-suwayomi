# Seanime × Suwayomi: Extension Tachiyomi/Mihon untuk manga di Seanime

[English](README.md) · **Bahasa Indonesia**

Baca manga di [Seanime](https://seanime.app) dari **extension Tachiyomi / Mihon** mana pun
(repo keiyoushi dan lainnya), **tanpa setup**. Tidak perlu install Java, tidak perlu Docker, dan
tidak perlu mengedit config.

Plugin ini mengunduh [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) versi portable
lalu menjalankannya di background. Suwayomi adalah program yang menjalankan extension Mihon di PC.

- **Halaman Mihon Extensions** di sidebar Seanime: tambah repo, cari, filter, lalu install, update atau uninstall extension.
- **Setiap source yang terinstall muncul di daftar "Source" manga Seanime**, misalnya `Komiku (ID) (Suwayomi)` atau `MangaDex (Suwayomi)`. Kalau gambar di satu source rusak atau chapternya kurang, tinggal ganti ke source lain.
- **"Suwayomi (Mihon/Tachiyomi)"** mencari di semua source sekaligus. Di **Manual match**, setiap hasil menampilkan nama source, jumlah chapter dan chapter terakhirnya, misalnya `[Komiku (ID) · 41 ch · latest 39]`.
- **Gambar dimuat lewat image proxy Seanime.**
- **Update otomatis** lewat updater extension Seanime.

## Instalasi (1 menit)

1. Di Seanime, buka **Extensions** → **Add extension**, lalu paste URL ini:

   ```
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Klik **Install**. Plugin akan berstatus **"Permissions required"**. Klik **Grant**.
   Rincian izinnya ada di bagian [Izin](#izin).
3. Tunggu start pertama. Suwayomi diunduh **sekali saja** (sekitar 200–350 MB). Progresnya terlihat di ikon tray Suwayomi di bagian atas Seanime.
4. Buka **Mihon Extensions** di sidebar, tambahkan URL repo (misalnya `index.min.json` Mihon/keiyoushi), lalu install source yang kamu mau.
5. Untuk setiap source baru, Seanime bertanya *"Allow Suwayomi Launcher to enable …?"*. Klik **Allow**.
6. Buka manga apa saja di Seanime → **Source** → pilih `<source> (Suwayomi)`.

Provider manga "Suwayomi (Mihon/Tachiyomi)" ikut dipasang oleh launcher, jadi tidak perlu ditambahkan manual.

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

## Troubleshooting

- **Source baru tidak muncul di daftar Source.** Saat source diinstall, Seanime bertanya *"Allow Suwayomi Launcher to enable …?"*. Klik **Allow**. Kalau terlanjur klik Don't Allow atau pertanyaannya tidak muncul, restart Seanime; source akan dimuat saat startup.
- **"Suwayomi did not start".** Mungkin port 4567 dipakai program lain. Tutup program itu atau matikan Suwayomi lain yang berjalan, lalu tekan **Start / Retry**. Log Seanime menampilkan baris yang diawali `[suwayomi]`.
- **Folder data Seanime custom** (`--datadir`, Docker): Suwayomi tetap jalan, tapi provider per source tidak bisa dibuat. Pakai "Suwayomi (Mihon/Tachiyomi)" dengan setting **Sources**.
- **Extension Secure Mode** aktif: Seanime akan bertanya dulu sebelum plugin menjalankan command atau mengakses file. Setujui prompt-nya saat start pertama.
- **Source error atau terkena Cloudflare.** Itu masalah extension Mihon-nya sendiri. Coba source lain untuk manga yang sama.

## Uninstall

Hapus "Suwayomi Launcher", "Suwayomi (Mihon/Tachiyomi)" dan provider `… (Suwayomi)` di
**Extensions**. Setelah itu hapus folder `<config>/Seanime/suwayomi`, yang berisi unduhan, data Suwayomi dan extension-nya.

## Memakai server Suwayomi sendiri

Kalau kamu sudah menjalankan Suwayomi sendiri (misalnya di Docker), cukup install provider-nya:

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Lalu isi **Suwayomi server URL** (dan username/password kalau perlu). Bisa juga tambahkan
`https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` sebagai repository.

## Development

Lihat bagian [Development di README bahasa Inggris](README.md#development).

## Kredit & disclaimer

Dibangun di atas [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), yang
menjalankan extension [Mihon](https://mihon.app)/Tachiyomi, dan [Seanime](https://github.com/5rahim/seanime).
Proyek ini tidak meng-host konten apa pun dan tidak menyertakan extension. Source berasal dari repo yang kamu tambahkan sendiri.

[Lisensi MIT](LICENSE)
