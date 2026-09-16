# Roadmap

Reference project: [BD-Extension](https://github.com/Procdox/BD-Extension) (MIT). It already has a
parser with type deduction; this extension is currently declarative only (grammar + language config,
no JavaScript). Everything below phase 1 means turning it into a code extension, so that step is a
deliberate decision, not a default.

## Where things stand

| Feature | vscode-blackdoor | BD-Extension |
| --- | --- | --- |
| Syntax highlighting | yes (1.1.0) | yes |
| Full API function list | yes (1.1.0) | yes |
| Custom default colors | yes | no |
| `# @param` doc-comment highlighting | no | yes |
| Hover docs for API / properties | no | yes |
| Diagnostics (syntax, type mismatch) | no | yes |
| Type deduction | no | yes |
| Go to definition | no | yes |
| Autocomplete | no | no |
| Signature help | no | no |
| Outline / document symbols | no | no |
| Snippets | no | no |
| Marketplace release + CI | yes | no |

## Phase 1: Polish the declarative extension (no code needed)

- [ ] Icon (128x128 PNG, `"icon"` in package.json)
- [ ] Highlight `# @param name "desc" optional|default=x` doc comments
- [ ] Snippets: `func`, `if`/`elif`/`else`, `for ... in`, `while`, connect-and-crack boilerplate
- [ ] Grammar regression tests with `vscode-tmgrammar-test`, using `examples/sample.bd` as the base
- [ ] PR pipeline: run grammar tests and `vsce package` (publish stays tag-only)
- [ ] Also publish to Open VSX (VSCodium and other forks)
- [ ] Verify how `configurationDefaults` for `editor.tokenColorCustomizations` behaves when a user
      already has their own rules; if it gets replaced instead of merged, document it or switch approach
- [ ] Decide on the `.bd` conflict: both extensions register `.bd` under different language IDs
      (`blackdoor` vs `bdscript`); with both installed, VS Code picks one. Either document it or align IDs

## Phase 2: Decision point, become a code extension

Options, roughly in order of effort:

1. **Contribute upstream** and recommend BD-Extension for language features, keep this one as the
   themed, published highlighter. Least work, but two extensions fighting over `.bd`.
2. **Port the BD-Extension parser** (MIT into GPL-3.0 is fine, keep its license notice). Adds a
   TypeScript build, bundling (esbuild) and an activation event.
3. **Own language server in Rust** (`tower-lsp`). Most work, but reusable in Neovim, Helix, Zed,
   and a good learning project. The TypeScript client becomes a thin wrapper.

Things to fix if porting instead of copying as-is:
- It reparses the whole document on every keystroke (`changed()` calls `setActive()`); debounce or parse incrementally
- Dead, commented-out code in `extension.ts`
- Operator rules in its grammar use `\b` around symbols, which never matches (fixed here already)

Engine version: BD-Extension requires `^1.125.0`, this extension `^1.75.0`. When porting, keep
`@types/vscode` at or below the `engines.vscode` floor (vsce rejects the reverse), and only raise the
floor if a newer API is actually used, since a higher floor locks out older VS Code installs.

## Phase 3: Language features

- [ ] Hover docs for builtins, API functions and returned object properties
- [ ] Diagnostics for syntax errors and type mismatches
- [ ] Go to definition
- [ ] Autocomplete for API functions, methods by type, object properties (not in BD-Extension)
- [ ] Signature help while typing arguments (not in BD-Extension)
- [ ] Document symbols / outline for `func` and top-level `var` (not in BD-Extension)
- [ ] Generate the grammar's builtin/API word lists from the same data as hover docs, so they cannot drift

## Phase 4: Open items carried over from BD-Extension

- [ ] Detect functions/variables shadowing builtins or API names
- [ ] Detect use of variables leaked out of flow statements
- [ ] Detect redeclaration within the same scope
- [ ] Dynamic `import` support
- [ ] Type deduction for `list.append` / `list.insert`

## Later / depends on the game

- [ ] Send scripts to the game client directly, once the game offers any interface for it
- [ ] Formatter (indentation, spacing around operators)
- [ ] Keep the API list in sync with game updates (changelog watch or community-sourced list)
