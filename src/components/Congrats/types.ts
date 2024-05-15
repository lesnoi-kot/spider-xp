export type Projectile = {
  x: number;
  y: number;
  x2: number;
  y2: number;
  vx: number;
  vy: number;
  theta: number;
  targetY: number;
};

export type Particle = {
  x: number;
  y: number;
  r: number;
  fill: string;
  vx: number;
  vy: number;
  vr: number;
};

export type FireworkState = {
  projectiles: Projectile[];
  particles: Particle[];
};
