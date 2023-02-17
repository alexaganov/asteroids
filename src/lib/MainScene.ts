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

class MainScene extends GameObject {
  public shown = false;
  public rectEntity = new Rect(this.game);
  public spaceship = new Spaceship(this.game);
  public input = new UserInput();
  public angle = 0;
  public rotateSpeed = 0.01;

  public mouseX = 0;
  public mouseY = 0;
  public x = 0;
  public y = 0;

  public projectile: Projectile | undefined;

  public projectiles = new Set<Projectile>();
  public projectilesInPool = new Set<Projectile>();
  public asteroids = new Set<Asteroid>();
  public asteroidsInPool = new Set<Asteroid>();
  public projectileStart = Date.now();
  public projectileInterval = 200;
  public asteroidSpawnInterval = 1000;
  public lastAsteroidSpawnTimestamp = Date.now();

  init() {
    this.handleWindowMouseMove = this.handleWindowMouseMove.bind(this);
    // do nothing
    window.addEventListener('mousemove', this.handleWindowMouseMove);

    this.rectEntity.init();
    this.spaceship.init();
  }

  handleWindowMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  destroy() {
    window.removeEventListener('mousemove', this.handleWindowMouseMove);
  }

  cameraFollow(vector: Vector2) {
    const { ctx, origin } = this.game.renderer;

    ctx.resetTransform();

    const cameraPosition = new Vector2(origin).sub(vector);

    ctx.translate(+cameraPosition.x.toFixed(2), +cameraPosition.y.toFixed(2));

    ctx.scale(this.game.renderer.dpr, this.game.renderer.dpr);
  }

  createProjectile(position: Vector2, direction: Vector2, speed?: number) {
    const isIntervalPassed = Date.now() > this.projectileStart;

    if (!isIntervalPassed) {
      return;
    }

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
    const maxRadius = 50;

    console.log({ horizontal });

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

    console.log(this.asteroids, this.asteroidsInPool);

    this.lastAsteroidSpawnTimestamp = Date.now() + this.asteroidSpawnInterval;
  }

  update() {
    const { ctx, width, canvasEl, height, origin, center, draw } =
      this.game.renderer;

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
    // todo
    // this.rectEntity.update();
    // console.log(this.input.pressedKeys);
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

      if (isOutsideBoundaries) {
        this.projectiles.delete(projectile);
        this.projectilesInPool.add(projectile);
      }
    }
  }

  render() {
    const { ctx, width, canvasEl, height, origin, center, draw } =
      this.game.renderer;

    ctx.save();

    ctx.resetTransform();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    // this.cameraFollow(this.spaceship.position);
    // this.renderAxis(Vector2.zero);

    drawGrid({
      ctx,
      width,
      height,
      position: {
        x: 0,
        y: 0
      },
      origin: {
        x: width / 2,
        y: height / 2
      }
    });

    drawAxis({
      ctx,
      width,
      height,
      position: {
        x: 0,
        y: 0
      },
      origin: {
        x: width / 2,
        y: height / 2
      }
    });

    // this.rectEntity.render();

    ctx.beginPath();

    ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = 'red';
    ctx.stroke();

    this.asteroids.forEach((asteroid) => {
      asteroid.render();
    });

    this.projectiles.forEach((projectile) => {
      projectile.render();
    });

    this.spaceship.render();
    // ctx.save();

    // ctx.translate(-width / 2, -height / 2);

    // console.log(
    //   'isPointInPath',
    //   ctx.isPointInPath(this.rectEntity.worldPath2D, this.x, this.y)
    // );

    // ctx.restore();
  }
}

export default MainScene;
