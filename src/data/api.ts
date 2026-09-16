// Documentation catalog for Blackdoor's built-in and API functions.
//
// This is the single source of truth for hover docs. The grammar's word lists
// in syntaxes/blackdoor.tmLanguage.json should stay in sync with the names here
// (see ROADMAP.md, phase 3: generate one from the other).
//
// The data is adapted from BD-Extension's src/builtins.ts (MIT, Andrew / pb_ozai).
// We keep only what a hover needs: a signature, a description and per-argument
// notes. We deliberately do not port the type-inference engine; see hover.ts.

export type BDCategory =
  | "builtin"
  | "network"
  | "security"
  | "auth"
  | "files"
  | "system"
  | "local"
  | "shop"
  | "web"
  | "mail";

export interface ArgDoc {
  name: string;
  /** Display type, e.g. "String", "Number", "Object", "String/Number". */
  type?: string;
  /** Optional one-line note shown under the signature. */
  description?: string;
  optional?: boolean;
}

export interface FuncDoc {
  name: string;
  category: BDCategory;
  /** Whether this is a global function (`f(...)`) or a method (`x.f(...)`). */
  kind: "function" | "method";
  args: ArgDoc[];
  /** Display type of the return value, e.g. "Object", "Boolean", "Null". */
  returns: string;
  description: string;
  /** For functions returning an object: the fields on that object. */
  returnProps?: { name: string; type: string }[];
  /** Names this entry is also registered under (e.g. get_time -> get_trace_time). */
  aliasOf?: string;
}

// Shared arg definitions, mirroring the *_arg constants in builtins.ts.
const A = {
  target: { name: "target", type: "String", description: "[user@]host" },
  port: { name: "port", type: "Number", description: "you probably want 22" },
  conn: { name: "conn", type: "Object", description: "created by connect" },
  user: { name: "user", type: "String" },
  password: { name: "password", type: "String" },
  path: { name: "path", type: "String", description: "A filepath" },
  content: { name: "content", type: "String" },
  val: { name: "val", type: "Unknown" },
  url: { name: "url", type: "String" },
} satisfies Record<string, ArgDoc>;

// Return-object field lists, mirroring the RET_* constants in builtins.ts.
const RET = {
  connect: [
    ["id", "Number"], ["success", "Boolean"], ["banner", "String"],
    ["hostname", "String"], ["os", "String"], ["port", "Number"],
    ["target", "String"], ["trace_time", "Number"], ["user", "String"],
    ["ssh_denied", "Boolean"],
  ],
  scan: [
    ["open", "Boolean"], ["service", "String"], ["version", "String"],
    ["banner", "String"], ["response_time", "Number"], ["filtered", "Boolean"],
  ],
  probeVuln: [
    ["found", "Boolean"], ["success", "Boolean"], ["exploited", "Boolean"],
    ["progress", "Number"], ["vuln_type", "String"], ["description", "String"],
    ["severity", "String"], ["security_reduction", "Number"], ["new_security", "Number"],
    ["tip", "String"],
  ],
  crack: [
    ["success", "Boolean"], ["progress", "Number"], ["hint", "String"],
    ["password", "String"], ["attempts", "Number"], ["difficulty", "String"],
  ],
  bruteWeb: [
    ["success", "Boolean"], ["progress", "Number"], ["hint", "String"],
    ["password", "String"],
  ],
  readFile: [
    ["success", "Boolean"], ["content", "String"], ["size", "Number"],
    ["owner", "String"], ["encrypted", "Boolean"], ["encryption_type", "Boolean"],
    ["race_locked", "Boolean"], ["last_modified", "String"], ["error", "String"],
  ],
  download: [
    ["success", "Boolean"], ["path", "String"], ["size", "Number"],
    ["local_path", "String"], ["owner", "String"], ["error", "String"],
    ["race_locked", "Boolean"],
  ],
  wget: [
    ["success", "Boolean"], ["path", "String"], ["size", "Number"],
    ["local_path", "String"], ["error", "String"],
  ],
  probeLayer: [
    ["active", "Boolean"], ["layers", "Number"], ["layers_remaining", "Number"],
  ],
  chipLayer: [
    ["success", "Boolean"], ["layers_remaining", "Number"], ["progress", "Number"],
    ["layer_breached", "Boolean"], ["firewall_down", "Boolean"],
  ],
  decrypt: [
    ["success", "Boolean"], ["progress", "Number"], ["content", "String"],
    ["already_decrypted", "Boolean"], ["attempts", "Number"], ["method_hint", "String"],
  ],
  browse: [
    ["success", "Boolean"], ["html", "String"],
  ],
} satisfies Record<string, [string, string][]>;

