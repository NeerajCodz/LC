import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// R3F 9.7.0's Canvas starts async configure() without handling rejection.
// Forward it to its existing error state so our scene boundary can catch it.
// Apply on npm AND pnpm installs; fail explicitly when an upgrade needs review.
const require = createRequire(import.meta.url);
const root = dirname(require.resolve("@react-three/fiber/package.json"));
const { version } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
);
if (version !== "9.7.0")
  throw new Error("Review the Canvas startup patch for R3F " + version);
for (const file of [
  "react-three-fiber.esm.js",
  "react-three-fiber.cjs.dev.js",
  "react-three-fiber.cjs.prod.js",
]) {
  const path = join(root, "dist", file);
  const source = readFileSync(path, "utf8");
  const original = "      run();";
  const patched = "      run().catch(setError);";
  if (source.includes(patched)) continue;
  if (source.split(original).length !== 2)
    throw new Error("Unexpected Canvas startup in " + file);
  writeFileSync(path, source.replace(original, patched));
}
