const fs = require('fs');
let code = fs.readFileSync('scripts/check-frs.mjs', 'utf8');

code = code.replace(
  'return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") && basename(p).startsWith("FR-") ? [p] : [];',
  `if (statSync(p).isDirectory()) return walk(p);
    if (p.endsWith(".md")) {
      const base = basename(p);
      if (base.startsWith("FR-")) return [p];
      const parentDir = basename(require("path").dirname(p));
      if (base === "spec.md" && parentDir.startsWith("FR-")) return [p];
    }
    return [];`
);

code = code.replace(
  'if (!basename(path).startsWith(id)) err(id, "FM-001", `filename does not start with the id (${basename(path)})`);',
  'const baseNameForCheck = basename(path) === "spec.md" ? basename(require("path").dirname(path)) : basename(path);\n  if (!baseNameForCheck.startsWith(id)) err(id, "FM-001", `filename or folder does not start with the id (${baseNameForCheck})`);'
);

fs.writeFileSync('scripts/check-frs.mjs', code);
