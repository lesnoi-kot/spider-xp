import { random } from "lodash";
import { For, onCleanup, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";

import type { Projectile, FireworkState, Particle } from "./types";

const SHOOT_DURATION = 1000;
const EXPLOSION_DURATION = 1500;
const FALLOUT_DURATION = 3000;
const ANIMATION_DURATION =
  SHOOT_DURATION + EXPLOSION_DURATION + FALLOUT_DURATION;

const EXPLOSION_MIN_RADIUS = 20;
const EXPLOSION_PARTICLE_COUNT = 100;
const INITIAL_PARTICLE_RADIUS = 5;
const PARTICLE_INITIAL_SPEED = 270;

const PROJECTILE_TARGET_X = 0;
const PROJECTILE_TARGET_Y = -50;
const PROJECTILE_LENGTH = 25;
const PROJECTILE_DEVIATION = 40;
const SECOND_PROJECTILE_DELAY = 200;

function newExplosion(
  n: number,
  x: number,
  y: number,
  mX: number,
  mY: number
): Particle[] {
  const fill = `hsl(${Date.now() % 360}deg, 100%, 50%)`;

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
        vx: PARTICLE_INITIAL_SPEED * (vector.vx - mX * 2),
        vy: PARTICLE_INITIAL_SPEED * (vector.vy - mY * 2),
        vr: random(1.5, 2.5, true),
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
    targetY,
  };
}

function updateParticles(
  particles: Particle[],
  currentTime: number,
  delta: number
): void {
  const startedFading = currentTime > SHOOT_DURATION + EXPLOSION_DURATION;
  const dt = delta / 1000;
  let i = 0;
  const k = PARTICLE_INITIAL_SPEED / 130;
  const kx = k * 0.85;
  const g = 70;

  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy = particle.vy - particle.vy * k * dt + dt * g;
    particle.vx -= particle.vx * kx * dt;

    if (startedFading) {
      if (particle.r < 3) {
        particle.x += Math.sin((i * 10 + currentTime) / 50) * dt * 5;

        if (particle.r < 2) {
          particle.fill = "black";
        }
      }
      particle.r = Math.max(particle.r - particle.vr * dt, 0);
    }
    ++i;
  }
}

function updateProjectile(p: Projectile, delta: number): void {
  p.x -= p.vx * delta;
  p.y -= p.vy * delta;
  p.x2 = p.x + Math.cos(p.theta) * PROJECTILE_LENGTH;
  p.y2 = p.y + Math.sin(p.theta) * PROJECTILE_LENGTH;
}

export function Firework() {
  let spawnRef: SVGCircleElement;
  const [fireworkState, setFireworkState] = createStore<FireworkState>({
    projectiles: [],
    particles: [],
  });

  function getSpawnY(): number {
    const m = spawnRef?.getCTM();
    if (!m) {
      return 0;
    }
    return new DOMPoint().matrixTransform(m).y;
  }

  function withDeviation(v: number) {
    return v + random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION);
  }

  onMount(() => {
    let lastTs: DOMHighResTimeStamp;
    let t = 0;
    let requestId: number;
    let secondProjectileFired = false;

    function draw(ts: DOMHighResTimeStamp) {
      const delta = ts - lastTs;

      if (!secondProjectileFired && t >= SECOND_PROJECTILE_DELAY) {
        secondProjectileFired = true;
        setFireworkState((state) => ({
          ...state,
          projectiles: state.projectiles.concat(
            newProjectile(
              withDeviation(state.projectiles[0].x),
              getSpawnY(),
              withDeviation(PROJECTILE_TARGET_X),
              withDeviation(PROJECTILE_TARGET_Y)
            )
          ),
        }));
      } else if (t >= ANIMATION_DURATION) {
        resetAnimation();
      } else {
        setFireworkState(
          produce((state) => {
            updateParticles(state.particles, t, delta);

            state.projectiles = state.projectiles.filter((projectile) => {
              updateProjectile(projectile, delta);

              if (projectile.y <= projectile.targetY) {
                state.particles.push(
                  ...newExplosion(
                    EXPLOSION_PARTICLE_COUNT,
                    projectile.x,
                    projectile.targetY,
                    projectile.vx,
                    projectile.vy
                  )
                );

                return false;
              }

              return true;
            });
          })
        );
      }

      t += ts - lastTs;
      lastTs = ts;
      requestId = requestAnimationFrame(draw);
    }

    function resetAnimation() {
      t = 0;
      secondProjectileFired = false;

      setFireworkState(() => ({
        particles: [],
        projectiles: [
          newProjectile(
            random(-250, 250),
            getSpawnY(),
            withDeviation(PROJECTILE_TARGET_X),
            withDeviation(PROJECTILE_TARGET_Y)
          ),
        ],
      }));
    }

    function startAnimation() {
      requestId = requestAnimationFrame((ts) => {
        lastTs = ts;
        draw(ts);
      });
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        cancelAnimationFrame(requestId);
        resetAnimation();
      } else {
        startAnimation();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    resetAnimation();
    startAnimation();

    onCleanup(() => {
      cancelAnimationFrame(requestId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    });
  });

  return (
    <svg
      id="firework"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="optimizeSpeed"
      stroke-width="2"
      stroke="black"
    >
      <g style="transform: translate(50%, 50%);">
        <circle
          /* @ts-ignore */
          ref={spawnRef}
          id="firework-spawn"
          cx="0"
          cy="50%"
          r="10"
          opacity="0"
        />
        <For each={fireworkState.projectiles}>
          {(projectile) => (
            <line
              x1={projectile.x}
              y1={projectile.y}
              x2={projectile.x2}
              y2={projectile.y2}
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
