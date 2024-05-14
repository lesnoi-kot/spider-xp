import { random, sample, shuffle } from "lodash";
import { For, onCleanup, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";

import type { Projectile, FireworkState, Particle } from "./types";

const SHOOT_DURATION = 1200;
const EXPLOSION_DURATION = 1700;
const FALLOUT_DURATION = 3500;
const ANIMATION_DURATION =
  SHOOT_DURATION + EXPLOSION_DURATION + FALLOUT_DURATION;

const EXPLOSION_MIN_RADIUS = 20;
const EXPLOSION_PARTICLE_COUNT = 70;
const INITIAL_PARTICLE_RADIUS = 5;
const PARTICLE_COLORS = ["red", "lime", "purple", "yellow", "blue", "fuchsia"];

const PROJECTILE_START_Y = 370;
const PROJECTILE_LENGTH = 25;
const PROJECTILE_DEVIATION = 20;

function newExplosion(
  n: number,
  x: number,
  y: number,
  mX: number,
  mY: number
): Particle[] {
  const fill = sample(PARTICLE_COLORS)!;
  const initialSpeed = 0.15;

  return generatePointsInsideCircle(n - 20, EXPLOSION_MIN_RADIUS, x, y)
    .concat(
      generateNormalizedVectors(20).map((vector) => ({
        x: x + EXPLOSION_MIN_RADIUS * vector.x,
        y: y + EXPLOSION_MIN_RADIUS * vector.y,
        vx: vector.x,
        vy: vector.y,
      }))
    )
    .map((vector) => {
      return {
        x: vector.x,
        y: vector.y,
        r: INITIAL_PARTICLE_RADIUS,
        vx: 1 * initialSpeed * vector.vx - mX,
        vy: 1 * initialSpeed * vector.vy - mY,
        vr: random(1, 1.5, true) / 1000,
        fill,
      };
    });
}

function newProjectile(
  x: number,
  y: number,
  targetX: number,
  targetY: number
): Projectile {
  const theta = Math.atan2(y - targetY, x - targetX);
  const speed = Math.hypot(x, y) / SHOOT_DURATION;
  const vx = speed * Math.cos(theta);
  const vy = speed * Math.sin(theta);
  return {
    theta,
    x,
    y,
    x2: x + Math.cos(theta) * PROJECTILE_LENGTH,
    y2: y + Math.sin(theta) * PROJECTILE_LENGTH,
    vx,
    vy,
    speed,
  };
}

function updateParticles(
  particles: Particle[],
  currentTime: number,
  delta: number
): void {
  const startedFading = currentTime > EXPLOSION_DURATION + 1000;

  for (const particle of particles) {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vx = particle.vx * 0.4 ** (delta / 1000);
    particle.vy = particle.vy * 0.4 ** (delta / 1000) + delta / 35_000;

    if (startedFading) {
      particle.r -= particle.vr * delta;
    }
  }
}

function updateProjectile(p: Projectile, delta: number): void {
  p.x -= p.vx * delta;
  p.y -= p.vy * delta;
  p.x2 = p.x + Math.cos(p.theta) * PROJECTILE_LENGTH;
  p.y2 = p.y + Math.sin(p.theta) * PROJECTILE_LENGTH;
}

export function Firework() {
  const [fireworkState, setFireworkState] = createStore<FireworkState>({
    projectiles: [],
    particles: [],
  });

  onMount(() => {
    let lastTs: DOMHighResTimeStamp;
    let t = 0;
    let requestId: number;

    function draw(ts: DOMHighResTimeStamp) {
      const delta = ts - lastTs;

      setFireworkState(
        produce(({ projectiles, particles }) => {
          updateParticles(particles, t, delta);
          projectiles.forEach((projectile) => {
            updateProjectile(projectile, delta);
          });
        })
      );

      t += ts - lastTs;
      lastTs = ts;
      requestId = requestAnimationFrame(draw);
    }

    function resetAnimation() {
      t = 0;

      setFireworkState(() => ({
        particles: [],
        projectiles: [
          newProjectile(
            random(-250, 250),
            PROJECTILE_START_Y,
            random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION),
            random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION)
          ),
        ],
      }));

      setTimeout(() => {
        setFireworkState((state) => ({
          ...state,
          projectiles: state.projectiles.concat(
            newProjectile(
              state.projectiles[0].x +
                random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION),
              PROJECTILE_START_Y,
              random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION),
              random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION)
            )
          ),
        }));
      }, 100);

      setTimeout(() => {
        setFireworkState((state) => ({
          projectiles: [],
          particles: shuffle(
            state.projectiles.flatMap(({ x, y, vx, vy }) =>
              newExplosion(EXPLOSION_PARTICLE_COUNT, x, y, vx / 4, vy / 4)
            )
          ),
        }));
      }, SHOOT_DURATION);
    }

    resetAnimation();
    requestAnimationFrame((ts) => {
      lastTs = ts;
    });
    requestAnimationFrame(draw);

    const animationResetTimer = setInterval(resetAnimation, ANIMATION_DURATION);

    onCleanup(() => {
      clearInterval(animationResetTimer);
      cancelAnimationFrame(requestId);
    });
  });

  return (
    <svg
      id="firework"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
      stroke-width="2"
      stroke="black"
    >
      <g transform="translate(440, 205)">
        <For each={fireworkState.projectiles}>
          {(projectile) => (
            <line
              x1={projectile.x}
              y1={projectile.y}
              x2={projectile.x2}
              y2={projectile.y2}
              stroke="black"
            />
          )}
        </For>
        <For each={fireworkState.particles}>
          {(particle) => (
            <circle
              cx={particle.x}
              cy={particle.y}
              r={particle.r}
              fill={particle.fill}
            />
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

function generatePointsInsideCircle(
  n: number,
  radius: number,
  x: number = 0,
  y: number = 0
) {
  let points: any[] = [];

  for (let i = 0; i < n; i++) {
    const d = Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const vx = d * Math.cos(theta);
    const vy = d * Math.sin(theta);
    points.push({ x: x + vx * radius, y: y + vy * radius, vx, vy });
  }

  return points;
}
