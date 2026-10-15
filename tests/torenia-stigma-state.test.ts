import test from "node:test";
import assert from "node:assert/strict";
import {
  createToreniaStigmaState,
  touchToreniaStigma,
  advanceToreniaStigma,
  writeToreniaStigmaMorph,
} from "../components/flowers/torenia/toreniaStigmaState";
import { Mesh } from "three";
test("Torenia closes only the touched inner stigma lobe and has an explicitly authored reset", () => {
  const state = createToreniaStigmaState();
  touchToreniaStigma(state, 0, false, 1);
  advanceToreniaStigma(state, 0.05);
  assert.deepEqual(state.closure, [0, 0]);
  touchToreniaStigma(state, 1, true, 0.2);
  advanceToreniaStigma(state, 0.05);
  assert.deepEqual(state.closure, [0, 0]);
  touchToreniaStigma(state, 1, true, 1);
  for (let i = 0; i < 40; i++) advanceToreniaStigma(state, 0.05);
  assert.equal(state.closure[0], 0);
  assert.ok(state.closure[1] > 0.99);
  const held = state.closure[1];
  advanceToreniaStigma(state, 100, true);
  assert.equal(state.closure[1], held);
  advanceToreniaStigma(state, 0.05, false, false, true);
  assert.ok(state.closure[1] < held);
  advanceToreniaStigma(state, 0.05, false, true);
  assert.deepEqual(state.closure, [0, 0]);
});
test("Torenia's imperative weights preserve bloom while closure moves only its independent target", () => {
  const mesh = new Mesh();
  mesh.morphTargetInfluences = [0, 0];
  writeToreniaStigmaMorph(mesh, 0.5, 0.8);
  assert.deepEqual(mesh.morphTargetInfluences, [0.5, 0.4]);
  writeToreniaStigmaMorph(mesh, 0, 1);
  assert.deepEqual(mesh.morphTargetInfluences, [1, 0]);
});
