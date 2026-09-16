# Changelog

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
