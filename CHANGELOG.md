# Changelog

## 1.2.0

### Added
- Hover docs for builtins, API functions and methods: signature, description,
  typed arguments and return type, rendered from a static catalog (`src/data/api.ts`)
- Hovering a returned-object field (e.g. `res.success`) shows its type and which
  function returns it
- Hover help for keywords
- TypeScript build: `npm run compile` / `watch`, `F5` launches an Extension
  Development Host

### Changed
- The extension is now a code extension (has a `main` and an `out/` build),
  not grammar-only. The pipeline installs deps and compiles before publishing.
- API/builtin docs are adapted from BD-Extension (MIT); see README credits

## 1.1.0

### Fixed
- Properties named like builtins (`f.type`) were highlighted as function calls
- Chained calls (`f.name.ends_with(...)`) marked the middle part as a module
- Unterminated strings leaked their color into all following lines
- `==`, `!=`, `+=`, `<<`, `>>` are now single tokens; `^ ~ & | ?` are highlighted
- `as` is now a keyword; removed `none`, `print`, `args` which are not part of the language

### Added
- Full game API highlighting (`support.function.api.blackdoor`)
- Missing builtins: `range`, `get_param`, `parse_target`
- `true`/`false`/`null` now get a color
- Auto-closing and surrounding for `{}` and single quotes

### Changed
- Grammar reduced from 16 to 13 rules: the previously unused `property` rule is now active,
  redundant `module-call`, `function-definition` and `declaration` rules were removed
- Color defaults grouped by color: orange keywords, light grey variables and properties,
  purple functions, blue literals, dark grey comments, punctuation and operators
- Release pipeline publishes on version tags only

## 1.0.0
- Initial release: syntax highlighting and language configuration
