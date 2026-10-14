import type { ReactNode, RefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { Vec3 } from "@/lib/flowers/types";
import type { FlowerOrganRayProbe } from "./FloralParts";

/** Phones hit a small invisible envelope, not every triangle of every petal. */
export function FlowerInteraction({
  children,
  enabled,
  proxyRadius,
  proxyCenter,
  onHover,
  onClick,
  rayProbe,
}: {
  children: ReactNode;
  enabled: boolean;
  proxyRadius?: number;
  proxyCenter?: Vec3;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
  rayProbe?: RefObject<FlowerOrganRayProbe | null>;
}) {
  const handlers = enabled
    ? {
        onPointerDown: (event: ThreeEvent<PointerEvent>) => {
          rayProbe?.current?.(event.ray);
          event.stopPropagation();
          (event.target as Element | null)?.setPointerCapture(event.pointerId);
        },
        onPointerUp: (event: ThreeEvent<PointerEvent>) => {
          (event.target as Element | null)?.releasePointerCapture(
            event.pointerId,
          );
        },
        onPointerOver: (event: ThreeEvent<PointerEvent>) => {
          rayProbe?.current?.(event.ray);
          event.stopPropagation();
          onHover?.(true);
        },
        onPointerMove: (event: ThreeEvent<PointerEvent>) => {
          rayProbe?.current?.(event.ray);
        },
        onPointerOut: () => onHover?.(false),
        onClick: (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (event.delta <= 5) onClick?.();
        },
      }
    : {};
  if (proxyRadius !== undefined)
    return (
      <group>
        {enabled && (
          <mesh
            visible={false}
            position={proxyCenter}
            scale={[
              proxyRadius,
              Math.max(0.5, proxyRadius * 0.75),
              proxyRadius,
            ]}
            {...handlers}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial />
          </mesh>
        )}
        {children}
      </group>
    );
  return <group {...handlers}>{children}</group>;
}
