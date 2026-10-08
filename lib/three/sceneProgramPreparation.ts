import { Object3D, type Camera, type Material, type Scene } from "three";

interface ReadyProgram {
  isReady: () => boolean;
}
interface ProgramProperties {
  currentProgram?: ReadyProgram;
}
interface PreparationRenderer {
  compile: (scope: Object3D, camera: Camera, scene: Scene) => Set<Material>;
  properties: { get: (material: Material) => unknown };
}

/** Three r185 exposes the same currentProgram/isReady path to compileAsync.
 * Poll it from the guarded clock so context loss and unmount can cancel it.
 * Begin inside Scene.onBeforeRender, after Three selects the actual color pass.
 */
export class SceneProgramPreparation {
  private pending: Map<ReadyProgram, Material[]> | null = null;
  constructor(private readonly renderer: PreparationRenderer) {}

  get started() {
    return this.pending !== null;
  }

  begin(scene: Scene, camera: Camera) {
    if (this.pending) return;
    const pending = new Map<ReadyProgram, Material[]>();
    const draws: Object3D[] = [];
    scene.traverseVisible((object) => {
      const draw = object as Object3D & {
        isMesh?: boolean;
        isPoints?: boolean;
        isLine?: boolean;
        isSprite?: boolean;
      };
      if (draw.isMesh || draw.isPoints || draw.isLine || draw.isSprite)
        draws.push(object);
    });
    // compile() traverses hidden objects too. Supply a read-only view of visible
    // draws, with the original scene as its lighting/environment target. Original
    // objects keep their parents, matrices, morphs and material references.
    const scope = new Object3D();
    scope.traverse = scope.traverseVisible = (visit) => {
      visit(scope);
      for (const draw of draws) visit(draw);
    };
    for (const material of this.renderer.compile(scope, camera, scene)) {
      const program = this.program(material);
      if (!program) continue;
      const aliases = pending.get(program);
      if (aliases) aliases.push(material);
      else pending.set(program, [material]);
    }
    this.pending = pending;
  }

  private program(material: Material) {
    return (
      this.renderer.properties.get(material) as ProgramProperties | undefined
    )?.currentProgram;
  }

  ready() {
    if (!this.pending) return false;
    for (const [program, materials] of this.pending) {
      // Selecting a flower during startup can evict hidden materials. Never
      // query a deleted native program once all its material references leave.
      const retained = materials.some(
        (material) => this.program(material) === program,
      );
      if (!retained || program.isReady()) this.pending.delete(program);
    }
    return this.pending.size === 0;
  }

  reset() {
    this.pending?.clear();
    this.pending = null;
  }
}
