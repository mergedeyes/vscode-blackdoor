# Blackdoor (.bd) for VS Code

Syntax highlighting and hover docs for `.bd` scripts from the game [Blackdoor](https://store.steampowered.com/app/4562430/Blackdoor/).

## Features

- Highlighting for keywords, strings, numbers, comments and operators
- Built-in functions (`log`, `range`, `len`, ...) and the full game API (`connect`, `crack`, `list_files`, ...) are recognized, but only when called, so a variable named `save` or a property like `f.type` is not mistaken for a function
- Method calls (`s.lower()`, `list.append(x)`), property access (`conn.success`) and user-defined functions
- **Hover docs**: hover any builtin, API function or method to see its signature, description, arguments and return type. Hovering a returned-object field (like `res.success`) names its type and where it comes from. Keywords have short explanations too.
- Comment toggling, bracket and quote auto-closing, auto-indent after `if`/`for`/`while`/`func` lines ending in `:`

## Hover docs

The hover is driven by a static catalog of the game's functions (`src/data/api.ts`), not by analysing your script, so it is instant and never gets confused by a half-typed line. It reads the shape around the cursor to decide what to show:

- `crack(` → the `crack` function doc
- `.lower(` → the string `lower` method
- `conn.success` (no call) → the `success` field, typed `Boolean`, noted as coming from `connect()`

Because there is no type inference yet, a method name that exists on more than one type (like `contains`, on both strings and lists) shows all matching variants. Full per-variable type deduction is a later roadmap item.

## Colors

The extension ships a default color scheme inspired by the in-game editor. It only targets `*.blackdoor` scopes, so other languages are unaffected. To change a color, add your own rule in `settings.json`:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [
    { "scope": "support.function.api.blackdoor", "settings": { "foreground": "#FF8800" } }
  ]
}
```

Use **Developer: Inspect Editor Tokens and Scopes** to find the scope of any token.

## Scope reference

All scopes end in `.blackdoor`.

| Token | Scope | Default color |
| --- | --- | --- |
| `if`, `for`, `return`, `import`, `as` | `keyword.control` | orange `#DB9E45` |
| `and`, `or`, `not`, `in` | `keyword.operator.word` | orange |
| `var`, `func` | `storage.type` | orange |
| variables | `variable.other` | light grey `#B8B8B8` |
| properties (`conn.success`) | `variable.other.property` | light grey |
| `log`, `len`, `range`, ... | `support.function.builtin` | purple `#9A88DD` |
| `connect`, `crack`, ... | `support.function.api` | purple |
| `.lower()` | `support.function.method` | purple |
| other calls | `entity.name.function` | purple |
| strings | `string.quoted` | blue `#49B3E3` |
| numbers | `constant.numeric` | blue |
| `true`, `false`, `null` | `constant.language` | blue |
| comments | `comment.line.number-sign` | dark grey `#9A9A9A` |
| `( ) [ ] { } , : ;` | `punctuation` | dark grey |
| `.` | `punctuation` / `punctuation.accessor` | dark grey |
| operators | `keyword.operator` | dark grey |
| escapes (`\n`) | `constant.character.escape` | dark grey |

## Development

The extension has a TypeScript build (grammar and colors stay declarative).

- `npm install` once, then `npm run compile` (or `npm run watch`)
- Press `F5` to launch an Extension Development Host with the extension loaded
- Open any `.bd` file and hover a function to test

## Known limitations

- No diagnostics or go-to-definition yet, and no per-variable type deduction (see [ROADMAP.md](https://github.com/mergedeyes/vscode-blackdoor/blob/main/ROADMAP.md))

## Credits

The list of built-in and API functions, and their descriptions, is adapted from [BD-Extension](https://github.com/Procdox/BD-Extension) by Andrew (pb_ozai), MIT licensed.

## License

GPL-3.0