function props(pairs: [string, string][]): { name: string; type: string }[] {
  return pairs.map(([name, type]) => ({ name, type }));
}

// Terse constructor to keep the table below readable.
function fn(
  name: string,
  category: BDCategory,
  args: ArgDoc[],
  returns: string,
  description: string,
  returnProps?: [string, string][],
): FuncDoc {
  return {
    name, category, kind: "function", args, returns, description,
    returnProps: returnProps ? props(returnProps) : undefined,
  };
}

function method(
  name: string,
  args: ArgDoc[],
  returns: string,
  description: string,
): FuncDoc {
  return { name, category: "builtin", kind: "method", args, returns, description };
}

const opt = (a: ArgDoc): ArgDoc => ({ ...a, optional: true });

export const FUNCTIONS: FuncDoc[] = [
  // Core builtins
  fn("log", "builtin", [{ name: "message", type: "Unknown" }], "Null", "Print to terminal"),
  fn("range", "builtin", [
    { name: "start", type: "Number", description: "If this is the only arg, this is stop (starts at 0)" },
    opt({ name: "stop", type: "Number" }), opt({ name: "step", type: "Number" }),
  ], "List[Number]", "Numeric range"),
  fn("len", "builtin", [{ name: "list", type: "List/String" }], "Number", "List or string length"),
  fn("str", "builtin", [A.val], "String", "Cast to string"),
  fn("int", "builtin", [A.val], "Number", "Cast to number"),
  fn("type", "builtin", [A.val], "String", "Get variable type"),
  fn("get_param", "builtin", [
    { name: "name", type: "String" }, opt({ name: "fallback", type: "String" }),
  ], "String", "Read param value"),
  fn("parse_target", "builtin", [A.target], "Object", "Parse target string into object",
    [["user", "String"], ["host", "String"]]),
  fn("exit", "builtin", [], "Null", "Immediately end script"),

  // Network
  fn("scan", "network", [A.target, A.port], "Object", "Check if a port is open", RET.scan),
  fn("connect", "network", [A.target, A.port, opt(A.password)], "Object", "Open a connection", RET.connect),
  fn("disconnect", "network", [A.conn], "Null", "Close connection"),
  fn("get_target", "network", [], "Object", "Mission Target {ip, hostname}",
    [["ip", "String"], ["hostname", "String"]]),
  fn("resolve_hostname", "network", [{ name: "hostname", type: "String" }], "String",
    "Resolve a hostname to an IP via /etc/hosts"),
  fn("traces", "network", [], "List[Object]", "Lists active and recovering traces",
    [["ip", "String"], ["hostname", "String"], ["status", "String"], ["remaining", "Number"], ["total", "Number"]]),

  // Security
  fn("get_security", "security", [A.conn], "Number", "Server security level (0.0-1.0)"),
  fn("probe_vuln", "security", [A.conn], "Object", "Check next vulnerability (no side effects)", RET.probeVuln),
  fn("exploit_vuln", "security", [A.conn], "Object", "Chip at it (progressive), lower security", RET.probeVuln),
  fn("probe_firewall", "security", [A.target], "Object", "Check firewall status", RET.probeLayer),
  fn("bypass_firewall", "security", [A.target], "Object", "Chip through firewall (progressive)", RET.chipLayer),

  // Auth
  fn("crack", "auth", [A.conn, A.user], "Object", "Crack a password (progressive)", RET.crack),
  fn("brute_web", "auth", [A.conn, A.user], "Object", "Crack a web login (progressive)", RET.bruteWeb),
  fn("local_crack", "auth", [A.user], "Object", "Crack from inside (quieter)", RET.bruteWeb),
  fn("su", "auth", [A.user, A.password], "Boolean", "Switch user"),
  fn("get_users", "auth", [A.conn], "List[Object]", "List user accounts",
    [["name", "String"], ["home", "String"], ["shell", "String"]]),

  // Files
  fn("list_files", "files", [A.conn, A.path], "List[Object]", "List directory contents",
    [["name", "String"], ["path", "String"], ["type", "String"], ["size", "Number"], ["owner", "String"]]),
  fn("read_file", "files", [A.conn, A.path], "Object", "Read a file", RET.readFile),
  fn("write_file", "files", [A.conn, A.path, A.content], "Boolean", "Write to a remote file"),
  fn("download", "files", [A.conn, A.path], "Object", "Download to ~/downloads/", RET.download),
  fn("delete_file", "files", [A.conn, A.path], "Boolean", "Delete a file"),
  fn("file_size", "files", [A.conn, A.path], "Number", "Get file size"),
  fn("upload", "files", [A.conn, A.path, A.path], "Boolean", "Upload a file to target"),
  fn("wget", "files", [A.url, A.user, A.password], "Object", "Download over HTTP", RET.wget),

  // System
  fn("get_trace_time", "system", [], "Number", "Seconds remaining before trace completes."),
  fn("get_noise", "system", [], "Number", "Current noise level (0-100)"),
  fn("get_cpu", "system", [], "Number", "Current aggregate CPU load across all your running processes (0-100)"),
  fn("get_my_ip", "system", [], "String", "Your current exit IP (changes with proxy bouncing)"),
  fn("whoami", "system", [A.conn], "String", "Current user on the connected server"),
  fn("get_hostname", "system", [], "String", "Returns your current username on the connected server"),
  fn("sleep", "system", [{ name: "seconds", type: "Number" }], "Null", "Wait. Reduces noise slightly"),
  { ...fn("get_time", "system", [], "Number", "Seconds remaining before trace completes."), aliasOf: "get_trace_time" },
  { ...fn("get_detection", "system", [], "Number", "Current noise level (0-100)"), aliasOf: "get_noise" },

  // Local files
  fn("my_files", "local", [], "List[Object]", "List files on your local machine",
    [["name", "String"], ["path", "String"], ["type", "String"], ["size", "Number"]]),
  fn("read_local", "local", [A.path], "String", "Read a local file"),
  fn("save", "local", [A.path, A.content], "Null", "Save data to a local file"),
  fn("local_mkdir", "local", [A.path], "Boolean", "Create a directory on your local machine"),
  fn("local_cp", "local", [
    { name: "src", type: "String", description: "File to copy" },
    { name: "dst", type: "String", description: "New location" },
  ], "Boolean", "Copy a local file"),
  fn("local_mv", "local", [
    { name: "src", type: "String", description: "File to move" },
    { name: "dst", type: "String", description: "New location" },
  ], "Boolean", "Move/rename a local file"),
  fn("local_rm", "local", [A.path], "Boolean", "Delete a local file"),
  { ...fn("write_local", "local", [A.path, A.content], "Null", "Save data to a local file"), aliasOf: "save" },

  // Shop items
  fn("file_type", "shop", [A.conn, A.path], "String", "Check file type before download (QuietGrab)"),
  fn("pivot", "shop", [A.conn], "Boolean", "Route through proxy, +15s trace, capped at 5 hops (ProxyChain)"),
  fn("pivot_clear", "shop", [A.conn], "Null", "Clear the entire proxy chain (ProxyChain)"),
  fn("scrub_log", "shop", [A.conn, A.path, A.target], "Object", "Remove your IP from log files (LogScrubber)",
    [["removed", "Number"], ["remaining", "Number"]]),
  fn("decrypt", "shop", [A.conn, A.path], "Object", "Decrypt a file, progressive (CryptoKit)", RET.decrypt),
  fn("detect_encryption", "shop", [A.conn, A.path], "Object", "Check encryption type (CryptoKit)",
    [["encrypted", "Boolean"], ["type", "String"], ["error", "String"]]),
  fn("is_honeypot", "shop", [A.target, A.port], "Boolean", "Detect honeypot servers (HoneyCheck)"),
  fn("extract_ips", "shop", [A.content], "List[String]", "Extract IPv4 addresses (PatternKit)"),
  fn("extract_emails", "shop", [A.content], "List[String]", "Extract email addresses (PatternKit)"),
  fn("extract_urls", "shop", [A.content], "List[String]", "Extract http/https URLs (PatternKit)"),
  fn("extract_credentials", "shop", [A.content], "List[String]", "Extract password/key/token (PatternKit)"),
  fn("fast_bypass", "shop", [A.target], "Object", "Enhanced firewall bypass (FireBreak)", RET.chipLayer),
  fn("grab_hash", "shop", [A.conn, A.user], "Object", "Retrieve the hash for a user's password (Crack Source)",
    [["hash", "String"], ["salt", "String"], ["security", "Number"]]),
  fn("hash_distance", "shop", [
    { name: "H1", type: "String" }, { name: "H2", type: "String" },
  ], "Number", "Compare hash strings, zero means identical (Crack Source)"),
  fn("hash_string", "shop", [
    A.content, { name: "salt", type: "String" }, opt({ name: "security", type: "Number" }),
  ], "String", "Hash a string (Crack Source)"),
  fn("random_char", "shop", [
    { name: "pos", type: "Number" }, { name: "char", type: "String" },
  ], "String", "Set character at pos to a random character (Crack Source)"),
  fn("to_char", "shop", [{ name: "code", type: "Number" }], "String", "Convert ASCII value to character (Crack Source)"),
  fn("set_char", "shop", [
    A.content, { name: "pos", type: "Number" }, { name: "char", type: "String" },
  ], "String", "Set character at pos to a given character (Crack Source)"),
  fn("probe_layer", "shop", [A.target], "Object", "Low-level firewall probe (Bypass Source)", RET.probeLayer),
  fn("chip_layer", "shop", [A.target], "Object", "One tick of firewall bypass, no automatic output (Bypass Source)", RET.chipLayer),

  // Web attack vectors
  fn("sqli", "web", [A.conn, A.url], "Object", "Test a web form for SQL injection",
    [["success", "Boolean"], ["data", "String"], ["error", "String"]]),
  fn("cmd_inject", "web", [A.conn, A.url], "Object", "Test a web form for command injection",
    [["success", "Boolean"], ["output", "String"], ["error", "String"]]),
  fn("browse", "web", [A.url], "Object", "Fetch a page", RET.browse),
  fn("click", "web", [{ name: "text", type: "String" }], "Object", "Click a link by its text", RET.browse),
  fn("fill_form", "web", [
    { name: "field", type: "String" }, { name: "value", type: "String" },
  ], "Boolean", "Fill a form field"),
  fn("submit_form", "web", [], "Object", "Submit the current form", RET.browse),
  fn("find_links", "web", [{ name: "html", type: "String" }], "List[Object]", "Find links in HTML",
    [["text", "String"], ["href", "String"]]),
  fn("find_forms", "web", [{ name: "html", type: "String" }], "List[Object]", "Find forms in HTML",
    [["action", "String"], ["fields", "Object"]]),

  // Mail / SMTP
  fn("smtp_connect", "mail", [A.target], "Object", "Open a connection to a mail server (port 25), no auth required",
    [["id", "Number"], ["success", "Boolean"], ["banner", "String"]]),
  fn("smtp_login", "mail", [A.conn, A.user, A.password], "Boolean", "Authenticate to a mailbox"),
  fn("smtp_read", "mail", [A.conn, A.user], "List[Object]", "Read a mailbox. Requires smtp_login() for that user first.",
    [["from", "String"], ["subject", "String"], ["body", "String"]]),
  fn("smtp_send", "mail", [
    A.conn, { name: "from", type: "String" }, { name: "to", type: "String" },
    { name: "subject", type: "String" }, { name: "body", type: "String" },
  ], "Boolean", "Send an email"),
];

