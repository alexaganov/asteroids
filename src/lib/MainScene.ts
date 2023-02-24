import Scene from './Scene';
import Asteroid from './Asteroid';
import GameLoop from './GameLoop';
import Matrix2D from './Matrix2D';
import Random from './Random';
import Renderer from './Renderer/Renderer';
import Shape2D from './Shape2D';
import Size from './Size';
import UserInput from './UserInput';
import { DEGREES_TO_RADIANS, TWO_PI } from './utils/math';
import Vector2, { Vector2Like, Vector2Object } from './Vector2';
import Game from './Game';
import GameObject from './GameObject';
import { drawAxis, drawGrid } from './utils/canvas';
import GameEntity from './GameEntity';
import Rect from './Rect';
import Spaceship from './Spaceship';
import Projectile from './Projectile';
import ExplosionEffect from './ExplosionEffect';
import StarsBackground from './StarsBackground';
import explosionSound from '@/assets/sounds/8bit-explosion.mp3';
import laserSound from '@/assets/sounds/8bit-laser.mp3';
import SoundEffects from './SoundEffects';

// TODO: refactor
class MainScene extends GameObject {
  public spaceship = new Spaceship(this.game);
  public input = new UserInput();

  public mouseX = 0;
  public mouseY = 0;
  public x = 0;
  public y = 0;

  public projectile: Projectile | undefined;

  public projectiles = new Set<Projectile>();
  public projectilesInPool = new Set<Projectile>();
  public asteroids = new Set<Asteroid>();
  public asteroidsInPool = new Set<Asteroid>();
  public explosionEffects = new Set<ExplosionEffect>();
  public explosionEffectsInPool = new Set<ExplosionEffect>();
  public projectileStart = Date.now();
  public projectileInterval = 200;
  public asteroidSpawnInterval = 1000;
  public lastAsteroidSpawnTimestamp = Date.now();
  public starsBackground = new StarsBackground(this.game);
  public isGameOver = true;
  public soundEffects = new SoundEffects({
    laser: laserSound,
    explosion: explosionSound
  });

  public gameOverHandler: () => void;
  public scoringHandler: (score: number) => void;

  public score = 0;

  constructor(
    game: Game,
    {
      onGameOver,
      onScore
    }: { onGameOver: () => void; onScore: (score: number) => void }
  ) {
    super(game);

    this.gameOverHandler = onGameOver;
    this.scoringHandler = onScore;
  }

  init() {
    this.handleWindowMouseMove = this.handleWindowMouseMove.bind(this);
    // do nothing
    window.addEventListener('mousemove', this.handleWindowMouseMove);

    this.spaceship.init();
  }

  handleWindowMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  reset() {
    this.score = 0;
    this.isGameOver = false;

    this.spaceship.reset();
  }

  destroy() {
    window.removeEventListener('mousemove', this.handleWindowMouseMove);
  }

  // cameraFollow(vector: Vector2) {
  //   const { ctx, origin } = this.game.renderer;

  //   ctx.resetTransform();

  //   const cameraPosition = new Vector2(origin).sub(vector);

  //   ctx.translate(+cameraPosition.x.toFixed(2), +cameraPosition.y.toFixed(2));

  //   ctx.scale(this.game.renderer.dpr, this.game.renderer.dpr);
  // }

  // restart() {
  // }

  createProjectile(position: Vector2, direction: Vector2, speed?: number) {
    const isIntervalPassed = Date.now() > this.projectileStart;

    if (!isIntervalPassed) {
      return;
    }

    this.soundEffects.play('laser');

    const [availableProjectile] = this.projectilesInPool;

    if (availableProjectile) {
      availableProjectile.reset({ direction, position, speed });
      this.projectiles.add(availableProjectile);
      this.projectilesInPool.delete(availableProjectile);
    } else {
      this.projectiles.add(
        new Projectile(this.game, { direction, position, speed })
      );
    }

    this.projectileStart = Date.now() + this.projectileInterval;
  }

  createAsteroid() {
    const isIntervalPassed = Date.now() > this.lastAsteroidSpawnTimestamp;

    if (!isIntervalPassed) {
      return;
    }

    const { width, height } = this.game.renderer;
    const hw = width / 2;
    const hh = height / 2;
    const horizontal = Random.getBoolean();
    const maxRadius = Math.floor(Random.getNumber(30, 60));

    let x = 0;
    let y = 0;
    const maxX = hw + maxRadius / 2;
    const maxY = hh + maxRadius / 2;

    if (horizontal) {
      x = Random.pick(-maxX, maxX);
      y = Random.getNumber(-maxY, maxY);
    } else {
      x = Random.getNumber(-maxY, maxY);
      y = Random.pick(-maxY, maxY);
    }

    const [availableAsteroid] = this.asteroidsInPool;

    const position = new Vector2(x, y);
    const direction = position.inverted.normalize();

    if (availableAsteroid) {
      availableAsteroid.reset({ position, maxRadius, direction });
      this.asteroids.add(availableAsteroid);
      this.asteroidsInPool.delete(availableAsteroid);
    } else {
      this.asteroids.add(
        new Asteroid(this.game, { position, maxRadius, direction })
      );
    }

    this.lastAsteroidSpawnTimestamp = Date.now() + this.asteroidSpawnInterval;
  }

  getCollidedAsteroid(projectile: Projectile, asteroids: Set<Asteroid>) {
    for (const asteroid of asteroids) {
      const distance = projectile.position.distance(asteroid.position);
      const hasCollided =
        0 >= distance - (asteroid.maxRadius + projectile.size);

      if (hasCollided) {
        return asteroid;
      }
    }

    return null;
  }

