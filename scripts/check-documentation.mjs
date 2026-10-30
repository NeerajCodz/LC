import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];
let links = 0;
function check(file) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(
    /!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)[^)]*\)/g,
  )) {
    const target = match[1].replace(/^<|>$/g, "");
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
    const pathname = decodeURI(target.split(/[?#]/)[0]);
    if (!pathname) continue;
    links++;
    if (!existsSync(resolve(dirname(file), pathname)))
      failures.push(`${file}: ${target}`);
  }
}
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const file = resolve(folder, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".md")) check(file);
  }
}
check(resolve(root, "README.md"));
check(resolve(root, "AGENTS.md"));
walk(resolve(root, "docs"));
for (const entry of readdirSync(resolve(root, "docs/research"))) {
  if (!entry.endsWith(".md") || entry === "README.md") continue;
  const specimen = resolve(root, "docs/specimens", entry);
  if (!existsSync(specimen))
    failures.push(`Missing specimen companion: ${entry}`);
}
for (const folder of ["research", "specimens"]) {
  for (const entry of readdirSync(resolve(root, "docs", folder))) {
    if (!entry.endsWith(".md"))
      failures.push(`Unexpected non-Markdown file in ${folder}: ${entry}`);
    if (/-(research|validation)\.md$/.test(entry))
      failures.push(`Unorganized document: ${folder}/${entry}`);
  }
}
assert.equal(failures.length, 0, failures.join("\n"));
console.log(
  `Documentation verified: ${links} local links and paired research/specimen guides.`,
);
