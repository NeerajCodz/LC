"use client";

import { Canvas } from "@react-three/fiber";
import { botanicalEvents } from "@/lib/three/events";
import type { FlowerType } from "@/lib/flowers/types";
import type { FlowerView } from "@/lib/flowers/views";
import { BotanicalView } from "./BotanicalView";

/** Keep the render surface in its DOM frame so native scrolling moves both together. */
export function FlowerPreview({
  type,
  angle,
  bloom,
  hovered,
  visible,
  detailed = false,
  className,
}: {
  type: FlowerType;
  angle: FlowerView;
  bloom: number;
  hovered: boolean;
  visible: boolean;
  detailed?: boolean;
  className: string;
}) {
  return (
    <div className={`${className} flower-preview`} data-flower-preview={type}>
      {visible && (
        <Canvas
          events={botanicalEvents}
          resize={{ scroll: false }}
          dpr={angle === "macro" ? [2, 2.5] : [1.5, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <BotanicalView
            type={type}
            angle={angle}
            bloom={bloom}
            hovered={hovered}
            detailed={detailed}
          />
        </Canvas>
      )}
    </div>
  );
}
