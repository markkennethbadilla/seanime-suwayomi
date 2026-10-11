# Seanime × Suwayomi: extensiones de Tachiyomi/Mihon para el manga de Seanime

[English](README.md) · [Bahasa Indonesia](README.id.md) · **Español** · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Français](README.fr.md)

Lee manga en [Seanime](https://seanime.app) desde cualquier **extensión de Tachiyomi / Mihon**
(el repo de keiyoushi y otros), **sin configurar nada**. No necesitas instalar Java ni Docker ni
editar archivos de configuración.

El plugin descarga una versión portable de [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server)
y la ejecuta en segundo plano. Suwayomi es lo que ejecuta las extensiones de Mihon en un PC.

- **Página Mihon Extensions** en la barra lateral de Seanime: añade repos y luego busca, filtra, instala, actualiza y desinstala extensiones.
- **Cada fuente instalada aparece en la lista "Source" de manga de Seanime**, p. ej. `Komiku (ID) (Suwayomi)` o `MangaDex (Suwayomi)`. Si una fuente tiene imágenes rotas o le faltan capítulos, cambia a otra.
- **"Suwayomi (Mihon/Tachiyomi)"** busca en todas las fuentes a la vez. En **Manual match**, cada resultado muestra su fuente, su número de capítulos y su último capítulo, p. ej. `[Komiku (ID) · 41 ch · latest 39]`.
- **Las imágenes se cargan** a través del proxy de imágenes de Seanime.
- **Las actualizaciones son automáticas** mediante el actualizador de extensiones de Seanime.

> [!IMPORTANT]
> Este proyecto no proporciona, aloja ni distribuye ningún contenido multimedia. Los usuarios son responsables de obtener el contenido por medios legales y de cumplir las leyes de su país. Las extensiones que aparecen en la aplicación no están afiliadas a este proyecto ni a Seanime, y pueden ser eliminadas si infringen las leyes de derechos de autor.

## Instalación (1 minuto)

1. En Seanime, abre **Extensions** → **Add extension** y pega esta URL:

   ```
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Haz clic en **Install**. El plugin mostrará **"Permissions required"**. Haz clic en **Grant**.
   Consulta [Permisos](#permisos) para ver exactamente qué solicita.
3. Espera al primer inicio. Suwayomi se descarga **una sola vez** (unos 200–350 MB). El progreso aparece en el icono de Suwayomi en la bandeja, arriba en Seanime.
4. Abre **Mihon Extensions** en la barra lateral y añade la URL de un repo, por ejemplo un
   `index.min.json` de Mihon/keiyoushi. Después instala las fuentes que quieras.
5. Seanime pregunta *"Allow Suwayomi Launcher to enable …?"* por cada fuente nueva. Haz clic en **Allow**.
6. Abre cualquier manga en Seanime → **Source** → elige `<fuente> (Suwayomi)`.

El launcher también instala el proveedor de manga "Suwayomi (Mihon/Tachiyomi)", así que no tienes que añadirlo tú.

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

## Solución de problemas

- **Las fuentes nuevas no aparecen en la lista Source.** Al instalar una fuente, Seanime pregunta *"Allow Suwayomi Launcher to enable …?"*. Haz clic en **Allow**. Si pulsaste Don't Allow o la pregunta no apareció, reinicia Seanime y la fuente se cargará al arrancar.
- **"Suwayomi did not start".** Puede que otro programa esté usando el puerto 4567. Ciérralo, o detén cualquier otro Suwayomi que tengas en marcha, y pulsa **Start / Retry**. Los logs de Seanime muestran líneas que empiezan por `[suwayomi]`.
- **Carpeta de datos de Seanime personalizada** (`--datadir`, Docker): Suwayomi sigue funcionando, pero
  no se pueden generar los proveedores por fuente. Usa "Suwayomi (Mihon/Tachiyomi)" y su ajuste
  **Sources** en su lugar.
- **Extension Secure Mode** activado: Seanime pregunta antes de que el plugin ejecute un comando o toque archivos. Acepta los avisos en el primer inicio.
- **Una fuente falla o tiene Cloudflare.** Eso depende de la propia extensión de Mihon. Prueba otra fuente para el mismo manga.

## Desinstalar

Elimina "Suwayomi Launcher", "Suwayomi (Mihon/Tachiyomi)" y los proveedores `… (Suwayomi)` en
**Extensions**. Después borra la carpeta `<config>/Seanime/suwayomi`, que contiene la descarga, los datos de Suwayomi y sus extensiones.

## Usar tu propio servidor de Suwayomi

Si ya ejecutas Suwayomi (p. ej. en Docker), puedes instalar solo el proveedor:

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Después configura su **Suwayomi server URL** y, opcionalmente, un usuario y una contraseña. También puedes
añadir `https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` como repositorio.

## Desarrollo

Consulta la sección [Development del README en inglés](README.md#development).

## Créditos y aviso legal

Construido sobre [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), que ejecuta
extensiones de [Mihon](https://mihon.app)/Tachiyomi, y sobre [Seanime](https://github.com/5rahim/seanime).
Este proyecto no aloja ningún contenido ni incluye extensiones. Las fuentes provienen de repos que añades tú mismo.

[Licencia MIT](LICENSE)
