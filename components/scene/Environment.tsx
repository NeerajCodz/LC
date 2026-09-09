import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { acquireStudioEnvironment } from "@/lib/three/studio-environment";

export function Environment() {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const state = get(),
      scene = state.scene;
    const previous = scene.environment,
      previousIntensity = scene.environmentIntensity;
    const lease = acquireStudioEnvironment(state.gl);
    let mounted = true;
    void lease.ready.then(
      ({ target, backend }) => {
        if (!mounted) return;
        scene.environment = target.texture;
        scene.environmentIntensity = 0.35;
        state.gl.domElement.dataset.lightingBackend = backend;
        state.invalidate();
      },
      (error) => {
        if (mounted)
          console.error("Studio environment could not be prepared", error);
      },
    );
    return () => {
      mounted = false;
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      lease.release();
    };
  }, [get]);
  return null;
}
