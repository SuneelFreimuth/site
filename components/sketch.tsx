'use client';

import { useViewportSize } from "@/lib/use_viewport_size";
import { debounce } from "@/lib/util";
import { useState, useEffect, useRef, EffectCallback, RefObject } from "react";

export type BaseState = {
  time: number;
  frameCount: number;
};

export function useSketch<State extends object = {}>({
  canvas: ref,
  state,
  setup,
  draw,
}: {
  canvas: RefObject<HTMLCanvasElement | null>;
  // Must be able to `structuredClone` with no loss of correctness.
  state: State;
  setup: (ctx: CanvasRenderingContext2D) => void;
  draw: (ctx: CanvasRenderingContext2D, state: State) => void;
}) {
  const canvas = ref.current;
  const stateRef = useRef(state);
  const viewport = useViewportSize();

  useEffect(() => {
    stateRef.current = structuredClone(state);
  }, [state]);

  useEffect(() => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to obtain 2D context from canvas");
    setup(ctx);

    let t0: number;
    let frameCount = 0;
    let frameId: number;

    function animate(timestamp: number) {
      if (t0 === undefined) {
        t0 = timestamp;
      }
      const elapsed = timestamp - t0;

      draw(ctx, {
        ...stateRef.current,
        time: elapsed,
        frameCount,
      } satisfies State & BaseState);

      frameCount++;
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [canvas, stateRef.current, setup, draw]);

  useEffect(() => {
    if (!canvas) return;
    fitCanvasToViewportDebounced(canvas, viewport);
  }, [viewport]);
}

const fitCanvasToViewportDebounced = debounce(200, fitCanvasToViewport);

function fitCanvasToViewport(
  canvas: HTMLCanvasElement,
  viewport: { width: number; height: number },
) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio ?? 1;
  canvas.width = viewport.width * dpr;
  canvas.height = viewport.height * dpr;
  canvas.style.width = viewport.width + "px";
  canvas.style.height = viewport.height + "px";
  ctx.scale(dpr, dpr);
}

// export function AnimatedBackground({
//   setup,
//   draw,
// }: {
//   setup: (ctx: CanvasRenderingContext2D) => void;
//   draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
// }) {
//   const viewport = useViewportSize();
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const fitCanvasToViewport = debounce(200, () => {
//     if (canvasRef.current) {
//       const canvas: HTMLCanvasElement = canvasRef.current;
//       const ctx = canvasRef.current.getContext("2d")!;

//       const dpr = window.devicePixelRatio ?? 1;
//       canvas.width = viewport.width * dpr;
//       canvas.height = viewport.height * dpr;
//       canvas.style.width = viewport.width + "px";
//       canvas.style.height = viewport.height + "px";
//       ctx.scale(dpr, dpr);
//     }
//   }) satisfies EffectCallback;

//   useEffect(() => {
//     if (!canvasRef.current) return;
//     const canvas: HTMLCanvasElement = canvasRef.current;
//     fitCanvasToViewport();
//     const ctx = canvas.getContext("2d");
//     if (!ctx) throw new Error("Failed to obtain 2D context from canvas");
//     setup(ctx);

//     let frameId: number;
//     let frameCount = 0;
//     (function animate() {
//       draw(ctx, frameCount);
//       frameCount++;
//       frameId = requestAnimationFrame(animate);
//     })();

//     return () => {
//       cancelAnimationFrame(frameId);
//     };
//   }, [canvasRef]);

//   useEffect(fitCanvasToViewport, [canvasRef, viewport]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         overflow: "hidden",
//         zIndex: -1,
//       }}
//     />
//   );
// }