// String / list / object methods, mirroring the *_PROPS maps in builtins.ts.
export const STRING_METHODS: FuncDoc[] = [
  method("upper", [], "String", "Convert to uppercase"),
  method("lower", [], "String", "Convert to lowercase"),
  method("contains", [{ name: "sub", type: "String" }], "Boolean", "True if sub appears anywhere in the string"),
  method("find", [{ name: "sub", type: "String" }], "Number", "Index of sub, or -1 if not found"),
  method("substr", [
    { name: "start", type: "Number" }, opt({ name: "length", type: "Number" }),
  ], "String", "Extract a portion of the string"),
  method("trim", [], "String", "Strip leading and trailing whitespace"),
  method("starts_with", [{ name: "sub", type: "String" }], "Boolean", "Check the start of a string"),
  method("ends_with", [{ name: "sub", type: "String" }], "Boolean", "Check the end of a string"),
  method("replace", [
    { name: "old", type: "String" }, { name: "new", type: "String" },
  ], "String", "Swap every occurrence of old with new"),
  method("split", [{ name: "sep", type: "String" }], "List[String]", "Cut a string into a list at each separator"),
];

export const LIST_METHODS: FuncDoc[] = [
  method("append", [A.val], "Null", "Add val to the end of the list"),
  method("insert", [{ name: "i", type: "Number" }, A.val], "Null", "Insert val at index i, shifting the rest right"),
  method("pop", [opt({ name: "i", type: "Number" })], "Unknown", "Remove and return the last item, or item at index i"),
  method("remove", [{ name: "i", type: "Number" }], "Null", "Remove the item at index i"),
  method("contains", [A.val], "Boolean", "True if val is anywhere in the list"),
];

