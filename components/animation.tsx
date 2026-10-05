import { RefObject, useState } from "react";
import { useEffect, useRef } from "react";

export type Ctx = CanvasRenderingContext2D;

export function Animation({ width, height, setup, draw }: {
  width: number;
  height: number;
  setup: (ctx: Ctx) => void;
  draw: (ctx: Ctx, t: number, dt: number, inputs: InputObserver) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current)
      return;

    const inputs = new InputObserver();
    inputs.observe(canvas.current);

    const ctx = canvas.current.getContext('2d')!;
    setup(ctx);

    let start: number | null = null;
    let prev: number | null = null;
    let animationFrame: number;
    animationFrame = requestAnimationFrame(function step(timestamp) {
      timestamp *= 1e-3;
      if (start === null)
        start = timestamp;
      const t = timestamp - start;
      const dt = prev ? timestamp - prev : 0.001;
      draw(ctx, t, dt, inputs);
      animationFrame = requestAnimationFrame(step);
      prev = timestamp;
    });

    return () => {
      if (canvas.current) {
        inputs.unobserve(canvas.current);
      }
      cancelAnimationFrame(animationFrame)
    };
  }, [canvas.current]);

  useEffect(() => {
    canvas.current!.width = width;
    canvas.current!.height = height;
  }, [width, height]);

  return (
    <canvas
      ref={canvas}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      width={width}
      height={height}
    />
  );
}


export class InputObserver {
  public mouseX: number;
  public mouseY: number;
  public buttons: {
    primary: boolean;
  };

  constructor() {
    this.mouseX = -1;
    this.mouseY = -1;
    this.buttons = {
      primary: false,
    };
  }

  #listener = (e: MouseEvent) => {
    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;
    this.buttons.primary = Boolean(e.buttons & 1);
  }

  observe = (elem: HTMLElement) => {
    elem.addEventListener('mousemove', this.#listener);
    elem.addEventListener('mousedown', this.#listener);
    elem.addEventListener('mouseup', this.#listener);
  }

  unobserve = (elem: HTMLElement) => {
    elem.removeEventListener('mousemove', this.#listener);
    elem.removeEventListener('mousedown', this.#listener);
    elem.removeEventListener('mouseup', this.#listener);
  }
}
