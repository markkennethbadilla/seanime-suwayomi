# Seanime × Suwayomi

[English](README.md) · [Bahasa Indonesia](README.id.md) · [Español](README.es.md) · **Português (BR)** · [简体中文](README.zh-CN.md) · [Русский](README.ru.md) · [Français](README.fr.md)

Leia mangá no [Seanime](https://seanime.app) com **extensões do Tachiyomi / Mihon**, via Suwayomi.

Java incluído no Windows x64, Linux x64 e macOS. Outros dispositivos precisam do **Java 21+**.

![Página Mihon Extensions no Seanime](docs/screenshots/mihon-extensions.jpg)

## Início rápido

1. Abra **Extensions → Add extension** no Seanime. Cole esta URL, clique em **Install** e depois em **Grant** quando as permissões forem solicitadas.

   ```text
   https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi-launcher.json
   ```

2. Quando o Suwayomi estiver pronto, abra **Mihon Extensions** na barra lateral. Adicione a URL de um repo (`index.min.json`), instale uma fonte e clique em **Allow** para ativá-la.
3. Abra um mangá → **Source** → escolha `<fonte> (Suwayomi)`. Comece a ler.

A primeira inicialização baixa **200–350 MB uma única vez**. Acompanhe o progresso no ícone do Suwayomi na bandeja, no topo do Seanime.

> [!IMPORTANT]
> Este projeto não fornece, hospeda nem distribui nenhum conteúdo de mídia. Os usuários são responsáveis por obter o conteúdo por meios legais e por cumprir as leis locais. As extensões listadas no app não têm afiliação com este projeto nem com o Seanime, e podem ser removidas se violarem leis de direitos autorais.

---

[Recursos](#features) · [Solução de problemas](#solução-de-problemas) · [Plataformas e Java](#plataformas-suportadas) · [Permissões](#permissões) · [Servidor próprio](#usando-seu-próprio-servidor-suwayomi) · [Desenvolvimento](#desenvolvimento)

<a id="features"></a>

## Como funciona

O launcher baixa o [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) portátil, o executa em segundo plano e instala o provedor de mangá automaticamente.

- **Gerencie extensões:** adicione repos, pesquise, filtre, instale, atualize e desinstale em **Mihon Extensions**.
- **Escolha uma fonte:** cada fonte instalada aparece no Seanime, por ex. `Example (EN) (Suwayomi)`. Troque de fonte se faltarem imagens ou capítulos.
- **Pesquise em várias fontes:** escolha **Suwayomi (Mihon/Tachiyomi)**. **Manual match** mostra a fonte, a quantidade de capítulos e o capítulo mais recente, por ex. `[Example (EN) · 41 ch · latest 39]`.
- **Imagens e atualizações:** as imagens usam o proxy do Seanime; o plugin usa o atualizador de extensões do Seanime.

| | |
|---|---|
| ![Página de mangá com uma fonte do Suwayomi](docs/screenshots/manga-source.jpg) | ![Menu da bandeja do Suwayomi](docs/screenshots/tray.jpg) |
| Os capítulos vêm da fonte `(Suwayomi)` escolhida | Status do servidor na bandeja |

## Solução de problemas

- **Fontes novas não aparecem na lista Source.** Ao instalar uma fonte, o Seanime pergunta *"Allow Suwayomi Launcher to enable …?"*. Clique em **Allow**. Se você clicou em Don't Allow, ou a pergunta não apareceu, reinicie o Seanime e a fonte será carregada na inicialização.
- **"Suwayomi did not start".** Outro programa pode estar usando a porta 4567. Feche-o, ou pare qualquer outro Suwayomi que esteja rodando, e clique em **Start / Retry**. Os logs do Seanime mostram linhas começando com `[suwayomi]`.
- **Pasta de dados do Seanime personalizada** (`--datadir`, Docker): o Suwayomi continua funcionando, mas
  os provedores por fonte não podem ser gerados. Use o "Suwayomi (Mihon/Tachiyomi)" e a configuração
  **Sources** dele.
- **Extension Secure Mode** ativado: o Seanime pergunta antes de o plugin executar um comando ou mexer em arquivos. Aceite os avisos na primeira inicialização.
- **Uma fonte falha ou tem Cloudflare.** Isso é da própria extensão do Mihon. Tente outra fonte para o mesmo mangá.

## Plataformas suportadas

| Plataforma | O que acontece |
|---|---|
| Windows x64 | Zero configuração (Java incluído no download) |
| Linux x64 | Zero configuração (Java incluído) |
| macOS Apple Silicon / Intel | Zero configuração (Java incluído) |
| Qualquer outra (Linux ARM64, Raspberry Pi, …) | Precisa do **Java 21+** instalado, veja abaixo |

### Java 21 em outros dispositivos

Nesses dispositivos o plugin usa o `Suwayomi-Server.jar` comum com o Java do sistema. Se o Java
estiver faltando ou for antigo demais, a bandeja e a página Mihon Extensions avisam, junto com o que instalar:

| Sistema | Comando |
|---|---|
| Debian / Ubuntu / Raspberry Pi OS | `sudo apt install openjdk-21-jre-headless` |
| Fedora | `sudo dnf install java-21-openjdk-headless` |
| Arch | `sudo pacman -S jre21-openjdk-headless` |
| Alpine | `sudo apk add openjdk21-jre-headless` |
| Qualquer SO | [Temurin 21 JRE](https://adoptium.net/temurin/releases/?version=21) |

Confira com `java -version` (deve mostrar 21 ou superior) e clique em **Start / Retry**.
Se o Seanime já estava aberto quando você instalou o Java, reinicie o Seanime para ele enxergar o novo `PATH`.

## Permissões

O launcher é um plugin do Seanime com os escopos `system` e `extensions`. O que ele pode fazer:

| Permissão | Motivo |
|---|---|
| Ler/escrever `<config>/Seanime/suwayomi/**` | O download do Suwayomi, seus dados e suas extensões instaladas |
| Escrever `<config>/Seanime/extensions/suwayomi.json` e `suwayomi-src-*.json` | Os provedores de mangá que ele gera (um por fonte). Nenhum outro arquivo de extensão é alterado |
| Ativar/desativar as extensões `suwayomi` e `suwayomi-src-*` | Carregar na hora o provedor de uma fonte nova. O Seanime pergunta antes: *"Allow Suwayomi Launcher to enable …?"* |
| Executar `jre/bin/java[.exe] … -jar bin/Suwayomi-Server.jar` | Iniciar o Suwayomi, escutando apenas em `127.0.0.1:4567` |
| Executar `java -version`, `tar -xzf` | Verificar o Java (outras plataformas) e descompactar o download (Linux/macOS) |
| Rede: `127.0.0.1`, GitHub | O servidor local do Suwayomi e as releases do Suwayomi no GitHub |

`<config>` é `%APPDATA%` no Windows, `~/Library/Application Support` no macOS e `~/.config` no Linux.
É a pasta de dados padrão do Seanime.

## Usando seu próprio servidor Suwayomi

Se você já roda o Suwayomi (por ex. no Docker), pode instalar só o provedor:

```
https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/suwayomi.json
```

Depois defina a **Suwayomi server URL** dele e, se quiser, um usuário e senha. Você também pode
adicionar `https://raw.githubusercontent.com/oktavianto/seanime-suwayomi/main/dist/repo.json` como repositório.

## Desinstalar

Remova "Suwayomi Launcher", "Suwayomi (Mihon/Tachiyomi)" e os provedores `… (Suwayomi)` em
**Extensions**. Depois apague a pasta `<config>/Seanime/suwayomi`, que contém o download, os dados do Suwayomi e suas extensões.

## Desenvolvimento

Veja a seção [Development do README em inglês](README.md#development).

## Créditos e aviso

Construído sobre o [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) (MPL-2.0), que roda
extensões do [Mihon](https://mihon.app)/Tachiyomi, e sobre o [Seanime](https://github.com/5rahim/seanime).
Este projeto não hospeda nenhum conteúdo e não inclui extensões. As fontes vêm de repos que você mesmo adiciona.

[Licença MIT](LICENSE)
