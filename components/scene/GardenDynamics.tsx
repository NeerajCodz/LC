"use client";
import { createContext, useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  gustEnvelope,
  resolvePlantContacts,
  type ContactBody,
} from "@/lib/flowers/wind";

export interface GardenBody extends ContactBody {
  commit: () => void;
}
interface GardenState {
  time: number;
  gust: number;
  bodies: GardenBody[];
}
export const GardenEnvironment = createContext<RefObject<GardenState> | null>(
  null,
);

export function GardenDynamics({
  children,
  breeze,
  paused,
  reducedMotion,
}: {
  children: ReactNode;
  breeze: number;
  paused: boolean;
  reducedMotion: boolean;
}) {
  const state = useRef<GardenState>({ time: 0, gust: 0, bodies: [] });
  const lastBreeze = useRef(breeze),
    age = useRef(10);
  useFrame((_, dt) => {
    if (paused) return;
    state.current.time += Math.min(dt, 0.05);
    if (lastBreeze.current !== breeze) {
      lastBreeze.current = breeze;
      age.current = 0;
    }
    age.current += Math.min(dt, 0.05);
    state.current.gust = reducedMotion ? 0 : gustEnvelope(age.current);
  }, -4);
  // Plants first predict their wind pose; then contact constrains it before stems draw.
  useFrame(() => {
    if (paused || reducedMotion) return;
    resolvePlantContacts(state.current.bodies);
    for (const body of state.current.bodies) body.commit();
  }, -1);
  return <GardenEnvironment value={state}>{children}</GardenEnvironment>;
}
