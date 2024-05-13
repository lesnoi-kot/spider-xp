import { random, sample } from "lodash";
import { For, createSignal, onMount } from "solid-js";

type Projectile = {
  x: number;
  y: number;
  x2: number;
  y2: number;
  vx: number;
  vy: number;
  theta: number;
  speed: number;
};

type Particle = {
  x: number;
  y: number;
  r: number;
  fill: string;
  vx: number;
  vy: number;
  vr: number;
};
type Explosion = Particle[];

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
const PROJECTILE_LENGTH = 30;
const PROJECTILE_DEVIATION = 20;

function newExplosion(
  n: number,
  x: number,
  y: number,
  mX: number,
  mY: number
): Explosion {
  const fill = sample(PARTICLE_COLORS)!;
  const initialSpeed = 0.13;

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

function updateExplosion(
  e: Explosion,
  currentTime: number,
  delta: number
): Explosion {
  const startedFading = currentTime > EXPLOSION_DURATION + 500;

  return e
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * delta,
      y: particle.y + particle.vy * delta,
      vx: particle.vx * 0.4 ** (delta / 1000),
      vy: particle.vy * 0.4 ** (delta / 1000) + delta / 35_000,
      r: startedFading ? particle.r - particle.vr * delta : particle.r,
    }))
    .filter((flame) => flame.r >= 1);
}

function updateProjectile(p: Projectile, delta: number): Projectile {
  const x = p.x - p.vx * delta;
  const y = p.y - p.vy * delta;

  return {
    ...p,
    x: x,
    y: y,
    x2: x + Math.cos(p.theta) * PROJECTILE_LENGTH,
    y2: y + Math.sin(p.theta) * PROJECTILE_LENGTH,
  };
}

export function Firework() {
  const [explosions, setExplosions] = createSignal<Explosion[]>([]);
  const [projectiles, setProjectiles] = createSignal<Projectile[]>([]);

  onMount(() => {
    let lastTs: DOMHighResTimeStamp;
    let t = 0;

    function draw(ts: DOMHighResTimeStamp) {
      const delta = ts - lastTs;
      setProjectiles((projectiles) =>
        projectiles.map((projectile) => updateProjectile(projectile, delta))
      );
      setExplosions((explosions) =>
        explosions.map((explosion) => updateExplosion(explosion, t, delta))
      );
      t += ts - lastTs;
      lastTs = ts;
      requestAnimationFrame(draw);
    }

    function resetAnimation() {
      t = 0;
      setExplosions([]);
      setProjectiles(() => [
        newProjectile(
          random(-250, 250),
          PROJECTILE_START_Y,
          random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION),
          random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION)
        ),
      ]);

      setTimeout(() => {
        setProjectiles((projectiles) =>
          projectiles.concat(
            newProjectile(
              projectiles[0].x +
                random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION),
              PROJECTILE_START_Y,
              random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION),
              random(-PROJECTILE_DEVIATION, PROJECTILE_DEVIATION)
            )
          )
        );
      }, 100);

      setTimeout(() => {
        setExplosions(() =>
          projectiles().map((explosion) =>
            newExplosion(
              EXPLOSION_PARTICLE_COUNT,
              explosion.x,
              explosion.y,
              explosion.vx / 4,
              explosion.vy / 4
            )
          )
        );
        setProjectiles([]);
      }, SHOOT_DURATION);
    }

    resetAnimation();
    requestAnimationFrame((ts) => {
      lastTs = ts;
    });
    requestAnimationFrame(draw);

    setInterval(resetAnimation, ANIMATION_DURATION);
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
        <For each={projectiles()}>
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
        <For each={explosions()}>
          {(particles) => (
            <For each={particles}>
              {(flame) => (
                <circle
                  cx={flame.x}
                  cy={flame.y}
                  r={flame.r}
                  fill={flame.fill}
                />
              )}
            </For>
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
