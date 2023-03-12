import SoundButton from './SoundButton';
import useAsteroidsGameController, {
  GameState
} from './useAsteroidsGameController';
import useAsteroidsSpawner from './useAsteroidsSpawner';
import useBackground from './useBackground';
import useExplosionsSpawner from './useExplosionsSpawner';
import useProjectilesSpawner from './useProjectilesSpawner';
import useSound from './useSounds';
import useSpaceship from './useSpaceship';

import explosionEffectSrc from '@/assets/sounds/8bit-explosion.mp3';
import laserEffectSrc from '@/assets/sounds/8bit-laser.mp3';
import {
  checkCollisionCircleToCircle,
  checkCollisionCircularShapeToCircularShape
} from '@/lib/gameEngine/core/utils/collision';
import Vector2 from '@/lib/gameEngine/core/Vector2';
import { useGameLoopEvent } from '@/lib/gameEngine/react/components/GameLoop';
import { useGameUserInput } from '@/lib/gameEngine/react/components/GameUserInputProvider';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/gameEngine/react/components/Renderer';
import useGameInterval from '@/lib/gameEngine/react/hooks/useGameInterval';

const MainScene = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();
  const background = useBackground();
  const spaceship = useSpaceship();
  const asteroidsSpawner = useAsteroidsSpawner();
  const explosionSpawner = useExplosionsSpawner();
  const projectilesSpawner = useProjectilesSpawner();
  const explosionEffectSound = useSound(explosionEffectSrc);
  const laserEffectSound = useSound(laserEffectSrc);
  const projectileSpawnInterval = useGameInterval(200);

  const {
    gameState,
    setGameState,
    score,
    setScore,
    fps,
    resetScoreMultiplier
  } = useAsteroidsGameController({
    spaceship,
    asteroidsSpawner
  });

  const { keyboard } = useGameUserInput();

  const setupCtx2d = () => {
    ctx.save();
    ctx.resetTransform();

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.restore();

    ctx.save();
    ctx.resetTransform();

    ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  };

  const spawnProjectile = () => {
    const direction = Vector2.top.rotateTo(
      spaceship.state.angle - 90
    ).normalized;

    const velocity = direction.multipliedBy(0.5);
    const position = direction.multipliedBy(spaceship.state.size / 2);

    projectilesSpawner.spawn({
      position,
      velocity,
      onOutside: resetScoreMultiplier,
      onSpawn: laserEffectSound.play
    });
  };

  const checkAsteroidsAndProjectilesCollision = () => {
    projectilesSpawner.projectiles.forEach((projectile) => {
      asteroidsSpawner.asteroids.forEach((asteroid) => {
        const hasCollided = checkCollisionCircleToCircle(
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

          explosionEffectSound.play();
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

  const checkCollisionSpaceshipToAsteroids = () => {
    for (const asteroid of asteroidsSpawner.asteroids) {
      if (
        checkCollisionCircularShapeToCircularShape(
          {
            position: Vector2.zero,
            radius: spaceship.state.size,
            vertices: spaceship.state.vertices
          },
          {
            position: asteroid.position,
            radius: asteroid.radius,
            vertices: asteroid.vertices
          }
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const checkSpaceshipAndAsteroidsCollision = () => {
    const isSpaceshipCollidedWithAsteroid =
      checkCollisionSpaceshipToAsteroids();

    if (!isSpaceshipCollidedWithAsteroid) {
      return;
    }

    explosionEffectSound.play();

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
  };

  const handleUserInput = () => {
    spaceship.rotate(keyboard.horizontal);

    if (keyboard.pressingKeys.Space) {
      spawnProjectile();
    }
  };

  useGameLoopEvent('update', (simulatedTimeStep) => {
    background.update(simulatedTimeStep);

    if (gameState === GameState.Running) {
      handleUserInput();

      checkAsteroidsAndProjectilesCollision();
      checkSpaceshipAndAsteroidsCollision();

      spaceship.update(simulatedTimeStep);
      asteroidsSpawner.update(simulatedTimeStep);
    }

    explosionSpawner.update(simulatedTimeStep);
    projectilesSpawner.update(simulatedTimeStep);
  });

  useGameLoopEvent('render', (interpolation) => {
    setupCtx2d();

    background.render();

    if (gameState === GameState.FirstGame) {
      return;
    }

    if (gameState !== GameState.GameOver) {
      spaceship.render(interpolation);
      asteroidsSpawner.render();
    }

    projectilesSpawner.render();
    explosionSpawner.render();
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
      <div className="position-absolute inset-0 d-flex user-select-none">
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

        <SoundButton />
      </div>
    </div>
  );
};

export default MainScene;
