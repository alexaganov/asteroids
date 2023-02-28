import React, { useEffect, useRef, useState } from 'react';
import {
  useGameLoopRender,
  useGameLoopUpdate
} from '@/lib/engine/components/GameLoop';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/engine/components/Renderer';
import './MainScene.css';
import useSpaceship from './useSpaceship';
import useProjectileSpawner from './useProjectileSpawner';
import Vector2 from '@/lib/Vector2';
import useAsteroidsSpawner from './useAsteroidsSpawner';

const MainScene = () => {
  const spaceship = useSpaceship();
  const projectileSpawner = useProjectileSpawner();
  const asteroidsSpawner = useAsteroidsSpawner();
  const pressedKeysRef = useRef<Record<string, boolean>>({});
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();
  const [projectileCount, setProjectileCount] = useState(0);
  const [asteroidsCount, setAsteroidsCount] = useState(0);

  useEffect(() => {
    const handleWindowKeydown = (e: KeyboardEvent) => {
      pressedKeysRef.current[e.code] = true;
    };

    const handleWindowKeyup = (e: KeyboardEvent) => {
      pressedKeysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleWindowKeydown);
    window.addEventListener('keyup', handleWindowKeyup);

    return () => {
      window.removeEventListener('keydown', handleWindowKeydown);
      window.removeEventListener('keyup', handleWindowKeyup);
    };
  }, []);

  useGameLoopUpdate(() => {
    const pressedKeys = pressedKeysRef.current;

    if (pressedKeys['KeyA']) {
      spaceship.rotate(-1);
    } else if (pressedKeys['KeyD']) {
      spaceship.rotate(1);
    }

    if (pressedKeys['Space']) {
      projectileSpawner.spawn({
        size: 3,
        position: new Vector2(spaceship.state.vertices[0]),
        velocity: spaceship.state.direction.normalized.multiply(2)
      });
    }

    projectileSpawner.projectile.forEach((projectile) => {
      asteroidsSpawner.asteroids.forEach((asteroid) => {
        const distance = projectile.position.distance(asteroid.position);
        const hasCollided = 0 >= distance - (asteroid.radius + projectile.size);

        if (hasCollided) {
          asteroidsSpawner.asteroids.delete(asteroid);
          projectileSpawner.projectile.delete(projectile);
        }
      });
    });

    setProjectileCount(projectileSpawner.projectile.size);
    setAsteroidsCount(asteroidsSpawner.asteroids.size);
  });

  useGameLoopRender(() => {
    // setRenderCount((prevState) => prevState + 1);
  });

  return (
    <>
      <div className="main-scene-ui">
        <p>Projectiles: {projectileCount}</p>
        <p>Asteroids: {asteroidsCount}</p>
      </div>
    </>
  );
};

export default MainScene;
