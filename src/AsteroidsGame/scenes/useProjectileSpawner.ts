import {
  useGameLoopRender,
  useGameLoopUpdate
} from '@/lib/engine/components/GameLoop';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/engine/components/Renderer';
import Vector2 from '@/lib/Vector2';
import { useRef } from 'react';

interface Projectile {
  velocity: Vector2;
  position: Vector2;
  size: number;
}

const useProjectileSpawner = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();
  const projectilesInPool = useRef<Set<Projectile>>(new Set());
  const projectilesRef = useRef<Set<Projectile>>(new Set());
  const spawnIntervalRef = useRef({
    interval: 200,
    nextSpawnTimestamp: 0
  });

  const disable = (projectile: Projectile) => {
    projectilesRef.current.delete(projectile);
    projectilesInPool.current.add(projectile);
  };

  const spawn = (projectileConfig: Projectile) => {
    const timestamp = performance.now();

    if (timestamp < spawnIntervalRef.current.nextSpawnTimestamp) {
      return;
    }

    const [projectileInPool] = projectilesInPool.current;

    const projectile = {
      ...projectileInPool,
      ...projectileConfig
    };

    if (projectileInPool) {
      projectilesInPool.current.delete(projectileInPool);
    }

    projectilesRef.current.add(projectile);

    spawnIntervalRef.current.nextSpawnTimestamp =
      timestamp + spawnIntervalRef.current.interval;
  };

  useGameLoopUpdate(() => {
    const { width, height } = canvasEl;
    const hw = width / 2;
    const hh = height / 2;

    projectilesRef.current.forEach((projectile) => {
      const hs = projectile.size / 2;

      const isOutside =
        projectile.position.y > hh + hs ||
        projectile.position.y < -(hh + hs) ||
        projectile.position.x > hw + hs ||
        projectile.position.x < -(hw + hs);

      if (isOutside) {
        disable(projectile);
      } else {
        projectile.position.add(projectile.velocity);
      }
    });
  });

  useGameLoopRender(() => {
    projectilesRef.current.forEach((projectile) => {
      ctx.beginPath();
      ctx.arc(
        projectile.position.x,
        projectile.position.y,
        projectile.size,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = '#0f0';
      ctx.fill();
    });
  });

  return {
    spawn,
    projectile: projectilesRef.current,
    destroy: disable
  };
};

export default useProjectileSpawner;
