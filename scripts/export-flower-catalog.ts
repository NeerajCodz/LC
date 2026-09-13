import { mkdir, writeFile } from "node:fs/promises";
import { FLOWERS } from "../lib/flowers/catalog";

async function main() {
  await mkdir("dist/taxonomy", { recursive: true });
  await writeFile(
    "dist/taxonomy/catalog.json",
    JSON.stringify(
      FLOWERS.map(({ type, name, latin, family }) => ({
        slug: type,
        name,
        scientificName: latin,
        family,
      })),
      null,
      2,
    ) + "\n",
  );
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
