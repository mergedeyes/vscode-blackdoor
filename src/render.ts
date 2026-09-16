import { ArgDoc, FuncDoc, KeywordDoc } from "./data/api";

function signature(doc: FuncDoc): string {
  const args = doc.args
    .map((a) => (a.optional ? `[${a.name}]` : a.name))
    .join(", ");
  const receiver = doc.kind === "method" ? "value." : "";
  return `${receiver}${doc.name}(${args}) -> ${doc.returns}`;
}

function argLines(args: ArgDoc[]): string[] {
  const lines: string[] = [];
  for (const a of args) {
    const parts: string[] = [`\`${a.name}\``];
    if (a.type) parts.push(a.type);
    let line = `- ${parts.join(": ")}`;
    if (a.optional) line += " _(optional)_";
    if (a.description) line += ` - ${a.description}`;
    lines.push(line);
  }
  return lines;
}

/** Build the hover body for a function or method. */
export function renderFunction(doc: FuncDoc): string {
  const out: string[] = [];
  out.push("```blackdoor\n" + signature(doc) + "\n```");
  if (doc.description) out.push(doc.description);

  const args = argLines(doc.args);
  if (args.length) {
    out.push("**Arguments**", ...args);
  }

  if (doc.returnProps && doc.returnProps.length) {
    out.push(`**Returns** \`${doc.returns}\` with:`);
    out.push(doc.returnProps.map((p) => `\`${p.name}\`: ${p.type}`).join(" - "));
  }

  if (doc.aliasOf) {
    out.push(`_Alias of \`${doc.aliasOf}\`._`);
  }

  return out.join("\n\n");
}

/** When a method name exists on several container types, show each. */
export function renderMethodGroup(name: string, docs: FuncDoc[]): string {
  if (docs.length === 1) return renderFunction(docs[0]);
  return docs.map(renderFunction).join("\n\n---\n\n");
}

export function renderKeyword(doc: KeywordDoc): string {
  return `**\`${doc.name}\`** (keyword)\n\n${doc.description}`;
}

/** A single returned-object field, shown when hovering a known property name. */
export function renderProperty(name: string, type: string, ownerNote?: string): string {
  const head = "```blackdoor\n" + `${name}: ${type}\n` + "```";
  return ownerNote ? `${head}\n\n${ownerNote}` : head;
}