  hasAsteroidCollidedSpaceship(asteroid: Asteroid) {
    const distance = this.spaceship.position.distance(asteroid.position);
    const hasPossibleCollision =
      0 >= distance - (asteroid.maxRadius + this.spaceship.size);

    if (hasPossibleCollision) {
      for (let i = 0; i < asteroid.transformedVertices.length - 1; ++i) {
        for (
          let l = 0;
          l < this.spaceship.transformedVertices.length - 1;
          ++l
        ) {
          const collisionPosition = Vector2.getIntersection(
            asteroid.transformedVertices[i],
            asteroid.transformedVertices[i + 1],
            this.spaceship.transformedVertices[l],
            this.spaceship.transformedVertices[l + 1]
          );

          if (collisionPosition) {
            return true;
          }
        }
      }
    }

    return false;
  }

  createExplosionEffect(position: Vector2) {
    const [explosionEffect] = this.explosionEffectsInPool;

    if (explosionEffect) {
      explosionEffect.reset({ position });
      this.explosionEffectsInPool.delete(explosionEffect);
      this.explosionEffects.add(explosionEffect);
    } else {
      this.explosionEffects.add(new ExplosionEffect(this.game, { position }));
    }
  }

  updateMousePosition() {
    const { width, canvasEl, height } = this.game.renderer;

    const boundary = canvasEl.getBoundingClientRect();

    const scaleX = width / boundary.width;
    const scaleY = height / boundary.height;

    const x =
      (this.mouseX - boundary.left * scaleX) * window.devicePixelRatio -
      width / 2;
    const y =
      (this.mouseY - boundary.top * scaleY) * window.devicePixelRatio -
      height / 2;

    this.x = x;
    this.y = y;
  }

  update() {
    const { ctx, width, canvasEl, height, origin, center, draw } =
      this.game.renderer;

    this.starsBackground.update();

    if (!this.isGameOver) {
      if (this.input.pressingKeys['KeyA']) {
        this.spaceship.rotate(-1);
      } else if (this.input.pressingKeys['KeyD']) {
        this.spaceship.rotate(1);
      }

      this.createAsteroid();

      if (this.input.pressingKeys['Space']) {
        this.createProjectile(
          new Vector2(this.spaceship.transformedVertices[0]),
          this.spaceship.direction
        );
      }

      for (const asteroid of this.asteroids) {
        const isSpaceshipDestroyed =
          this.hasAsteroidCollidedSpaceship(asteroid);

        if (isSpaceshipDestroyed) {
          this.isGameOver = true;
          this.createExplosionEffect(this.spaceship.position);

          this.gameOverHandler();
        }
      }
    }

    for (const asteroid of this.asteroids) {
      if (this.isGameOver) {
        this.createExplosionEffect(asteroid.position);
        this.soundEffects.play('explosion');

        this.asteroids.delete(asteroid);
        this.asteroidsInPool.add(asteroid);

        continue;
      }

      asteroid.update();

      const hw = width / 2;
      const hh = height / 2;

      const maxX = hw + asteroid.maxRadius / 2;
      const maxY = hh + asteroid.maxRadius / 2;

      const isOutsideBoundaries =
        asteroid.position.y > maxY ||
        asteroid.position.y < -maxY ||
        asteroid.position.x > maxX ||
        asteroid.position.x < -maxX;

      if (isOutsideBoundaries) {
        this.asteroids.delete(asteroid);
        this.asteroidsInPool.add(asteroid);
      }
    }

    for (const projectile of this.projectiles) {
      projectile.update();

      const hw = width / 2;
      const hh = height / 2;

      const isOutsideBoundaries =
        projectile.tailPosition.y > hh ||
        projectile.tailPosition.y < -hh ||
        projectile.tailPosition.x > hw ||
        projectile.tailPosition.x < -hw;

      const collidedAsteroid =
        !isOutsideBoundaries &&
        this.getCollidedAsteroid(projectile, this.asteroids);

      if (isOutsideBoundaries || collidedAsteroid) {
        this.projectiles.delete(projectile);
        this.projectilesInPool.add(projectile);

        if (collidedAsteroid) {
          this.asteroids.delete(collidedAsteroid);
          this.asteroidsInPool.add(collidedAsteroid);

          this.createExplosionEffect(collidedAsteroid.position);

          this.soundEffects.play('explosion');

          this.score += 1;
          this.scoringHandler(this.score);
        }
      }
    }

    for (const explosionEffect of this.explosionEffects) {
      explosionEffect.update();

      if (explosionEffect.particles.size === 0) {
        this.explosionEffects.delete(explosionEffect);
        this.explosionEffectsInPool.add(explosionEffect);
      }
    }
  }

  render() {
    const { ctx, width, height } = this.game.renderer;

    ctx.save();

    ctx.resetTransform();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    ctx.resetTransform();
    ctx.translate(width / 2, height / 2);

    this.starsBackground.render();

    // drawGrid({
    //   ctx,
    //   width,
    //   height,
    //   position: {
    //     x: 0,
    //     y: 0
    //   },
    //   origin: {
    //     x: width / 2,
    //     y: height / 2
    //   }
    // });

    // drawAxis({
    //   ctx,
    //   width,
    //   height,
    //   position: {
    //     x: 0,
    //     y: 0
    //   },
    //   origin: {
    //     x: width / 2,
    //     y: height / 2
    //   }
    // });

    this.asteroids.forEach((asteroid) => {
      asteroid.render();
    });

    this.projectiles.forEach((projectile) => {
      projectile.render();
    });

    this.explosionEffects.forEach((explosionEffect) => {
      explosionEffect.render();
    });

    if (!this.isGameOver) {
      this.spaceship.render();
    }
  }
}

export default MainScene;
