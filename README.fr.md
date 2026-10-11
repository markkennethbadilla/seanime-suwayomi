# Seanime × Suwayomi : extensions Tachiyomi/Mihon pour les mangas dans Seanime

[English](README.md) · [Bahasa Indonesia](README.id.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · **Français**

Lisez des mangas dans [Seanime](https://seanime.app) depuis n'importe quelle **extension Tachiyomi / Mihon**
(le dépôt keiyoushi et d'autres), **sans aucune configuration**. Pas besoin d'installer Java ou Docker, ni
de modifier des fichiers de configuration.

Le plugin télécharge une version portable de [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server)
et la lance en arrière-plan. C'est Suwayomi qui fait tourner les extensions Mihon sur un PC.

- **Page Mihon Extensions** dans la barre latérale de Seanime : ajoutez des dépôts, puis recherchez, filtrez, installez, mettez à jour et désinstallez des extensions.
- **Chaque source installée apparaît dans la liste « Source » des mangas de Seanime**, par ex. `Komiku (ID) (Suwayomi)` ou `MangaDex (Suwayomi)`. Si une source a des images cassées ou des chapitres manquants, passez à une autre.
- **« Suwayomi (Mihon/Tachiyomi) »** cherche dans toutes les sources à la fois. Dans **Manual match**, chaque résultat affiche sa source, son nombre de chapitres et son dernier chapitre, par ex. `[Komiku (ID) · 41 ch · latest 39]`.
- **Les images se chargent** via le proxy d'images de Seanime.
- **Les mises à jour sont automatiques** grâce au système de mise à jour des extensions de Seanime.

> [!IMPORTANT]
> Ce projet ne fournit, n'héberge ni ne distribue aucun contenu multimédia. Il appartient aux utilisateurs d'obtenir les contenus par des moyens légaux et de respecter les lois de leur pays. Les extensions listées dans l'application ne sont affiliées ni à ce projet ni à Seanime, et peuvent être retirées si elles enfreignent le droit d'auteur.

## Installation (1 minute)

1. Dans Seanime, ouvrez **Extensions** → **Add extension** et collez cette URL :

   ```
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Cliquez sur **Install**. Le plugin affiche **« Permissions required »**. Cliquez sur **Grant**.
   Voir [Autorisations](#autorisations) pour savoir exactement ce qu'il demande.
3. Attendez le premier démarrage. Suwayomi n'est téléchargé **qu'une seule fois** (environ 200–350 Mo). La progression s'affiche dans l'icône Suwayomi de la barre d'état, en haut de Seanime.
4. Ouvrez **Mihon Extensions** dans la barre latérale et ajoutez l'URL d'un dépôt, par exemple un
   `index.min.json` de Mihon/keiyoushi. Installez ensuite les sources que vous voulez.
5. Pour chaque nouvelle source, Seanime demande *« Allow Suwayomi Launcher to enable …? »*. Cliquez sur **Allow**.
6. Ouvrez n'importe quel manga dans Seanime → **Source** → choisissez `<source> (Suwayomi)`.

Le launcher installe aussi le fournisseur de mangas « Suwayomi (Mihon/Tachiyomi) », vous n'avez donc pas à l'ajouter vous-même.

## Plateformes prises en charge

| Plateforme | Ce qui se passe |
|---|---|
| Windows x64 | Aucune configuration (Java inclus dans le téléchargement) |
| Linux x64 | Aucune configuration (Java inclus) |
| macOS Apple Silicon / Intel | Aucune configuration (Java inclus) |
| Tout le reste (Linux ARM64, Raspberry Pi, …) | Nécessite **Java 21+** installé, voir ci-dessous |

### Java 21 sur les autres appareils

Sur ces appareils, le plugin utilise le `Suwayomi-Server.jar` standard avec le Java du système. Si Java
est absent ou trop ancien, la barre d'état et la page Mihon Extensions vous le signalent et indiquent quoi installer :

| Système | Commande |
|---|---|
| Debian / Ubuntu / Raspberry Pi OS | `sudo apt install openjdk-21-jre-headless` |
| Fedora | `sudo dnf install java-21-openjdk-headless` |
| Arch | `sudo pacman -S jre21-openjdk-headless` |
| Alpine | `sudo apk add openjdk21-jre-headless` |
| N'importe quel OS | [Temurin 21 JRE](https://adoptium.net/temurin/releases/?version=21) |

Vérifiez avec `java -version` (la version doit être 21 ou plus), puis cliquez sur **Start / Retry**.
Si Seanime était déjà ouvert quand vous avez installé Java, redémarrez-le pour qu'il prenne en compte le nouveau `PATH`.

## Autorisations

Le launcher est un plugin Seanime avec les scopes `system` et `extensions`. Ce qu'il peut faire :

| Autorisation | Pourquoi |
|---|---|
| Lire/écrire `<config>/Seanime/suwayomi/**` | Le téléchargement de Suwayomi, ses données et ses extensions installées |
| Écrire `<config>/Seanime/extensions/suwayomi.json` et `suwayomi-src-*.json` | Les fournisseurs de mangas qu'il génère (un par source). Aucun autre fichier d'extension n'est modifié |
| Activer/désactiver les extensions `suwayomi` et `suwayomi-src-*` | Charger immédiatement le fournisseur d'une nouvelle source. Seanime vous demande d'abord : *« Allow Suwayomi Launcher to enable …? »* |
| Exécuter `jre/bin/java[.exe] … -jar bin/Suwayomi-Server.jar` | Démarrer Suwayomi, en écoute uniquement sur `127.0.0.1:4567` |
| Exécuter `java -version`, `tar -xzf` | Vérifier Java (autres plateformes) et décompresser le téléchargement (Linux/macOS) |
| Réseau : `127.0.0.1`, GitHub | Le serveur Suwayomi local et les releases de Suwayomi sur GitHub |

`<config>` correspond à `%APPDATA%` sous Windows, `~/Library/Application Support` sous macOS et `~/.config` sous Linux.
C'est le dossier de données par défaut de Seanime.

## Dépannage

- **Les nouvelles sources n'apparaissent pas dans la liste Source.** Quand vous installez une source, Seanime demande *« Allow Suwayomi Launcher to enable …? »*. Cliquez sur **Allow**. Si vous avez cliqué sur Don't Allow, ou si la question ne s'est pas affichée, redémarrez Seanime : la source sera chargée au démarrage.
- **« Suwayomi did not start ».** Un autre programme utilise peut-être le port 4567. Fermez-le, ou arrêtez tout autre Suwayomi en cours d'exécution, puis cliquez sur **Start / Retry**. Les logs de Seanime contiennent des lignes commençant par `[suwayomi]`.
- **Dossier de données Seanime personnalisé** (`--datadir`, Docker) : Suwayomi fonctionne toujours, mais
  les fournisseurs par source ne peuvent pas être générés. Utilisez plutôt « Suwayomi (Mihon/Tachiyomi) » et son
  paramètre **Sources**.
- **Extension Secure Mode** activé : Seanime demande votre accord avant que le plugin exécute une commande ou touche à des fichiers. Acceptez les demandes au premier démarrage.
- **Une source ne marche pas ou est derrière Cloudflare.** Cela vient de l'extension Mihon elle-même. Essayez une autre source pour le même manga.

## Désinstallation

Supprimez « Suwayomi Launcher », « Suwayomi (Mihon/Tachiyomi) » et les fournisseurs `… (Suwayomi)` dans
**Extensions**. Supprimez ensuite le dossier `<config>/Seanime/suwayomi`, qui contient le téléchargement, les données de Suwayomi et ses extensions.

## Utiliser votre propre serveur Suwayomi

Si vous faites déjà tourner Suwayomi (par ex. dans Docker), vous pouvez installer uniquement le fournisseur :

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Renseignez ensuite son **Suwayomi server URL**, et éventuellement un nom d'utilisateur et un mot de passe. Vous pouvez aussi
ajouter `https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` comme dépôt.

## Développement

Voir la section [Development du README en anglais](README.md#development).

## Crédits et avertissement

Basé sur [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), qui exécute les
extensions [Mihon](https://mihon.app)/Tachiyomi, et sur [Seanime](https://github.com/5rahim/seanime).
Ce projet n'héberge aucun contenu et ne fournit aucune extension. Les sources proviennent des dépôts que vous ajoutez vous-même.

[Licence MIT](LICENSE)
