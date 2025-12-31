'use client';

import { JSX } from "react";

export class AssertionError extends Error {}

export function assert(
    condition: boolean,
    message?: string,
): asserts condition {
    if (!condition) {
        throw new AssertionError(message ?? "Assertion failed");
    }
}

export function isSome<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

export const cn = (...classes: (string | null | undefined)[]): string =>
    classes.filter(isSome).join(" ");

export const cnWhen = (
    condition: boolean,
    classTrue: string,
    classFalse?: string,
) => (condition ? classTrue : classFalse);

export const when = (
    cond: boolean,
    element: JSX.Element | (() => JSX.Element),
): JSX.Element | null =>
    cond ? (typeof element === "function" ? element() : element) : null;

export function imset<T = Object>(obj: T, props: Partial<T>): T {
    return { ...structuredClone(obj), ...props };
}

export type Color = [number, number, number];

export function random(min: number = 1, max?: number): number {
    if (min === undefined && max === undefined) {
        return Math.random();
    }

    if (max === undefined) {
        max = min;
        min = 0;
    }

    return min + Math.random() * (max - min);
}

export const map = (
    x: number,
    a: number,
    b: number,
    c: number,
    d: number,
): number => c + ((x - a) / (b - a)) * (d - c);

export const lerp = (t: number, min: number, max: number): number =>
    min + t * (max - min);

export const lerpColors = (t: number, c0: Color, c1: Color): Color => [
    lerp(t, c0[0], c1[0]),
    lerp(t, c0[1], c1[1]),
    lerp(t, c0[2], c1[2]),
];

export const colorFromHex = (color: string): Color => {
    if (color[0] === "#") color = color.substring(1);
    assert(
        color.length === 3 || color.length === 6,
        `Invalid color ${color}, length without pound \`#\` prefix should be 3 or 6`,
    );
    return [
        parseInt(color.substring(0, 2), 16),
        parseInt(color.substring(2, 4), 16),
        parseInt(color.substring(4, 6), 16),
    ];
};

export const hslToRgb = ([h, s, l]: Color): Color => {
    h %= 360;
    if (h < 0) h += 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r: number, g: number, b: number;
    if (h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        // h < 360
        [r, g, b] = [c, 0, x];
    }
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};

export const randomHsl = (
    [minH, minS, minL]: Color,
    [maxH, maxS, maxL]: Color,
): Color => [
    lerp(Math.random(), minH, maxH),
    lerp(Math.random(), minS, maxS),
    lerp(Math.random(), minL, maxL),
];

export const rgbString = ([r, g, b]: Color) => `rgb(${r}, ${g}, ${b})`;

export function debounce(ms: number, f: (...args: any[]) => void): (...args: any[]) => void {
    let lastCall: number | null = null;
    return (...args) => {
        if (lastCall == null || Date.now() - lastCall < ms) {
            f(...args);
            lastCall = Date.now();
        }
    };
}

export const MOBILE_THRESHOLD = "500px";

export function onMobile() {
    "use client";
    return window.matchMedia(`(max-width: ${MOBILE_THRESHOLD})`).matches;
}
