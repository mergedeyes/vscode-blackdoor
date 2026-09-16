import * as vscode from "vscode";
import {
  ALL_METHODS_BY_NAME,
  FUNCTION_MAP,
  FuncDoc,
  KEYWORD_MAP,
} from "./data/api";
import {
  renderFunction,
  renderKeyword,
  renderMethodGroup,
  renderProperty,
} from "./render";

const WORD = /[A-Za-z_][A-Za-z0-9_]*/;

// How a word is used at the cursor, decided purely from surrounding characters.
// No parser: the grammar already proves these are the meaningful shapes, and a
// lexical check is cheap and can't get out of sync with a live document.
type Usage =
  | { kind: "call" } // name(
  | { kind: "method" } // .name(
  | { kind: "property" } // .name  (not followed by ()
  | { kind: "plain" }; // bare identifier

function classify(line: string, wordStart: number, wordEnd: number): Usage {
  const before = line.slice(0, wordStart);
  const after = line.slice(wordEnd);
  const dotted = /\.\s*$/.test(before);
  const called = /^\s*\(/.test(after);

  if (dotted && called) return { kind: "method" };
  if (dotted) return { kind: "property" };
  if (called) return { kind: "call" };
  return { kind: "plain" };
}

// The property -> owning-return-object index, so hovering `res.success` on a
// property can name the field's type. Built once from the function catalog.
const PROPERTY_INDEX = buildPropertyIndex();

function buildPropertyIndex(): Map<string, { type: string; owners: string[] }> {
  const index = new Map<string, { type: string; owners: string[] }>();
  for (const fn of FUNCTION_MAP.values()) {
    if (!fn.returnProps) continue;
    for (const p of fn.returnProps) {
      const existing = index.get(p.name);
      if (existing) {
        if (!existing.owners.includes(fn.name)) existing.owners.push(fn.name);
        // Keep the first seen type; conflicts are rare and not worth guessing.
      } else {
        index.set(p.name, { type: p.type, owners: [fn.name] });
      }
    }
  }
  return index;
}

function hoverFor(word: string, usage: Usage): string | undefined {
  switch (usage.kind) {
    case "method": {
      const docs = ALL_METHODS_BY_NAME.get(word);
      if (docs) return renderMethodGroup(word, docs);
      return undefined;
    }
    case "call": {
      const fn = FUNCTION_MAP.get(word);
      if (fn) return renderFunction(fn);
      return undefined;
    }
    case "property": {
      const prop = PROPERTY_INDEX.get(word);
      if (prop) {
        const note = describeOwners(prop.owners);
        return renderProperty(word, prop.type, note);
      }
      return undefined;
    }
    case "plain": {
      // A builtin/API name used without parentheses (e.g. passed around, or a
      // keyword). Show the function doc if the name is one, else keyword help.
      const fn = FUNCTION_MAP.get(word);
      if (fn) return renderFunction(fn);
      const kw = KEYWORD_MAP.get(word);
      if (kw) return renderKeyword(kw);
      return undefined;
    }
  }
}

function describeOwners(owners: string[]): string | undefined {
  if (owners.length === 0) return undefined;
  const names = owners.map((o) => `\`${o}()\``);
  if (names.length === 1) return `Field on the object returned by ${names[0]}.`;
  const last = names.pop()!;
  return `Field on objects returned by ${names.join(", ")} and ${last}.`;
}

export class BlackdoorHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, WORD);
    if (!range) return undefined;

    const word = document.getText(range);
    const line = document.lineAt(position.line).text;
    const usage = classify(line, range.start.character, range.end.character);

    const body = hoverFor(word, usage);
    if (!body) return undefined;

    const md = new vscode.MarkdownString(body);
    md.supportHtml = false;
    return new vscode.Hover(md, range);
  }
}
