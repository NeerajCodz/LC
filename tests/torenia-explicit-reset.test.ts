import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function source(path: string) {
  return ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
function elements(file: ts.SourceFile, tag: string) {
  const found: (ts.JsxOpeningElement | ts.JsxSelfClosingElement)[] = [];
  function visit(node: ts.Node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(file) === tag
    )
      found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(file);
  return found;
}
function attribute(
  element: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  name: string,
) {
  return element.attributes.properties.find(
    (p) => ts.isJsxAttribute(p) && p.name.getText() === name,
  ) as ts.JsxAttribute | undefined;
}
function expression(
  element: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  name: string,
) {
  const value = attribute(element, name)?.initializer;
  assert.ok(
    value && ts.isJsxExpression(value) && value.expression,
    `Missing ${name} JSX expression`,
  );
  return value.expression;
}
test("ordinary click preserves its pulse/macro behavior while only the explicit button advances Torenia's downstream reset serial", () => {
  const experience = source("components/Experience.tsx"),
    scene = source("components/flowers/FlowerScene.tsx"),
    plant = source("components/flowers/FlowerPlant.tsx");
  const sceneNode = elements(experience, "Scene")[0],
    resetExpression = expression(sceneNode, "pulseSerial");
  assert.equal(resetExpression.getText(experience), "pulseSerial");
  assert.equal(
    expression(elements(scene, "Flower")[0], "pulseSerial").getText(scene),
    "pulseSerial",
  );
  assert.equal(
    expression(elements(plant, "Organs")[0], "pulseSerial").getText(plant),
    "pulseSerial",
  );
  const button = elements(experience, "button").find(
    (element) =>
      attribute(element, "aria-label")?.initializer?.getText(experience) ===
      '"Pulse the flower"',
  );
  assert.ok(button);
  let pulse = 0,
    serial = 0,
    macro = false,
    paused = true;
  const setters = [
    (update: (p: number) => number) => {
      pulse = update(pulse);
    },
    (update: (p: number) => number) => {
      serial = update(serial);
    },
    (update: (p: boolean) => boolean) => {
      macro = update(macro);
    },
    (value: boolean) => {
      paused = value;
    },
  ];
  function handler(node: ts.Expression) {
    const code = ts.transpileModule(
      `const handler=${node.getText(experience)};`,
      { compilerOptions: { target: ts.ScriptTarget.ES2020 } },
    ).outputText;
    return new Function(
      "setPulse",
      "setPulseSerial",
      "setMacro",
      "setPaused",
      "reducedMotion",
      code + "return handler;",
    )(...setters, false) as () => void;
  }
  const click = handler(expression(sceneNode, "onFlowerClick")),
    explicit = handler(expression(button, "onClick"));
  click();
  assert.deepEqual([pulse, serial, macro], [1, 0, true]);
  click();
  assert.deepEqual([pulse, serial, macro], [2, 0, false]);
  explicit();
  assert.deepEqual([pulse, serial, macro, paused], [3, 1, false, false]);
});
test("garden selection has no pulse mutation and only the explicit breeze counter reaches the reset slot", () => {
  const garden = source("components/Garden.tsx"),
    flowerGarden = source("components/flowers/FlowerGarden.tsx"),
    flowers = elements(flowerGarden, "Flower");
  assert.equal(
    expression(flowers[0], "pulseSerial").getText(flowerGarden),
    "pulse",
  );
  const select = expression(flowers[0], "onClick").getText(flowerGarden);
  assert.ok(!select.includes("pulse") && !select.includes("setPulse"));
  let pulseCalls = 0;
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(garden) === "setPulse"
    )
      pulseCalls++;
    ts.forEachChild(node, visit);
  }
  visit(garden);
  assert.equal(pulseCalls, 1);
  const button = elements(garden, "button").find((element) =>
    element.parent.getText(garden).includes("A passing breeze"),
  );
  assert.ok(button);
  assert.ok(expression(button, "onClick").getText(garden).includes("setPulse"));
});
