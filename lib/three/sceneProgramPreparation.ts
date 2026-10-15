import { Object3D, type Camera, type Material, type Scene } from "three";

interface ReadyProgram {
  isReady: () => boolean;
}
interface ProgramProperties {
  currentProgram?: ReadyProgram;
  programs?: Map<string, ReadyProgram>;
}
interface PreparationRenderer {
  compile: (scope: Object3D, camera: Camera, scene: Scene) => Set<Material>;
  properties: { get: (material: Material) => unknown };
  shadowMap?: { enabled: boolean; type: number };
  toneMapping?: number;
  outputColorSpace?: string;
  getRenderTarget?: () => {
    texture: { colorSpace: string; type: number };
  } | null;
}

interface PreparedState {
  environment: Scene["environment"];
  shadows: boolean | undefined;
  shadowType: number | undefined;
  toneMapping: number | undefined;
  outputColorSpace: string | undefined;
  target: unknown;
  targetColorSpace: string | undefined;
  targetType: number | undefined;
}

/** Three r185 exposes the same currentProgram/isReady path to compileAsync.
 * Poll it from the guarded clock so context loss and unmount can cancel it.
 * Begin inside Scene.onBeforeRender, after Three selects the actual color pass.
 */
export class SceneProgramPreparation {
  private pending: Map<ReadyProgram, Material[]> | null = null;
  private revision: string | undefined;
  private prepared: PreparedState | undefined;
  constructor(private readonly renderer: PreparationRenderer) {}

  get started() {
    return this.pending !== null;
  }

  /** Visible retained materials may have evicted programs or new mesh variants. */
  setRevision(revision: string | undefined) {
    if (revision === this.revision) return false;
    this.revision = revision;
    this.reset();
    return true;
  }

  begin(scene: Scene, camera: Camera) {
    const target = this.renderer.getRenderTarget?.() ?? null,
      shadows = this.renderer.shadowMap?.enabled,
      shadowType = this.renderer.shadowMap?.type,
      toneMapping = this.renderer.toneMapping,
      outputColorSpace = this.renderer.outputColorSpace,
      targetColorSpace = target?.texture.colorSpace,
      targetType = target?.texture.type,
      previous = this.prepared;
    if (
      this.pending &&
      previous &&
      previous.environment === scene.environment &&
      previous.shadows === shadows &&
      previous.shadowType === shadowType &&
      previous.toneMapping === toneMapping &&
      previous.outputColorSpace === outputColorSpace &&
      previous.target === target &&
      previous.targetColorSpace === targetColorSpace &&
      previous.targetType === targetType
    )
      return;
    // Canvas configuration can land after the React revision. Compare the real
    // color-pass state before any draw, including a late shared studio bake.
    this.prepared = {
      environment: scene.environment,
      shadows,
      shadowType,
      toneMapping,
      outputColorSpace,
      target,
      targetColorSpace,
      targetType,
    };
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
      const properties = this.properties(material);
      const retain = (program: ReadyProgram) => {
        const aliases = pending.get(program);
        if (aliases) {
          if (!aliases.includes(material)) aliases.push(material);
        } else pending.set(program, [material]);
      };
      // One material may serve ordinary, instanced and morph-enabled meshes.
      // currentProgram exposes only the last variant compiled for that material.
      if (properties?.programs) {
        for (const program of properties.programs.values()) retain(program);
      } else if (properties?.currentProgram) retain(properties.currentProgram);
    }
    this.pending = pending;
  }

  private properties(material: Material) {
    return this.renderer.properties.get(material) as
      ProgramProperties | undefined;
  }

  private retains(material: Material, program: ReadyProgram) {
    const properties = this.properties(material);
    if (properties?.programs) {
      for (const cached of properties.programs.values())
        if (cached === program) return true;
      return false;
    }
    return properties?.currentProgram === program;
  }

  ready() {
    if (!this.pending) return false;
    for (const [program, materials] of this.pending) {
      // Selecting a flower during startup can evict hidden materials. Never
      // query a deleted native program once all its material references leave.
      const retained = materials.some((material) =>
        this.retains(material, program),
      );
      if (!retained || program.isReady()) this.pending.delete(program);
    }
    return this.pending.size === 0;
  }

  reset() {
    this.pending?.clear();
    this.pending = null;
    this.prepared = undefined;
  }
}
