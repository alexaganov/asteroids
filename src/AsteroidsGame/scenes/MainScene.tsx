import React, { useEffect, useRef, useState } from 'react';

import useAsteroidsSpawner from './useAsteroidsSpawner';
import useExplosionsSpawner from './useExplosionsSpawner';
import useProjectilesSpawner from './useProjectilesSpawner';
import useSpaceship from './useSpaceship';

import {
  findVerticesIntersection,
  isCircleCollidedWithCircle
} from '@/lib/gameEngine/core/utils/collision';
import Vector2, { Vector2Like } from '@/lib/gameEngine/core/Vector2';
import {
  useGameLoop,
  useGameLoopEvent
} from '@/lib/gameEngine/react/components/GameLoopProvider';
import { useGameUserInput } from '@/lib/gameEngine/react/components/GameUserInputProvider';
import useRefValue from '@/lib/gameEngine/react/hooks/useRefValue';

const useAfterInterval = (interval: number) => {
  const state = useRefValue(() => {
    return {
      lastTimestamp: 0
    };
  });

  return (cb: () => void) => {
    const now = performance.now();
    const isIntervalPassed = now > state.lastTimestamp;

    if (isIntervalPassed) {
      cb();

      state.lastTimestamp = now + interval;
    }
  };
};

// const cache: {
//   [key in string]?: {
//     startTimestamp: number;
//     isActive: boolean;
//   }
// } = {

// }

// const getGameInterval = (id: string) => {

// };

// const useGameInterval = (interval: number) => {
//   const state = useRefValue(() => {
//     return {
//       lastTimestamp: 0,
//       isRunning: true
//     };
//   });

//   const stop = () => {
//     state.isRunning = false;
//   };

//   const start = () => {
//     state.isRunning = true;
//     state.lastTimestamp = 0;
//   };
//   const action = (cb: () => void) => {
//     const now = performance.now();
//     const isIntervalPassed = now > state.lastTimestamp;

//     if (isIntervalPassed) {
//       cb();

//       state.lastTimestamp = now + interval;
//     }
//   };

//   return {
//     stop,
//     start,
//     action
//   };
// };

const useGameInterval = (interval: number) => {
  const state = useRefValue(() => {
    return {
      lastInterval: 0
    };
  });

  return (cb: () => void) => {
    const now = performance.now();
    const isIntervalPassed = now > state.lastInterval;

    if (isIntervalPassed) {
      cb();

      state.lastInterval = now + interval;
    }
  };
};

enum GameState {
  FirstGame = 0,
  GameOver = 1,
  Running = 2,
  Paused = 3
}

