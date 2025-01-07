# EnlightWebtv

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

Run `npx nx graph` to visually explore what got created. Now, let's get you up to speed!

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/V9aP2a20EL)

## pnpm Commands and Examples

`pnpm` is a fast, disk space-efficient package manager. This document provides a list of commonly used `pnpm` commands with their descriptions and examples.

---

### Installation

To install `pnpm`, use the following command:

```bash
npm install -g pnpm
```

---

### Common Commands

| Command | Description | Example |
|---------|-------------|---------|
| `pnpm install` | Installs dependencies defined in `package.json`. | `pnpm install` |
| `pnpm add <package_name>` | Adds a new dependency to your project. | `pnpm add lodash` |
| `pnpm add <package_name> --save-dev` | Adds a package as a dev dependency. | `pnpm add typescript --save-dev` |
| `pnpm remove <package_name>` | Removes a dependency from your project. | `pnpm remove lodash` |
| `pnpm run <script_name>` | Runs scripts defined in `package.json`. | `pnpm run build` |
| `pnpm <script_name>` | Shortcut to run scripts without `run`. | `pnpm start` |
| `pnpm add <package_name>@<version>` | Installs a specific version of a package. | `pnpm add react@18.2.0` |
| `pnpm update` | Updates dependencies to their latest versions. | `pnpm update` |
| `pnpm update <package_name>` | Updates a specific package. | `pnpm update lodash` |
| `pnpm install --filter <directory>` | Installs dependencies for a specific subdirectory in a monorepo. | `pnpm install --filter ./apps/my-app` |
| `pnpm link <path_to_local_package>` | Links local dependencies. | `pnpm link ../shared-library` |
| `pnpm list` | Lists all installed dependencies. | `pnpm list` |
| `pnpm prune` | Removes extraneous packages. | `pnpm prune` |
| `pnpm outdated` | Checks for outdated dependencies. | `pnpm outdated` |
| `pnpm store prune` | Clears the local cache. | `pnpm store prune` |
| `pnpm exec --filter <filter> <command>` | Runs a command across all or specific filtered packages. | `pnpm exec --filter ./apps/my-app ls` |
| `pnpm install --lockfile-only` | Generates a `pnpm-lock.yaml` file. | `pnpm install --lockfile-only` |

---

### Additional Resources

For more information, visit the [pnpm documentation](https://pnpm.io/).


## Run tasks

To run tasks with Nx use:

```sh
npx nx <target> <project-name>
```

For example:

```sh
npx nx build myproject
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

To install a new plugin you can use the `nx add` command. Here's an example of adding the React plugin:
```sh
npx nx add @nx/react
```

Use the plugin's generator to create new projects. For example, to create a new React app or library:

```sh
# Generate an app
npx nx g @nx/react:app demo

# Generate a library
npx nx g @nx/react:lib some-lib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
