import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface ListedSuite {
  suites?: ListedSuite[];
  specs?: {
    id: string;
    file: string;
    title: string;
    tests: { projectName: string }[];
  }[];
}
interface BrowserCase {
  id: string;
  file: string;
  title: string;
  project: string;
}
interface Report {
  suites: ListedSuite[];
  errors?: unknown[];
  stats: {
    expected: number;
    unexpected: number;
    skipped: number;
    flaky: number;
  };
}

const inspection = process.argv.includes("--inspection");
const listOnly = process.argv.includes("--list");
const selection = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--grep="))
  ?.slice(7);
const selectedTitles = selection ? new RegExp(selection) : null;
const projects = process.argv
  .slice(2)
  .filter((arg) => arg.startsWith("--project="))
  .map((arg) => arg.slice(10));
const cli = resolve("node_modules/@playwright/test/cli.js");
const environment = { ...process.env, DEV_INSPECTION: "1" };
const listed = spawnSync(
  process.execPath,
  [cli, "test", "--list", "--reporter=json"],
  {
    env: environment,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  },
);
if (listed.status !== 0)
  throw new Error(
    listed.stderr || listed.stdout || "Browser test listing failed",
  );
const listing = JSON.parse(listed.stdout) as Report;
if (listing.errors?.length) throw new Error(JSON.stringify(listing.errors));
const cases: BrowserCase[] = [];
function collect(suite: ListedSuite) {
  for (const spec of suite.specs ?? [])
    for (const test of spec.tests)
      if (
        spec.file.includes("inspection") === inspection &&
        (!projects.length || projects.includes(test.projectName)) &&
        (!selectedTitles || selectedTitles.test(spec.title))
      )
        cases.push({
          id: spec.id,
          file: spec.file,
          title: spec.title,
          project: test.projectName,
        });
  for (const child of suite.suites ?? []) collect(child);
}
for (const suite of listing.suites) collect(suite);
if (!cases.length) throw new Error("No browser cases selected");
if (listOnly) {
  process.stdout.write(JSON.stringify(cases, null, 2) + "\n");
} else {
  const output = resolve(
    "test-results",
    `isolated-${inspection ? "inspection" : "production"}-${Date.now()}`,
  );
  mkdirSync(output, { recursive: true });
  const results: (BrowserCase & { exit: number | null; report: string })[] = [];
  for (const [index, test] of cases.entries()) {
    const label = `${test.project}-${String(index + 1).padStart(3, "0")}`;
    const reportPath = resolve(output, `${label}.json`);
    const escape = String.fromCharCode(92);
    const metacharacters = escape + "^$.*+?()[]{}|";
    const grep =
      "(?:^|" +
      escape +
      "s)" +
      Array.from(test.title, (character) =>
        metacharacters.includes(character) ? escape + character : character,
      ).join("") +
      "$";
    process.stdout.write(
      `\n${index + 1}/${cases.length} ${test.project}: ${test.title}\n`,
    );
    const run = spawnSync(
      process.execPath,
      [
        cli,
        "test",
        `tests/browser/${test.file}`,
        `--project=${test.project}`,
        "--grep",
        grep,
        "--workers=1",
        "--reporter=line,json",
        `--output=${resolve(output, label)}`,
      ],
      {
        stdio: "inherit",
        env: {
          ...environment,
          DEV_INSPECTION: inspection ? "1" : "0",
          PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath,
        },
      },
    );
    if (run.error) throw run.error;
    const report = JSON.parse(readFileSync(reportPath, "utf8")) as Report;
    const { expected, unexpected, skipped, flaky } = report.stats;
    if (expected + unexpected + skipped + flaky !== 1)
      throw new Error(`Case selection was not unique: ${test.title}`);
    results.push({ ...test, exit: run.status, report: reportPath });
    writeFileSync(
      resolve(output, "summary.json"),
      JSON.stringify(results, null, 2),
    );
    if (
      run.status !== 0 ||
      unexpected ||
      skipped ||
      flaky ||
      report.errors?.length
    )
      process.exitCode = 1;
  }
  process.stdout.write(`\nReports: ${output}\n`);
}
