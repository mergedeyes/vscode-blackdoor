# Blackdoor (.bd) for VS Code

Syntax highlighting for `.bd` scripts from the game [Blackdoor](https://store.steampowered.com/app/4562430/Blackdoor/).

## Features

- Highlighting for keywords, strings, numbers, comments and operators
- Built-in functions (`log`, `range`, `len`, ...) and the full game API (`connect`, `crack`, `list_files`, ...) are recognized, but only when called, so a variable named `save` or a property like `f.type` is not mistaken for a function
- Method calls (`s.lower()`, `list.append(x)`), property access (`conn.success`) and user-defined functions
- Comment toggling, bracket and quote auto-closing, auto-indent after `if`/`for`/`while`/`func` lines ending in `:`

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

## Known limitations

- No hover docs, diagnostics or go-to-definition yet (see [ROADMAP.md](https://github.com/mergedeyes/vscode-blackdoor/blob/main/ROADMAP.md))
- Scripts still have to be copied into the game manually

## Credits

The list of built-in and API functions is based on [BD-Extension](https://github.com/Procdox/BD-Extension) by Andrew (pb_ozai), MIT licensed.

## License

GPL-3.0
