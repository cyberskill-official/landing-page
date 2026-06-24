"use client";

import { Component, type ReactNode } from "react";

// Error boundary for the optional GLB Lumi (FR-SCENE-010 / FR-CHAR-022 §4). The
// Suspense boundary in GenieScene handles the *loading* state, but a rejected
// load (missing file, decode failure, bad URL) throws from useGLTF. Without a
// boundary that error would propagate up and blank the canvas. This catches it
// and renders the fallback (the procedural Lumi) so the page never breaks.
//
// It lives inside the R3F Canvas, so the fallback must be scene content, not DOM.
type Props = { fallback: ReactNode; children: ReactNode };
type State = { failed: boolean };

export class GlbBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Surface it for diagnostics without breaking the render path.
    console.warn("[Lumi] GLB failed to load; falling back to the procedural model.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
