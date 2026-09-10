import type { ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";

/** Phones hit a small invisible envelope, not every triangle of every petal. */
export function FlowerInteraction({
  children,
  enabled,
  proxyRadius,
  onHover,
  onClick,
}: {
  children: ReactNode;
  enabled: boolean;
  proxyRadius?: number;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}) {
  const handlers = enabled
    ? {
        onPointerDown: (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          (event.target as Element | null)?.setPointerCapture(event.pointerId);
        },
        onPointerUp: (event: ThreeEvent<PointerEvent>) => {
          (event.target as Element | null)?.releasePointerCapture(
            event.pointerId,
          );
        },
        onPointerOver: (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onHover?.(true);
        },
        onPointerOut: () => onHover?.(false),
        onClick: (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onClick?.();
        },
      }
    : {};
  if (proxyRadius !== undefined)
    return (
      <group>
        {enabled && (
          <mesh
            visible={false}
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
