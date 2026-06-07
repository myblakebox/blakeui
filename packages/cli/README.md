<p align="center">
  <a href="https://blakeui.com">
      <img width="20%" src="https://raw.githubusercontent.com/myblakebox/BlakeUI/v3/apps/docs/public/icons/readme-logo.png" alt="blakeui" />
      <h1 align="center">BlakeUI CLI</h1>
  </a>
</p>
</br>
<p align="center">
  <a href="https://github.com/myblakebox/BlakeUI/blob/main/license">
    <img src="https://img.shields.io/npm/l/@blakeui/cli?style=flat" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/@blakeui/cli">
    <img src="https://img.shields.io/npm/dm/@blakeui/cli.svg?style=flat-round" alt="npm downloads">
  </a>
</p>

The CLI offers a suite of commands to initialize, manage, and improve your BlakeUI projects. It enables you to `install`, `uninstall`, or `upgrade` BlakeUI packages, assess the health of your project, and more.

## Quick Start

> **Note**: The BlakeUI CLI requires [Node.js](https://nodejs.org/en) _22+_ or later

You can choose the following ways to start the BlakeUI CLI.

### Npx

```bash
npx @blakeui/cli@latest
```

### Global Installation

```bash
npm install -g @blakeui/cli
```

## Usage

```bash
Usage: blakeui [command]

Options:
  -v, --version                  Output the current version
  --no-cache                     Disable cache, by default data will be cached for 30m after the first request
  -d, --debug                    Debug mode will not install dependencies
  -h --help                      Display help information for commands

Commands:
  init [options] [projectName]   Initializes a new project
  install [options]              Installs @blakeui/react and @blakeui/styles in your project
  upgrade [options]              Upgrades @blakeui/react and @blakeui/styles to the latest versions
  uninstall [options]            Uninstalls @blakeui/react and @blakeui/styles from the project
  list [options]                 Lists installed BlakeUI packages (@blakeui/react, @blakeui/styles)
  env [options]                  Displays debugging information for the local environment
  doctor [options]               Checks for issues in the project
  agents-md [options]            Downloads BlakeUI documentation for AI coding agents
  help [command]                 Display help for command
```

## Analytics

The `agents-md` command collects anonymous usage data.

**What we collect:** Selection (react/native/both), output file names, duration, success or error. No file paths, or project contents are collected.

**Opt out:** Set `BLAKEUI_ANALYTICS_DISABLED=1` in your environment or shell profile.

## Commands

### Init

Initialize a new BlakeUI project with official templates.

```bash
blakeui init [projectName] [options]
```

#### Init Options

- `-t --template [string]` The template to use for the new project e.g. app, pages, vite
- `-p --package [string]` The package manager to use for the new project

##### Example

```bash
# Initialize a new BlakeUI project with the app template, named my-blakeui-app using pnpm
blakeui init my-blakeui-app -t app -p pnpm
```

Alternatively, you can run `init` without any flags and select an option from the prompt.

```bash
blakeui init
```

output:

```bash
BlakeUI CLI <version>

┌  Create a new project
│
◇  Select a template (Enter to select)
│  ● App (A Next.js 16 with app directory template pre-configured with BlakeUI (v3) and Tailwind CSS.)
│  ○ Pages (A Next.js 16 with pages directory template pre-configured with BlakeUI (v3) and Tailwind CSS.)
│  ○ Vite (A Vite template pre-configured with BlakeUI (v3) and Tailwind CSS.)
│
◇  New project name (Enter to skip with default name)
│  my-blakeui-app
│
◇  Select a package manager (Enter to select)
│  ● npm
│  ○ yarn
│  ○ pnpm
│  ○ bun
│
◇  Template created successfully!
│
◇  Next steps ───────╮
│                    │
│  cd my-blakeui-app  │
│  npm install       │
│                    │
├────────────────────╯
│
└  🚀 Get started with npm run dev
```

### Install

Install `@blakeui/react` and `@blakeui/styles` in your project, along with their peer dependencies. If they are already installed, the command does nothing.

```bash
blakeui install [options]
```

#### Install Options

- `-p --packagePath` [string] The path to the package.json file

##### Example

```bash
blakeui install
```

Output:

```bash
BlakeUI CLI <version>

📦 Packages to be installed:
╭─────────────────────────────────────────────────────────────────────────────╮
│   Package          │   Version        │   Status   │   Docs                 │
│─────────────────────────────────────────────────────────────────────────────│
│   @blakeui/react    │   3.0.0          │   stable   │   https://blakeui.com   │
│   @blakeui/styles   │   3.0.0          │   stable   │   https://blakeui.com   │
╰─────────────────────────────────────────────────────────────────────────────╯

╭─────────────── PeerDependencies ────────────────╮
│  react@18.3.1                      latest       │
│  react-dom@18.3.1                  latest       │
│  tailwindcss@4.2.2                 latest       │
╰─────────────────────────────────────────────────╯
? Proceed with installation? › - Use arrow-keys. Return to submit.
❯   Yes
    No

✅ @blakeui/react and @blakeui/styles installed successfully
```

### Upgrade

Upgrade `@blakeui/react` and `@blakeui/styles` with their peer dependencies to the latest versions.

```bash
blakeui upgrade [options]
```

#### Upgrade Options

- `-p --packagePath` [string] The path to the package.json file

##### Example

```bash
blakeui upgrade
```

Output:

```bash
BlakeUI CLI <version>

╭──────────────────────────── Upgrade ────────────────────────────╮
│  @blakeui/react               ^3.0.0  ->  ^3.1.0                │
│  @blakeui/styles              ^3.0.0  ->  ^3.1.0                │
╰─────────────────────────────────────────────────────────────────╯

? Would you like to proceed with the upgrade? › - Use arrow-keys. Return to submit.
❯   Yes
    No

✅ Upgrade complete. All packages are up to date.
```

### Uninstall

Uninstall `@blakeui/react` and `@blakeui/styles` from your project. Peer dependencies will not be deleted.

```bash
blakeui uninstall [options]
```

#### Uninstall Options

- `-p --packagePath` [string] The path to the package.json file

##### Example

```bash
blakeui uninstall
```

Output:

```bash
BlakeUI CLI <version>

❗️ Packages slated for uninstallation:
╭──────────────────────────────────────────────────────────────────────────────────────╮
│   Package          │   Version   │   Status   │   Docs                               │
│──────────────────────────────────────────────────────────────────────────────────────│
│   @blakeui/react    │   3.0.0     │   stable   │   https://blakeui.com                 │
│   @blakeui/styles   │   3.0.0     │   stable   │   https://blakeui.com                 │
╰──────────────────────────────────────────────────────────────────────────────────────╯
? Confirm uninstallation of these packages: › - Use arrow-keys. Return to submit.
❯   Yes
    No

✅ Successfully uninstalled: @blakeui/react, @blakeui/styles
```

### List

List the installed BlakeUI packages (`@blakeui/react`, `@blakeui/styles`).

```bash
blakeui list [options]
```

#### List Options

- `-p --packagePath` [string] The path to the package.json file

##### Example

```bash
blakeui list
```

Output:

```bash
BlakeUI CLI <version>

Current installed packages:

╭──────────────────────────────────────────────────────────────────────────────────────╮
│   Package          │   Version          │   Status   │   Docs                        │
│──────────────────────────────────────────────────────────────────────────────────────│
│   @blakeui/react    │   3.0.0 🚀latest   │   stable   │   https://blakeui.com          │
│   @blakeui/styles   │   3.0.0 🚀latest   │   stable   │   https://blakeui.com          │
╰──────────────────────────────────────────────────────────────────────────────────────╯
```

### Doctor

Check for issues in your project.

```bash
blakeui doctor [options]
```

#### Features

> 1. Check whether `@blakeui/react` and `@blakeui/styles` are installed
> 2. Check whether `required peer dependencies` are installed and matched minimal requirements in the project

#### Doctor Options

- `-p --packagePath` [string] The path to the package.json file

##### Example

```bash
blakeui doctor
```

Output:

If there is a problem in your project, the `doctor` command will display the problem information.

```bash
BlakeUI CLI <version>

BlakeUI CLI: ❌ Your project has 1 issue that require attention

❗️Issue 1: missingBlakeUIPackages

The following BlakeUI packages are not installed:
- @blakeui/styles

Run `blakeui install` to install them.
```

Otherwise, the `doctor` command will display the following message.

```bash
BlakeUI CLI <version>

✅ Your project has no detected issues.
```

### Env

Display debug information about the local environment.

```bash
blakeui env [options]
```

#### Env Options

- `-p --packagePath` [string] The path to the package.json file

##### Example

```bash
blakeui env
```

Output:

```bash
BlakeUI CLI <version>

Current installed packages:

╭──────────────────────────────────────────────────────────────────────────────────────╮
│   Package          │   Version          │   Status   │   Docs                        │
│──────────────────────────────────────────────────────────────────────────────────────│
│   @blakeui/react    │   3.0.0 🚀latest   │   stable   │   https://blakeui.com          │
│   @blakeui/styles   │   3.0.0 🚀latest   │   stable   │   https://blakeui.com          │
╰──────────────────────────────────────────────────────────────────────────────────────╯

Environment Info:
  System:
    OS: darwin
    CPU: arm64
  Binaries:
    Node: v25.8.1
```

### Agents-md

Download BlakeUI documentation for AI coding agents (Claude, Cursor, etc.). This command downloads the latest documentation from the BlakeUI repository and generates an index file that can be injected into markdown files like `AGENTS.md` or `CLAUDE.md` to help AI assistants understand your project's BlakeUI setup.

```bash
blakeui agents-md [options]
```

#### Features

> 1. Downloads latest BlakeUI documentation from the `v3` branch
> 2. Supports React, Native, and Migration (v2→v3) documentation
> 3. Generates a section for the selected library (React, Native, or Migration) in the markdown file
> 4. Automatically adds `.blakeui-docs/` to `.gitignore`

#### Agents-md Options

- `--react` [boolean] Include React docs only (one library at a time)
- `--native` [boolean] Include Native docs only
- `--migration` [boolean] Include BlakeUI v2 to v3 migration docs only
- `--output <file>` [string] Target file path (e.g., `AGENTS.md`, `CLAUDE.md`)
- `--ssh` [boolean] Use SSH instead of HTTPS for git clone

#### Example

Run the command without any flags to enter interactive mode:

```bash
blakeui agents-md
```

Download React docs to a specific file:

```bash
blakeui agents-md --react --output AGENTS.md
```

Download Native docs:

```bash
blakeui agents-md --native --output CLAUDE.md
```

Download migration docs (v2→v3):

```bash
blakeui agents-md --migration --output AGENTS.md
```

Use SSH for cloning (useful if HTTPS fails):

```bash
blakeui agents-md --react --ssh --output AGENTS.md
```

#### How It Works

1. **Downloads Documentation**: Clones the BlakeUI repository using git sparse-checkout to download only the documentation files
2. **Generates Index**: Creates a compact index of all documentation files organized by directory
3. **Injects into Markdown**: Injects the index into your specified markdown file (e.g., `AGENTS.md`) with special markers:
   - `<!-- BLAKEUI-REACT-AGENTS-MD-START -->` / `<!-- BLAKEUI-REACT-AGENTS-MD-END -->` for React docs
   - `<!-- BLAKEUI-NATIVE-AGENTS-MD-START -->` / `<!-- BLAKEUI-NATIVE-AGENTS-MD-END -->` for Native docs
   - `<!-- BLAKEUI-MIGRATION-AGENTS-MD-START -->` / `<!-- BLAKEUI-MIGRATION-AGENTS-MD-END -->` for Migration docs
4. **Single library**: Only one of React, Native, or Migration can be selected at a time

#### File Structure

After running the command, you'll have:

```
your-project/
├── .blakeui-docs/          # Downloaded documentation (gitignored)
│   ├── react/            # React documentation files (if selected)
│   ├── native/           # Native documentation files (if selected)
│   └── migration/        # Migration docs (v2→v3, if selected)
├── AGENTS.md             # Your markdown file with injected index
└── .gitignore            # Updated to include .blakeui-docs/
```

#### Notes

- The command always downloads the latest documentation from the `v3` branch
- Documentation is stored in `.blakeui-docs/` which is automatically added to `.gitignore`

### Community

We're excited to see the community adopt BlakeUI CLI, raise issues, and provide feedback.
Whether it's a feature request, bug report, or a project to showcase, please get involved!

- [Discord](https://discord.gg/9b6yyZKmH4)
- [Twitter](https://twitter.com/blake_ui)
- [GitHub Discussions](https://github.com/myblakebox/BlakeUI/discussions)

## Contributing

Contributions are always welcome!

See [CONTRIBUTING.md](https://github.com/myblakebox/BlakeUI/blob/main/CONTRIBUTING.md) for ways to get started.

Please adhere to this project's [CODE_OF_CONDUCT](https://github.com/myblakebox/BlakeUI/blob/main/CODE_OF_CONDUCT.md).

## License

[MIT](https://choosealicense.com/licenses/mit/)
