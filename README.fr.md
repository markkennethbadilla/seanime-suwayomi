# Seanime × Suwayomi

[English](README.md) · [Bahasa Indonesia](README.id.md) · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · **Français**

Lisez des mangas dans [Seanime](https://seanime.app) avec les **extensions Tachiyomi / Mihon**, grâce à Suwayomi.

Java inclus sur Windows x64, Linux x64 et macOS. Les autres appareils nécessitent **Java 21+**.

![Page Mihon Extensions dans Seanime](docs/screenshots/mihon-extensions.jpg)

## Démarrage rapide

1. Ouvrez **Extensions → Add extension** dans Seanime. Collez cette URL, cliquez sur **Install**, puis sur **Grant** lorsque les autorisations sont demandées.

   ```text
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Une fois Suwayomi prêt, ouvrez **Mihon Extensions** dans la barre latérale. Ajoutez l’URL d’un dépôt (`index.min.json`), installez une source, puis cliquez sur **Allow** pour l’activer.
3. Ouvrez un manga → **Source** → choisissez `<source> (Suwayomi)`. Bonne lecture.

Le premier démarrage télécharge **200–350 Mo une seule fois**. Suivez la progression dans l’icône Suwayomi de la barre d’état, en haut de Seanime.

> [!IMPORTANT]
> Ce projet ne fournit, n'héberge ni ne distribue aucun contenu multimédia. Il appartient aux utilisateurs d'obtenir les contenus par des moyens légaux et de respecter les lois de leur pays. Les extensions listées dans l'application ne sont affiliées ni à ce projet ni à Seanime, et peuvent être retirées si elles enfreignent le droit d'auteur.

---

[Fonctionnalités](#features) · [Dépannage](#dépannage) · [Plateformes et Java](#plateformes-prises-en-charge) · [Autorisations](#autorisations) · [Votre serveur](#utiliser-votre-propre-serveur-suwayomi) · [Développement](#développement)

<a id="features"></a>

## Fonctionnement

Le launcher télécharge [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) portable, le lance en arrière-plan et installe automatiquement le fournisseur de mangas.

- **Gérez les extensions :** ajoutez des dépôts, recherchez, filtrez, installez, mettez à jour et désinstallez depuis **Mihon Extensions**.
- **Choisissez une source :** chaque source installée apparaît dans Seanime, par ex. `Example (EN) (Suwayomi)`. Changez de source si des images ou des chapitres manquent.
- **Cherchez dans plusieurs sources :** choisissez **Suwayomi (Mihon/Tachiyomi)**. **Manual match** affiche la source, le nombre de chapitres et le dernier chapitre, par ex. `[Example (EN) · 41 ch · latest 39]`.
- **Images et mises à jour :** les images passent par le proxy de Seanime ; le plugin utilise le système de mise à jour des extensions de Seanime.

| | |
|---|---|
| ![Page de manga avec une source Suwayomi](docs/screenshots/manga-source.jpg) | ![Menu Suwayomi dans la barre](docs/screenshots/tray.jpg) |
| Les chapitres viennent de la source `(Suwayomi)` choisie | État du serveur dans la barre |

## Dépannage

- **Les nouvelles sources n'apparaissent pas dans la liste Source.** Quand vous installez une source, Seanime demande *« Allow Suwayomi Launcher to enable …? »*. Cliquez sur **Allow**. Si vous avez cliqué sur Don't Allow, ou si la question ne s'est pas affichée, redémarrez Seanime : la source sera chargée au démarrage.
- **« Suwayomi did not start ».** Un autre programme utilise peut-être le port 4567. Fermez-le, ou arrêtez tout autre Suwayomi en cours d'exécution, puis cliquez sur **Start / Retry**. Les logs de Seanime contiennent des lignes commençant par `[suwayomi]`.
- **Dossier de données Seanime personnalisé** (`--datadir`, Docker) : Suwayomi fonctionne toujours, mais
  les fournisseurs par source ne peuvent pas être générés. Utilisez plutôt « Suwayomi (Mihon/Tachiyomi) » et son
  paramètre **Sources**.
- **Extension Secure Mode** activé : Seanime demande votre accord avant que le plugin exécute une commande ou touche à des fichiers. Acceptez les demandes au premier démarrage.
- **Une source ne marche pas ou est derrière Cloudflare.** Cela vient de l'extension Mihon elle-même. Essayez une autre source pour le même manga.

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

## Utiliser votre propre serveur Suwayomi

Si vous faites déjà tourner Suwayomi (par ex. dans Docker), vous pouvez installer uniquement le fournisseur :

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Renseignez ensuite son **Suwayomi server URL**, et éventuellement un nom d'utilisateur et un mot de passe. Vous pouvez aussi
ajouter `https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` comme dépôt.

## Désinstallation

Supprimez « Suwayomi Launcher », « Suwayomi (Mihon/Tachiyomi) » et les fournisseurs `… (Suwayomi)` dans
**Extensions**. Supprimez ensuite le dossier `<config>/Seanime/suwayomi`, qui contient le téléchargement, les données de Suwayomi et ses extensions.

## Développement

Voir la section [Development du README en anglais](README.md#development).

## Crédits et avertissement

Basé sur [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), qui exécute les
extensions [Mihon](https://mihon.app)/Tachiyomi, et sur [Seanime](https://github.com/5rahim/seanime).
Ce projet n'héberge aucun contenu et ne fournit aucune extension. Les sources proviennent des dépôts que vous ajoutez vous-même.

[Licence MIT](LICENSE)