const MainScene = () => {
  const [gameState, setGameState] = useState(GameState.FirstGame);
  const gameStateRef = useRef(gameState);

  gameStateRef.current = gameState;

  const [fps, setFps] = useState(0);
  const { gameLoop } = useGameLoop();
  const spaceship = useSpaceship();
  const [score, setScore] = useState({
    multiplier: 1,
    value: 0
  });
  const asteroidsSpawner = useAsteroidsSpawner();
  const explosionSpawner = useExplosionsSpawner();
  const projectilesSpawner = useProjectilesSpawner();
  const { keyboard } = useGameUserInput();

  const spawnInterval = useGameInterval(1000);

  const after100ms = useAfterInterval(10);

  const [sceneState, setSceneState] = useState({
    projectiles: 0,
    asteroids: 0,
    explosions: 0
  });

  useEffect(() => {
    const handleWindowKeydown = (e: KeyboardEvent) => {
      if (
        e.code === 'Enter' &&
        [GameState.Paused, GameState.FirstGame, GameState.GameOver].includes(
          gameStateRef.current
        )
      ) {
        setGameState(GameState.Running);
      } else if (e.code === 'Escape') {
        if (gameStateRef.current === GameState.Running) {
          gameLoop.pause();
          setGameState(GameState.Paused);
        } else if (gameStateRef.current === GameState.Paused) {
          gameLoop.resume();
          setGameState(GameState.Running);
        }
      }
    };

    const handleWindowBlur = () => {
      if (gameStateRef.current === GameState.Running) {
        gameLoop.pause();
        setGameState(GameState.Paused);
      }
    };

    window.addEventListener('keydown', handleWindowKeydown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [gameLoop]);

  const spawnProjectile = () => {
    const direction = Vector2.top.rotateTo(
      spaceship.state.angle - 90
    ).normalized;

    const velocity = direction.multipliedBy(0.5);
    const position = direction.multipliedBy(spaceship.state.size / 2);

    projectilesSpawner.spawn({
      position,
      velocity,
      onOutside: () => {
        setScore((oldScore) => {
          return {
            ...oldScore,
            multiplier: 1
          };
        });
      }
    });
  };

  const checkAsteroidsAndProjectilesCollision = () => {
    projectilesSpawner.projectiles.forEach((projectile) => {
      asteroidsSpawner.asteroids.forEach((asteroid) => {
        const hasCollided = isCircleCollidedWithCircle(
          {
            position: asteroid.position,
            radius: asteroid.radius
          },
          {
            position: projectile.position,
            radius: projectile.size
          }
        );

        if (hasCollided) {
          asteroidsSpawner.asteroids.delete(asteroid);
          projectilesSpawner.projectiles.delete(projectile);
          explosionSpawner.spawn({
            position: asteroid.position,
            numberOfParticles: asteroid.radius / 4
          });

          setScore(({ multiplier, value }) => {
            return {
              value: value + multiplier * 10,
              multiplier: multiplier + 1
            };
          });
        }
      });
    });
  };

  const hasSpaceshipCollidedWithAsteroids = () => {
    for (const asteroid of asteroidsSpawner.asteroids) {
      const isCollisionPossible =
        0 >=
        asteroid.position.length - (asteroid.radius + spaceship.state.size);

      if (
        isCollisionPossible &&
        findVerticesIntersection(asteroid.vertices, spaceship.state.vertices)
      ) {
        return true;
      }
    }

    return false;
  };

  const checkSpaceshipAndAsteroidsCollision = () => {
    if (hasSpaceshipCollidedWithAsteroids()) {
      explosionSpawner.spawn({
        position: Vector2.zero
      });

      asteroidsSpawner.asteroids.forEach((asteroid) => {
        explosionSpawner.spawn({
          position: asteroid.position
        });
      });

      asteroidsSpawner.asteroids.clear();

      setGameState(GameState.GameOver);
    }
  };

  const handleUserInput = () => {
    spaceship.rotate(keyboard.horizontal);

    if (keyboard.pressingKeys.Space) {
      spawnProjectile();
    }
  };

  useGameLoopEvent('update', (simulatedTimeStep) => {
    if (gameState === GameState.Running) {
      handleUserInput();

      checkAsteroidsAndProjectilesCollision();
      checkSpaceshipAndAsteroidsCollision();

      spawnInterval(() => {
        asteroidsSpawner.spawn();
      });

      spaceship.update(simulatedTimeStep);
      asteroidsSpawner.update(simulatedTimeStep);
      projectilesSpawner.update(simulatedTimeStep);
      explosionSpawner.update(simulatedTimeStep);
    } else if (gameState === GameState.GameOver) {
      explosionSpawner.update(simulatedTimeStep);
      projectilesSpawner.update(simulatedTimeStep);
    }
  });

  useGameLoopEvent('render', () => {
    if (gameState === GameState.FirstGame) {
      return;
    }

    if (gameState !== GameState.GameOver) {
      spaceship.render();
      asteroidsSpawner.render();
    }

    projectilesSpawner.render();
    explosionSpawner.render();
  });

  useGameLoopEvent('end', (fps) => {
    setFps(+fps.toFixed(0));
  });

  if (gameState === GameState.FirstGame) {
    return (
      <div className="position-absolute inset-0 d-flex">
        <p className="m-auto a-blinking text-align-center">
          Press Enter to Play
        </p>
      </div>
    );
  }

  if (gameState === GameState.GameOver) {
    return (
      <div className="position-absolute inset-0 d-flex">
        <div className="m-auto text-align-center d-flex flex-direction-column gap-10">
          <p className="t-fs-xl">Game Over</p>
          <p>Your Score is {score.value}</p>
          <p className="a-blinking">Press Enter to Try Again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="position-absolute inset-0 p-20 user-select-none">
      <div className="position-relative h-full">
        <p className="position-absolute left-0">FSP {fps}</p>

        <p className="text-align-center w-full">
          x{score.multiplier}
          <br />
          <br />
          {score.value}
        </p>
        {gameState === GameState.Paused && (
          <div className="position-absolute inset-0 m-auto d-flex align-justify-center text-align-center">
            <p className="a-blinking">Paused</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainScene;
