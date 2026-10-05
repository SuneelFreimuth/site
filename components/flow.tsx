'use client';

import { useRef, useState } from 'react';
import p5 from 'p5';
import { ReactP5Wrapper } from 'next-p5-wrapper';
import { createNoise3D, NoiseFunction3D } from 'simplex-noise';
import { useDarkMode } from '@/lib/use_dark_mode';

const colorSchemes: Record<string, ColorScheme> = {
  purple: {
    background: 'rgba(255, 255, 255, 0.05)',
    forceField: 'rgb(120, 70, 170)',
    particle: 'rgb(200, 180, 220)',
  },
  graphite: {
    background: 'rgba(255, 255, 255, 0.05)',
    forceField: '#cfd5d3',
    particle: '#2e2e2e',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.01)',
    forceField: '#cfd5d3',
    particle: '#2e2e2e',
  },
};

const EPS = 1e-5;
const NUM_PARTICLES = 2e4;

export function Flow() {
  const simulationRef = useRef<Simulation | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const { darkModeOn } = useDarkMode();
  const [fps, setFps] = useState(0);

  const sketch = (p: p5) => {
    const sim = new Simulation({
      numParticles: NUM_PARTICLES,
      width: p.windowWidth,
      height: p.windowHeight,
    });
    simulationRef.current = sim;

    const renderer = new Renderer(sim, {
      colorScheme: darkModeOn ? colorSchemes.dark : colorSchemes.graphite,
    });
    rendererRef.current = renderer;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.pixelDensity(1);
      p.noStroke();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      sim.width = p.width;
      sim.height = p.height;
      sim.bodies.wrap(sim.width, sim.height);
    };

    let lastFpsCheck = 0;
    p.draw = () => {
      const dt = p.deltaTime / 1000;
      const t = p.millis() / 1000;

      renderer.colorScheme = darkModeOn ? colorSchemes.dark : colorSchemes.graphite;
      renderer.draw(p, t, dt);

      if (p.millis() - lastFpsCheck > 120) {
        setFps(1 / Math.max(dt, 1 / 240));
        lastFpsCheck = p.millis();
      }
    };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <ReactP5Wrapper
        key={darkModeOn ? 'dark' : 'light'}
        sketch={sketch}
        style={{ width: '100%', height: '100%' }}
      />

      <div
        style={{
          position: 'absolute',
          right: '20px',
          bottom: '20px',
          backgroundColor: 'black',
          color: 'white',
          fontFamily: 'Inter',
          padding: '8px 10px',
          borderRadius: '4px',
          opacity: 0.8,
        }}
      >
        <table>
          <tbody>
            <tr>
              <td>Frame Rate:</td>
              <td style={{ minWidth: '40px' }}>{fps.toFixed(0)}</td>
            </tr>
            <tr>
              <td>Particles:</td>
              <td style={{ minWidth: '40px' }}>
                {simulationRef.current ? withCommas(simulationRef.current.bodies.numBodies) : '0'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function withCommas(int: number): string {
  const chars: string[] = [];
  let i = 0;

  for (const digit of digits(int)) {
    chars.push(digit.toString());
    i++;
    if (i === 3) {
      chars.push(',');
      i = 0;
    }
  }

  return chars.reverse().join('');
}

function* digits(int: number): Generator<number> {
  int = Math.trunc(int);
  while (int > 0) {
    yield int % 10;
    int = Math.trunc(int / 10);
  }
}

interface ColorScheme {
  background: string;
  forceField: string;
  particle: string;
}

const FORCE_GRID_SIZE = 10;
const PARTICLE_SIZE = 0.6;

class Renderer {
  t: number;
  width: number;
  height: number;
  sim: Simulation;
  colorScheme: ColorScheme;

  constructor(simulation: Simulation, { colorScheme }: { colorScheme: ColorScheme }) {
    this.sim = simulation;
    this.colorScheme = colorScheme;
    this.width = simulation.width;
    this.height = simulation.height;
  }

  draw = (p: p5, t: number, dt: number) => {
    this.width = p.width;
    this.height = p.height;
    this.t = t;

    this.sim.step(t);
    this.drawForceField(p);
    this.drawParticles(p);
  };

  drawForceField = (p: p5) => {
    p.background(this.colorScheme.background);
    p.stroke(this.colorScheme.forceField);
    p.strokeWeight(1);

    for (let y = 0; y < this.height; y += FORCE_GRID_SIZE) {
      for (let x = 0; x < this.width; x += FORCE_GRID_SIZE) {
        const [fx, fy] = this.sim.forceField(x, y);
        this.drawVector(p, x, y, fx, fy);
      }
    }
  };

  drawVector = (p: p5, x: number, y: number, vx: number, vy: number) => {
    const LENGTH = 5;
    const heading_ = heading(vx, vy);
    p.line(
      x,
      y,
      x + LENGTH * Math.cos(heading_),
      y + LENGTH * Math.sin(heading_),
    );
  };

  drawParticles = (p: p5) => {
    p.fill(this.colorScheme.particle);
    for (let i = 0; i < this.sim.bodies.pos.items.length; i += 2) {
      p.ellipse(
        this.sim.bodies.pos.items[i],
        this.sim.bodies.pos.items[i + 1],
        PARTICLE_SIZE * 2,
        PARTICLE_SIZE * 2,
      );
    }
  };
}

const DT = 0.1;
const DOMAIN_MARGIN = 5;
const MAX_FORCE = 5;
const MAX_SPEED = 20;
const FIELD_SPACE_SCALE = 0.005;
const FIELD_TIME_SCALE = 0.05;

class Simulation {
  t: number;
  width: number;
  height: number;
  bodies: Bodies;
  noiseGen: NoiseFunction3D;

  constructor({ numParticles, width, height }: { numParticles: number; width: number; height: number }) {
    this.t = 0;
    this.width = width;
    this.height = height;
    this.noiseGen = createNoise3D();
    this.bodies = new Bodies({ numBodies: numParticles });

    for (let i = 0; i < this.bodies.pos.items.length; i += 2) {
      this.bodies.pos.items[i] = randInt(width);
      this.bodies.pos.items[i + 1] = randInt(height);
    }
  }

  step(t: number) {
    this.t = t;
    this.applyForces();
    this.bodies.step(DT);
    this.bodies.wrap(this.width, this.height);
  }

  applyForces = () => {
    for (let i = 0; i < 2 * this.bodies.numBodies; i += 2) {
      const [fx, fy] = this.forceField(
        this.bodies.pos.items[i],
        this.bodies.pos.items[i + 1],
      );
      this.bodies.acc.items[i] = fx;
      this.bodies.acc.items[i + 1] = fy;
    }
  };

  forceField = (x: number, y: number): [number, number] => {
    const fx = MAX_FORCE * this.noise(x * FIELD_SPACE_SCALE, y * FIELD_SPACE_SCALE, this.t * FIELD_TIME_SCALE);
    const fy = MAX_FORCE * this.noise(
      x * FIELD_SPACE_SCALE + 1e5,
      y * FIELD_SPACE_SCALE + 1e5,
      this.t * FIELD_TIME_SCALE,
    );
    return [fx, fy];
  };

  noise = (x: number, y: number, t: number): number => {
    const cyclicX = x;
    const cyclicY = y;
    return this.noiseGen(cyclicX, cyclicY, t);
  };
}

class Bodies {
  numBodies: number;
  buffer: ArrayBuffer;
  pos: Vec2Array;
  dpos: Vec2Array;
  vel: Vec2Array;
  dvel: Vec2Array;
  acc: Vec2Array;

  constructor({ numBodies }: { numBodies: number }) {
    this.numBodies = numBodies;

    const byteLength = Vec2Array.byteLength(numBodies);
    const bufferSize = byteLength * 5;
    this.buffer = new ArrayBuffer(bufferSize);

    const slice = (i: number): Slice => ({
      buffer: this.buffer,
      byteOffset: byteLength * i,
    });

    this.pos = new Vec2Array(numBodies, slice(0));
    this.dpos = new Vec2Array(numBodies, slice(1));
    this.vel = new Vec2Array(numBodies, slice(2));
    this.dvel = new Vec2Array(numBodies, slice(3));
    this.acc = new Vec2Array(numBodies, slice(4));
  }

  step = (dt: number) => {
    Vec2Array.mul(this.dvel, this.acc, dt);
    Vec2Array.add(this.vel, this.vel, this.dvel);
    Vec2Array.mul(this.dpos, this.vel, dt);
    Vec2Array.add(this.pos, this.pos, this.dpos);
    Vec2Array.limit(this.vel, this.vel, MAX_SPEED);
    this.acc.fill(0);
  };

  wrap = (domainWidth: number, domainHeight: number) => {
    for (let i = 0; i < this.pos.items.length; i += 2) {
      this.pos.items[i] = wrap(this.pos.items[i], -DOMAIN_MARGIN, domainWidth + DOMAIN_MARGIN);
      this.pos.items[i + 1] = wrap(this.pos.items[i + 1], -DOMAIN_MARGIN, domainHeight + DOMAIN_MARGIN);
    }
  };
}

function wrap(x: number, min: number, max: number): number {
  if (x < min) return max - EPS;
  if (x > max) return min + EPS;
  return x;
}

interface Slice {
  buffer: ArrayBuffer;
  byteOffset: number;
}

class Vec2Array {
  readonly length: number;
  items: Float32Array;

  static byteLength = (length: number) => 2 * Float32Array.BYTES_PER_ELEMENT * length;

  constructor(length: number, slice: Slice | null = null) {
    this.length = length;
    this.items =
      slice ? new Float32Array(slice.buffer, slice.byteOffset, length) : new Float32Array(length);
  }

  get = (i: number): [number, number] => [this.items[2 * i], this.items[2 * i + 1]];

  set = (i: number, x: number, y: number) => {
    this.items[2 * i] = x;
    this.items[2 * i + 1] = y;
  };

  static add = (result: Vec2Array, a: Vec2Array, b: Vec2Array) => {
    for (let i = 0; i < result.items.length; i += 2) {
      result.items[i] = a.items[i] + b.items[i];
      result.items[i + 1] = a.items[i + 1] + b.items[i + 1];
    }
  };

  static sub = (result: Vec2Array, a: Vec2Array, b: Vec2Array) => {
    for (let i = 0; i < result.items.length; i += 2) {
      result.items[i] = a.items[i] - b.items[i];
      result.items[i + 1] = a.items[i + 1] - b.items[i + 1];
    }
  };

  static mul = (result: Vec2Array, x: Vec2Array, c: number) => {
    for (let i = 0; i < result.items.length; i++) {
      result.items[i] = x.items[i] * c;
    }
  };

  static limit = (result: Vec2Array, x: Vec2Array, mag: number) => {
    for (let i = 0; i < result.items.length; i += 2) {
      const m = magnitude(x.items[i], x.items[i + 1]);
      if (m > mag) {
        result.items[i] *= mag / m;
        result.items[i + 1] *= mag / m;
      }
    }
  };

  fill = (v: number) => {
    this.items.fill(v);
  };
}

function magnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function heading(x: number, y: number): number {
  return Math.atan2(y, x);
}

const randInt = (a: number, b: number | null = null) =>
  b === null
    ? Math.floor(Math.random() * a)
    : Math.floor(a + Math.random() * (b - a));

const map = (x: number, min0: number, max0: number, min1: number, max1: number): number =>
  min1 + (x - min0) / (max0 - min0) * (max1 - min1);
