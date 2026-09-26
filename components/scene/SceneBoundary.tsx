"use client";

import { Component, type ReactNode } from "react";
import { markWebGL2Unavailable } from "./WebGLSupport";

/** Isolate the optional renderer, leaving the surrounding DOM route mounted. */
export class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn(
      "Project LC switched to botanical browsing after a scene failure.",
      error,
    );
    markWebGL2Unavailable();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
