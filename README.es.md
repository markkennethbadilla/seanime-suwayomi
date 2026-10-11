# Seanime × Suwayomi

[English](README.md) · [Bahasa Indonesia](README.id.md) · **Español** · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Français](README.fr.md)

Lee manga en [Seanime](https://seanime.app) con **extensiones de Tachiyomi / Mihon**, mediante Suwayomi.

Java incluido en Windows x64, Linux x64 y macOS. Otros dispositivos necesitan **Java 21+**.

![Página Mihon Extensions en Seanime](docs/screenshots/mihon-extensions.jpg)

## Inicio rápido

1. Abre **Extensions → Add extension** en Seanime. Pega esta URL, pulsa **Install** y luego **Grant** cuando se soliciten permisos.

   ```text
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Cuando Suwayomi esté listo, abre **Mihon Extensions** en la barra lateral. Añade la URL de un repo (`index.min.json`), instala una fuente y pulsa **Allow** para activarla.
3. Abre un manga → **Source** → elige `<fuente> (Suwayomi)`. Empieza a leer.

El primer inicio descarga **200–350 MB una sola vez**. Sigue el progreso en el icono de Suwayomi en la bandeja, arriba en Seanime.

> [!IMPORTANT]
> Este proyecto no proporciona, aloja ni distribuye ningún contenido multimedia. Los usuarios son responsables de obtener el contenido por medios legales y de cumplir las leyes de su país. Las extensiones que aparecen en la aplicación no están afiliadas a este proyecto ni a Seanime, y pueden ser eliminadas si infringen las leyes de derechos de autor.

---

[Funciones](#features) · [Solución de problemas](#solución-de-problemas) · [Plataformas y Java](#plataformas-compatibles) · [Permisos](#permisos) · [Servidor propio](#usar-tu-propio-servidor-de-suwayomi) · [Desarrollo](#desarrollo)

<a id="features"></a>

## Cómo funciona

El launcher descarga [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) portátil, lo ejecuta en segundo plano e instala el proveedor de manga automáticamente.

- **Gestiona extensiones:** añade repos, busca, filtra, instala, actualiza y desinstala desde **Mihon Extensions**.
- **Elige una fuente:** cada fuente instalada aparece en Seanime, p. ej. `Example (EN) (Suwayomi)`. Cambia de fuente si faltan imágenes o capítulos.
- **Busca en varias fuentes:** elige **Suwayomi (Mihon/Tachiyomi)**. **Manual match** muestra la fuente, el número de capítulos y el último capítulo, p. ej. `[Example (EN) · 41 ch · latest 39]`.
- **Imágenes y actualizaciones:** las imágenes usan el proxy de Seanime; el plugin se actualiza con el actualizador de extensiones de Seanime.

| | |
|---|---|
| ![Página de manga con una fuente de Suwayomi](docs/screenshots/manga-source.jpg) | ![Menú de la bandeja de Suwayomi](docs/screenshots/tray.jpg) |
| Los capítulos se cargan desde la fuente `(Suwayomi)` elegida | Estado del servidor en la bandeja |

## Solución de problemas

- **Las fuentes nuevas no aparecen en la lista Source.** Al instalar una fuente, Seanime pregunta *"Allow Suwayomi Launcher to enable …?"*. Haz clic en **Allow**. Si pulsaste Don't Allow o la pregunta no apareció, reinicia Seanime y la fuente se cargará al arrancar.
- **"Suwayomi did not start".** Puede que otro programa esté usando el puerto 4567. Ciérralo, o detén cualquier otro Suwayomi que tengas en marcha, y pulsa **Start / Retry**. Los logs de Seanime muestran líneas que empiezan por `[suwayomi]`.
- **Carpeta de datos de Seanime personalizada** (`--datadir`, Docker): Suwayomi sigue funcionando, pero
  no se pueden generar los proveedores por fuente. Usa "Suwayomi (Mihon/Tachiyomi)" y su ajuste
  **Sources** en su lugar.
- **Extension Secure Mode** activado: Seanime pregunta antes de que el plugin ejecute un comando o toque archivos. Acepta los avisos en el primer inicio.
- **Una fuente falla o tiene Cloudflare.** Eso depende de la propia extensión de Mihon. Prueba otra fuente para el mismo manga.

## Plataformas compatibles

| Plataforma | Qué ocurre |
|---|---|
| Windows x64 | Sin configuración (Java incluido en la descarga) |
| Linux x64 | Sin configuración (Java incluido) |
| macOS Apple Silicon / Intel | Sin configuración (Java incluido) |
| Cualquier otra (Linux ARM64, Raspberry Pi, …) | Necesita **Java 21+** instalado, ver abajo |

### Java 21 en otros dispositivos

En estos dispositivos el plugin usa el `Suwayomi-Server.jar` normal con el Java del sistema. Si falta
Java o es demasiado antiguo, la bandeja y la página Mihon Extensions te lo indican, junto con qué instalar:

| Sistema | Comando |
|---|---|
| Debian / Ubuntu / Raspberry Pi OS | `sudo apt install openjdk-21-jre-headless` |
| Fedora | `sudo dnf install java-21-openjdk-headless` |
| Arch | `sudo pacman -S jre21-openjdk-headless` |
| Alpine | `sudo apk add openjdk21-jre-headless` |
| Cualquier SO | [Temurin 21 JRE](https://adoptium.net/temurin/releases/?version=21) |

Compruébalo con `java -version` (debe mostrar 21 o superior) y pulsa **Start / Retry**.
Si Seanime ya estaba abierto cuando instalaste Java, reinícialo para que vea el nuevo `PATH`.

## Permisos

El launcher es un plugin de Seanime con los scopes `system` y `extensions`. Lo que puede hacer:

| Permiso | Motivo |
|---|---|
| Leer/escribir `<config>/Seanime/suwayomi/**` | La descarga de Suwayomi, sus datos y sus extensiones instaladas |
| Escribir `<config>/Seanime/extensions/suwayomi.json` y `suwayomi-src-*.json` | Los proveedores de manga que genera (uno por fuente). No toca ningún otro archivo de extensiones |
| Activar/desactivar las extensiones `suwayomi` y `suwayomi-src-*` | Cargar al instante el proveedor de una fuente nueva. Seanime te pregunta antes: *"Allow Suwayomi Launcher to enable …?"* |
| Ejecutar `jre/bin/java[.exe] … -jar bin/Suwayomi-Server.jar` | Iniciar Suwayomi, escuchando solo en `127.0.0.1:4567` |
| Ejecutar `java -version`, `tar -xzf` | Comprobar Java (otras plataformas) y descomprimir la descarga (Linux/macOS) |
| Red: `127.0.0.1`, GitHub | El servidor local de Suwayomi y las releases de Suwayomi en GitHub |

`<config>` es `%APPDATA%` en Windows, `~/Library/Application Support` en macOS y `~/.config` en Linux.
Es la carpeta de datos predeterminada de Seanime.

## Usar tu propio servidor de Suwayomi

Si ya ejecutas Suwayomi (p. ej. en Docker), puedes instalar solo el proveedor:

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Después configura su **Suwayomi server URL** y, opcionalmente, un usuario y una contraseña. También puedes
añadir `https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` como repositorio.

## Desinstalar

Elimina "Suwayomi Launcher", "Suwayomi (Mihon/Tachiyomi)" y los proveedores `… (Suwayomi)` en
**Extensions**. Después borra la carpeta `<config>/Seanime/suwayomi`, que contiene la descarga, los datos de Suwayomi y sus extensiones.

## Desarrollo

Consulta la sección [Development del README en inglés](README.md#development).

## Créditos y aviso legal

Construido sobre [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), que ejecuta
extensiones de [Mihon](https://mihon.app)/Tachiyomi, y sobre [Seanime](https://github.com/5rahim/seanime).
Este proyecto no aloja ningún contenido ni incluye extensiones. Las fuentes provienen de repos que añades tú mismo.

[Licencia MIT](LICENSE)
