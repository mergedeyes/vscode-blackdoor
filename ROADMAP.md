# Roadmap

Reference project: [BD-Extension](https://github.com/Procdox/BD-Extension) (MIT). It has a
parser with type deduction; this extension started declarative-only and, as of 1.2.0, has a small
TypeScript layer for hover docs. Turning on the heavier language features (diagnostics, type
deduction) is still a deliberate step, not a default.

## Where things stand

| Feature | vscode-blackdoor | BD-Extension |
| --- | --- | --- |
| Syntax highlighting | yes | yes |
| Full API function list | yes | yes |
| Custom default colors | yes | no |
| `# @param` lines | comment color, same as in-game | separate colors per part |
| Hover docs for API / methods | yes (1.2.0) | yes |
| Hover docs for object properties | yes, by field name (1.2.0) | yes, type-aware |
| Diagnostics (syntax, type mismatch) | no | yes |
| Type deduction | no | yes |
| Go to definition | no | yes |
| Autocomplete | no | no |
| Signature help | no | no |
| Outline / document symbols | no | no |
| Snippets | no | no |
| Marketplace release + CI | yes | no |

`# @param` is intentionally highlighted as a plain comment, because the game editor treats it as one.

### How this extension's hover differs from BD-Extension

BD-Extension's hover is the output of a full type-inference engine (~2000 lines): it reparses the
whole document on every keystroke, tracks a live reference graph, and can therefore show the deduced
type of a *user* variable. The rich descriptions and per-argument docs in its `builtins.ts` are not
actually surfaced on hover, though; the hover shows only a flat type signature.

This extension takes the opposite trade for now: a static catalog (`src/data/api.ts`) drives the
hover, so it is instant, cannot desync from a half-typed line, and *does* show descriptions and typed
arguments. The cost is that it can't yet resolve which type a user variable holds, so:

- properties are matched by field name, not by the type of the thing before the dot
- a method name on multiple types (e.g. `contains`) shows every matching variant

Closing that gap is the "type deduction" line below, at which point the property/method hover can be
narrowed to the actual receiver type.

## Phase 1: Polish (mostly declarative)

- [ ] Icon (128x128 PNG, `"icon"` in package.json)
- [ ] Snippets: `func`, `if`/`elif`/`else`, `for ... in`, `while`, connect-and-crack boilerplate
- [ ] Grammar regression tests with `vscode-tmgrammar-test`, using `examples/sample.bd` as the base
- [ ] PR pipeline: run grammar tests, `npm run compile` and `vsce package` (publish stays tag-only)
- [ ] Also publish to Open VSX (VSCodium and other forks)
- [ ] Commit a `package-lock.json` so CI can use `npm ci` (pipeline falls back to `npm install` until then)
- [ ] Keep `src/data/api.ts` and the grammar's builtin/API word lists in sync; ideally generate the
      grammar lists from the catalog so they cannot drift
- [ ] Verify how `configurationDefaults` for `editor.tokenColorCustomizations` behaves when a user
      already has their own rules; if it gets replaced instead of merged, document it or switch approach
- [ ] Decide on the `.bd` conflict: both extensions register `.bd` under different language IDs
      (`blackdoor` vs `bdscript`); with both installed, VS Code picks one. Either document it or align IDs

## Phase 2: Diagnostics and type deduction (the big step)

This needs a real parser. Options, roughly in order of effort:

1. **Port the BD-Extension parser** (MIT into GPL-3.0 is fine, keep its license notice). Reuse the
   existing `src/data/api.ts` as the builtin/API source instead of its `builtins.ts`.
2. **Own language server in Rust** (`tower-lsp`). Most work, but reusable in Neovim, Helix, Zed,
   and a good learning project. The TypeScript client becomes a thin wrapper.

Things to fix if porting instead of copying as-is:
- It reparses the whole document on every keystroke (`changed()` calls `setActive()`); debounce or parse incrementally
- Dead, commented-out code in `extension.ts`
- Its grammar colors `# @param` parts separately; keep them as comment color to match the game

Once a parser exists:
- [ ] Diagnostics for syntax errors and type mismatches
- [ ] Type deduction, then narrow the existing hover to the receiver's actual type
- [ ] Go to definition

## Phase 3: Editor features beyond BD-Extension

- [ ] Autocomplete for API functions, methods by type, object properties
- [ ] Signature help while typing arguments
- [ ] Document symbols / outline for `func` and top-level `var`

## Phase 4: Open items carried over from BD-Extension

- [ ] Detect functions/variables shadowing builtins or API names
- [ ] Detect use of variables leaked out of flow statements
- [ ] Detect redeclaration within the same scope
- [ ] Dynamic `import` support
- [ ] Type deduction for `list.append` / `list.insert`

## Later / depends on the game

- [ ] Send scripts to the game client directly. The game ships an OpenAPI spec (`openapi.yaml` in
      BD-Extension) for a local file API under an in-game `/mnt` dir: GET/POST/DELETE a file and poll
      `/v1/updates`. Scripts can be pushed/pulled, though the API is read-only for the in-game subtree.
- [ ] Formatter (indentation, spacing around operators)
- [ ] Keep the API list in sync with game updates (changelog watch or community-sourced list)
