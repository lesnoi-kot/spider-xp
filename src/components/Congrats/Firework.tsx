import { clamp, random, range, sample } from "lodash";
import { For, createSignal, onMount } from "solid-js";

type Flame = {
  cx: number;
  cy: number;
  r: number;
  fill: string;

  vx: number;
  vy: number;
  // d: number;
  speed: number;
};
type Explosion = Flame[];

const GRAVITY_VY = 0.1;
const EXPLOSION_DURATION = 1000;
const FALLOUT_DURATION = 1000;
const ANIMATION_DURATION = EXPLOSION_DURATION + FALLOUT_DURATION;
const EXPLOSION_MIN_RADIUS = 20;
const EXPLOSION_MAX_RADIUS = 60;
const EXPLOSION_PARTICLE_COUNT = 60;
const R = 5;

function newExplosion(n: number): Explosion {
  const fill = sample(["red", "green", "purple", "yellow", "blue", "white"]);
  const initialSpeed = random(4, 5, true);

  return generateNormalizedVectors(n - 20)
    .map((vector) => {
      const d = Math.min(0.15 + Math.random(), 1);
      return {
        cx: EXPLOSION_MIN_RADIUS * vector.x * d,
        cy: EXPLOSION_MIN_RADIUS * vector.y * d,
        r: R,
        fill,
        vx: vector.x,
        vy: vector.y,
        speed: d * initialSpeed,
      };
    })
    .concat(
      generateNormalizedVectors(20).map((vector) => {
        return {
          cx: EXPLOSION_MIN_RADIUS * vector.x,
          cy: EXPLOSION_MIN_RADIUS * vector.y,
          r: R,
          fill,
          vx: vector.x,
          vy: vector.y,
          speed: initialSpeed,
        };
      })
    );
}

function updateExplosion(e: Explosion, t: number): Explosion {
  const normalizedT = clamp(t / EXPLOSION_DURATION, 0, 1);
  // const eR =
  //   EXPLOSION_MIN_RADIUS +
  //   easeOutQuadratic(1 - normalizedT) *
  //     (EXPLOSION_MAX_RADIUS - EXPLOSION_MIN_RADIUS);

  return e.map((flame) => ({
    ...flame,
    // cx: eR * flame.d * flame.vx,
    // cy: eR * flame.d * flame.vy,

    cx: flame.cx + flame.speed * flame.vx,
    cy: flame.cy + flame.speed * flame.vy,
    speed: easeOutQuadratic(normalizedT) * flame.speed,
    // r: (1 - normalizedT) * R, // linear(t, R),
  }));
}

export function Firework() {
  const [flames, setFlames] = createSignal<Explosion>(
    newExplosion(EXPLOSION_PARTICLE_COUNT)
  );

  onMount(() => {
    let lastTs: DOMHighResTimeStamp;
    let t = 0;

    function draw(ts: DOMHighResTimeStamp) {
      const delta = (ts - lastTs) / 1000;
      setFlames((flames) => updateExplosion(flames, t));
      t += ts - lastTs;
      lastTs = ts;
      requestAnimationFrame(draw);
    }

    requestAnimationFrame((ts) => {
      lastTs = ts;
    });
    requestAnimationFrame(draw);

    setInterval(() => {
      t = 0;
      setFlames(() => newExplosion(EXPLOSION_PARTICLE_COUNT));
    }, ANIMATION_DURATION);
  });

  return (
    <svg
      id="firework"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
      stroke-width="2"
      stroke="black"
      width="100%"
      height="100%"
    >
      <g transform="translate(450, 200)">
        <For each={flames()}>
          {(flame) => (
            <circle cx={flame.cx} cy={flame.cy} r={flame.r} fill={flame.fill} />
          )}
        </For>
      </g>
    </svg>
  );
}

function generateNormalizedVectors(n: number): DOMPointReadOnly[] {
  const vectors: DOMPointReadOnly[] = [];
  const angleIncrement = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    let angle = i * angleIncrement;
    let x = Math.cos(angle);
    let y = Math.sin(angle);
    vectors.push(new DOMPointReadOnly(x, y));
  }

  return vectors;
}

function linear(t: number, x: number) {
  return ((EXPLOSION_DURATION - t) / EXPLOSION_DURATION) * x;
}

function easeOutQuadratic(t: number): number {
  return 1 - t * t;
}

// Quadratic ease-in function
function easeInQuadratic(t: number): number {
  return t * t;
}

function randomNormal(mu: number = 0, sigma: number = 1): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * sigma + mu;
}

function wiggle(initialValue: number, variance: number): number {
  const normalRandom = randomNormal(0, variance);
  return initialValue + normalRandom;
}
