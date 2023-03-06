import { useRef } from 'react';

import Vector2 from '@/lib/gameEngine/core/Vector2';
import {
  useGameLoopRender,
  useGameLoopUpdate
} from '@/lib/gameEngine/react/components/GameLoop';
import { useGameLoopEvent } from '@/lib/gameEngine/react/components/GameLoopProvider';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/gameEngine/react/components/Renderer';
import useRefValue from '@/lib/gameEngine/react/hooks/useRefValue';

interface Projectile {
  velocity: Vector2;
  position: Vector2;
  size: number;
  onOutside: () => void;
}

const useProjectilesSpawner = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();
  const projectiles = useRefValue<Set<Projectile>>(() => new Set());
  const spawnIntervalRef = useRef({
    interval: 200,
    nextSpawnTimestamp: 0
  });

  const destroy = (projectile: Projectile) => {
    projectiles.delete(projectile);
  };

  const spawn = ({
    size = 3,
    ...otherParams
  }: Omit<Projectile, 'size'> & { size?: number }) => {
    const timestamp = performance.now();

    if (timestamp < spawnIntervalRef.current.nextSpawnTimestamp) {
      return;
    }

    projectiles.add({
      ...otherParams,
      size
    });

    spawnIntervalRef.current.nextSpawnTimestamp =
      timestamp + spawnIntervalRef.current.interval;
  };

  const update = (simulationTimeStep: number) => {
    const { width, height } = canvasEl;
    const hw = width / 2;
    const hh = height / 2;

    projectiles.forEach((projectile) => {
      const hs = projectile.size / 2;

      const isOutside =
        projectile.position.y > hh + hs ||
        projectile.position.y < -(hh + hs) ||
        projectile.position.x > hw + hs ||
        projectile.position.x < -(hw + hs);

      if (isOutside) {
        projectile.onOutside();

        destroy(projectile);
      } else {
        projectile.position.add(
          projectile.velocity.multipliedBy(simulationTimeStep)
        );
      }
    });
  };

  const drawProjectile = ({ position, size }: Projectile) => {
    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f0';
    ctx.fill();
  };

  const render = () => {
    projectiles.forEach(drawProjectile);
  };

  return {
    spawn,
    projectiles,
    destroy,
    render,
    update
  };
};

export default useProjectilesSpawner;
