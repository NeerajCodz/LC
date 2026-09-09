"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { usePreviewStage } from "../scene/PreviewStage";
import type { FlowerType } from "@/lib/flowers/types";
import type { FlowerView } from "@/lib/flowers/views";

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
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const { update, remove } = usePreviewStage();
  useLayoutEffect(() => {
    if (ref.current)
      update(id, {
        node: ref.current,
        type,
        angle,
        bloom,
        hovered,
        visible,
        detailed,
      });
  }, [id, update, type, angle, bloom, hovered, visible, detailed]);
  useLayoutEffect(() => () => remove(id), [id, remove]);
  return (
    <div
      ref={ref}
      className={`${className} flower-preview`}
      data-flower-preview={type}
    />
  );
}
