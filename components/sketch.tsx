"use client";

import { useViewportSize } from "@/lib/use_viewport_size";
import { debounce } from "@/lib/util";
import {
  useState,
  useEffect,
  useRef,
  EffectCallback,
  RefObject,
  useCallback,
} from "react";

export type BaseState = {
  // Logical width and height of canvas in CSS pixels.
  width: number;
  height: number;
  time: number;
  frameCount: number;
};

export function useSketch<State extends object = {}>({
  canvas: ref,
  state,
  setup,
  draw,
  debug = {
    showFrameRate: false,
  },
}: {
  canvas: RefObject<HTMLCanvasElement | null>;
  // Must be able to `structuredClone` with no loss of correctness.
  state?: State;
  setup: (ctx: CanvasRenderingContext2D, state: BaseState) => void;
  draw: (ctx: CanvasRenderingContext2D, state: State & BaseState) => void;
  debug?: {
    showFrameRate?: boolean;
  };
}) {
  const canvas = ref.current;
  const stateRef = useRef(state);
  const viewport = useViewportSize();

  useEffect(() => {
    stateRef.current = state ? structuredClone(state) : null;
  }, [state]);

  useEffect(() => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to obtain 2D context from canvas");

    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    fitCanvasToViewport(canvas, viewport);

    setup(ctx, {
      width: canvas.width / (window.devicePixelRatio || 1),
      height: canvas.height / (window.devicePixelRatio || 1),
      time: 0,
      frameCount: 0,
    });

    let t0: number;
    let frameCount = 0;
    let frameId: number;

    function animate(timestamp: number) {
      if (t0 === undefined) {
        t0 = timestamp;
      }
      const elapsed = timestamp - t0;

      draw(ctx, {
        width: canvas.width / (window.devicePixelRatio || 1),
        height: canvas.height / (window.devicePixelRatio || 1),
        time: elapsed,
        frameCount,
        ...stateRef.current,
      } satisfies State & BaseState);

      if (debug?.showFrameRate) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 80, 24);
        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        const fps = frameCount / (elapsed / 1000);
        ctx.fillText(fps.toFixed(1) + " fps", 8, 16);
      }

      frameCount++;
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [canvas, stateRef.current, setup, draw, debug]);

  useEffect(() => {
    if (!canvas) return;
    fitCanvasToViewport(canvas, viewport);
  }, [canvas, viewport]);
}

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
  ctx.resetTransform();
  ctx.scale(dpr, dpr);
  console.log("Fit canvas to viewport", canvas.width, canvas.height);
}