export const OBJECT_METHODS: FuncDoc[] = [
  method("keys", [], "List[String]", "Return a list of the keys in the object"),
  method("has", [A.val], "Boolean", "Return true if val is a key in the object"),
  method("values", [], "List[Unknown]", "Return a list of the values for each key in the object"),
];

export interface KeywordDoc {
  name: string;
  description: string;
}

export const KEYWORDS: KeywordDoc[] = [
  { name: "if", description: "Run the indented block when the condition is true." },
  { name: "elif", description: "Checked when the preceding `if`/`elif` was false." },
  { name: "else", description: "Runs when every preceding `if`/`elif` was false." },
  { name: "while", description: "Repeat the block while the condition stays true." },
  { name: "for", description: "Iterate over a list: `for item in list:`." },
  { name: "break", description: "Exit the innermost loop immediately." },
  { name: "continue", description: "Skip to the next iteration of the innermost loop." },
  { name: "return", description: "Return a value from the current function." },
  { name: "func", description: "Define a function: `func name(args):`." },
  { name: "var", description: "Declare a variable: `var name = value`." },
  { name: "import", description: "Import a module, optionally aliased: `import \"path\" as name`." },
  { name: "as", description: "Bind an import to a name: `import \"path\" as name`." },
  { name: "in", description: "Membership test, and the loop separator in `for x in list`." },
  { name: "and", description: "Boolean AND. True when both sides are true." },
  { name: "or", description: "Boolean OR. True when either side is true." },
  { name: "not", description: "Boolean NOT. Inverts a boolean." },
  { name: "true", description: "Boolean literal." },
  { name: "false", description: "Boolean literal." },
  { name: "null", description: "The null value." },
];

// ---- Lookup indexes -------------------------------------------------------

export const FUNCTION_MAP = new Map(FUNCTIONS.map((f) => [f.name, f]));
export const STRING_METHOD_MAP = new Map(STRING_METHODS.map((f) => [f.name, f]));
export const LIST_METHOD_MAP = new Map(LIST_METHODS.map((f) => [f.name, f]));
export const OBJECT_METHOD_MAP = new Map(OBJECT_METHODS.map((f) => [f.name, f]));
export const KEYWORD_MAP = new Map(KEYWORDS.map((k) => [k.name, k]));

// A method name may exist on more than one container type (e.g. `contains`).
export const ALL_METHODS_BY_NAME = new Map<string, FuncDoc[]>();
for (const list of [STRING_METHODS, LIST_METHODS, OBJECT_METHODS]) {
  for (const m of list) {
    const arr = ALL_METHODS_BY_NAME.get(m.name);
    if (arr) arr.push(m);
    else ALL_METHODS_BY_NAME.set(m.name, [m]);
  }
}
