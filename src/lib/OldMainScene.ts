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
import Vector2 from './Vector2';
import Game from './Game';
import GameObject from './GameObject';

interface SpaceshipProperties {}

enum SpaceshipControls {
  ROTATE_LEFT,
  ROTATE_RIGHT,
  MOVE_FORWARD
}

class Spaceship extends GameObject {
  private _size: Size = new Size(100, 100);
  public readonly position: Vector2 = Vector2.zero;
  // private _position: Vector2 = new Vector2(0);
  private _velocity: Vector2 = Vector2.zero;
  private _maxSpeed = 500;
  private _rotationSpeed = 200;
  private _accelerationSpeed = 5;
  private _direction: Vector2 = Vector2.top;

  private _rotationDirection = 0;
  private _accelerationDirection = 0;

  public readonly shape: Shape2D;
  public readonly rhomb: Shape2D;
  public readonly rect: Shape2D;

  constructor(
    game: Game,
    properties?: {
      position: Vector2;
      size: Size;
      acceleration: number;
      maxSpeed: number;
      rotationSpeed: number;
      direction: Vector2;
    }
  ) {
    super(game);

    const bottomLength = this._size.height / 3;
    const topLength = this._size.height - bottomLength;

    const rhombSize = new Size(12, 24);

    this.shape = new Shape2D([
      new Vector2(0, -topLength),
      new Vector2(-this._size.width / 2, bottomLength),
      new Vector2(0, 0),
      new Vector2(this._size.width / 2, bottomLength)
    ]);

    this.rhomb = new Shape2D([
      new Vector2(0, rhombSize.height / -2),
      new Vector2(rhombSize.width / 2, rhombSize.height / 4),
      new Vector2(0, rhombSize.height / 2),
      new Vector2(rhombSize.width / -2, rhombSize.height / 4)
    ]);

    this.rect = new Shape2D([
      new Vector2(rhombSize.width / -2, 0),
      new Vector2(rhombSize.width / 2, 0),
      new Vector2(rhombSize.width / 2, rhombSize.height),
      new Vector2(rhombSize.width / -2, rhombSize.height)
    ]);
  }

  input() {
    const { KeyW, KeyA, KeyD, KeyS } = this.game.userInput.pressingKeys;

    if (KeyD) {
      this._rotationDirection = 1;
    } else if (KeyA) {
      this._rotationDirection = -1;
    } else {
      this._rotationDirection = 0;
    }

    if (KeyW) {
      this._accelerationDirection = 1;
    } else if (KeyS) {
      this._accelerationDirection = -1;
    } else {
      this._accelerationDirection = 0;
    }
  }

  update() {
    this.input();

    const { mspf } = this.game.gameLoop;

    if (this._rotationDirection !== 0) {
      this._direction.rotateBy(
        this._rotationDirection * this._rotationSpeed * mspf
      );
    }

    if (this._accelerationDirection === 1) {
      const direction = new Vector2(this._direction);

      // if (this._accelerationDirection === 1) {
      //   direction.invert();
      // }

      const acceleration = direction.multiply(this._accelerationSpeed * mspf);

      this._velocity.add(acceleration);
    }

    // if (this._accelerationDirection !== 0) {
    //   const direction = new Vector2(this._direction);

    //   if (this._accelerationDirection === -1) {
    //     direction.invert();
    //   }

    //   const acceleration = direction.multiply(
    //     this._accelerationSpeed * mspf
    //   );

    //   this._velocity.add(acceleration);
    // }

    if (this._accelerationDirection === -1) {
      const direction = this._velocity.normalized.invert();

      const acceleration = direction.multiply(this._accelerationSpeed * mspf);

      if (acceleration.magnitude > this._velocity.magnitude) {
        this._velocity = Vector2.zero;
      } else {
        this._velocity.add(acceleration);
      }
    }

    const maxSpeed = this._maxSpeed * mspf;

    if (this._velocity.magnitude > maxSpeed) {
      this._velocity.magnitude = maxSpeed;
    }

    this.position.add(this._velocity);
  }

  drawBodyArc(position: Vector2, radius: number, spaceAngle: number) {
    const { draw } = this.game.renderer;

    const directionAngle = this._direction.angle();

    draw.arc(
      position,
      radius,
      directionAngle - (180 + spaceAngle),
      directionAngle + spaceAngle
    );
  }

  drawBody(vertices: Vector2[]) {
    const { draw } = this.game.renderer;

    draw.startPath(vertices[0]);

    for (let i = 1; i < vertices.length; ++i) {
      const vertex = vertices[i];

      if (i === 2) {
        this.drawBodyArc(vertex, 18, 45);
      } else {
        draw.lineTo(vertex);
      }
    }

    draw.endPath();

    draw.stroke({
      width: 2,
      fill: '#fff'
    });
  }

  renderBody(position: Vector2) {
    const { draw, boundary } = this.game.renderer;

    const directionAngle = this._direction.angle();

    const bodyMatrix = Matrix2D.getTransformationMatrix(
      position,
      directionAngle
    );

    const bodyVertices = this.shape.vertices.map((vector) => {
      return bodyMatrix.multiply(vector);
    });

    this.drawBody(bodyVertices);

    let horizontalClonePosition: Vector2 | null = null;
    let verticalClonePosition: Vector2 | null = null;

    for (let i = 0; i < bodyVertices.length; ++i) {
      const vertex = bodyVertices[i];

      if (vertex.x > boundary.end.x || vertex.x < boundary.start.x) {
        horizontalClonePosition = new Vector2(
          vertex.x > boundary.end.x
            ? boundary.start.x - (boundary.end.x - position.x)
            : position.x - boundary.start.x + boundary.end.x,
          position.y
        );
      }

      if (vertex.y > boundary.end.y || vertex.y < boundary.start.y) {
        verticalClonePosition = new Vector2(
          position.x,
          vertex.y > boundary.end.y
            ? boundary.start.y - (boundary.end.y - position.y)
            : position.y - boundary.start.y + boundary.end.y
        );
      }
    }

    if (horizontalClonePosition) {
      const cloneMatrix = Matrix2D.getTransformationMatrix(
        horizontalClonePosition,
        directionAngle
      );

      const cloneVertices = this.shape.vertices.map((vector) => {
        return cloneMatrix.multiply(vector);
      });

      this.drawBody(cloneVertices);
    }

    if (verticalClonePosition) {
      const cloneMatrix = Matrix2D.getTransformationMatrix(
        verticalClonePosition,
        directionAngle
      );

      const cloneVertices = this.shape.vertices.map((vector) => {
        return cloneMatrix.multiply(vector);
      });

      this.drawBody(cloneVertices);
    }

    // const isOutside = (vertices: Vector2[]) => {
    //   return vertices.some(vertex => {
    //     return (
    //       vertex.x > boundary.start.x &&
    //       vertex.y > boundary.start.y &&
    //       vertex.x < boundary.end.x &&
    //       vertex.y < boundary.end.y
    //     )
    //   });
    // }
  }

  renderCore(position: Vector2) {
    const { ctx, draw } = this.game.renderer;

    const angle =
      this._velocity.x === 0 && this._velocity.y === 0
        ? this._direction.angle()
        : this._velocity.angle();

    const directionRhomb = Matrix2D.getTransformationMatrix(position, angle);

    const directionRhombVertices = this.rhomb.vertices.map((vector) => {
      return directionRhomb.multiply(vector);
    });

    const speedometerScaleY =
      this._velocity.magnitude / (this._maxSpeed * this.game.gameLoop.mspf);

    const speedometerMatrix = Matrix2D.compose(
      Matrix2D.rotateAt(angle, directionRhombVertices[0]),
      Matrix2D.translate(directionRhombVertices[0]),
      Matrix2D.scale({
        x: 1,
        y: speedometerScaleY
      })
    );

    const speedometerVertices = this.rect.vertices.map((vector) => {
      return speedometerMatrix.multiply(vector);
    });

    // direction
    draw.path(directionRhombVertices);
    draw.stroke({
      fill: '#fff',
      width: 2
    });

    // speedometer
    ctx.save();
    // clip direction rhomb shape
    ctx.clip();
    draw.path(speedometerVertices);
    draw.fill({
      style: '#fff'
    });
    ctx.restore();
  }

  render() {
    const { ctx, origin } = this.game.renderer;

    this.renderBody(this.position);
    this.renderCore(this.position);
  }
}

class MainScene extends Scene {
  public entities: GameObject[] = [];
  public spaceship = new Spaceship(this.game);

  init() {
    this.entities.push(this.spaceship);

    // console.log(this.game.renderer.ctx);

    // this.callScenes("init");
    // this.asteroidPolygon = Asteroid.generateVertices({
    //   spikiness: 0,
    //   maxRadius: 100,
    //   maxSpikeSize: 10,
    //   numOfVertices: 10
    // });
  }

  destroy() {
    this.entities = [];
  }

  update() {
    this.entities.forEach((entity) => entity.update());
  }

  renderAxis(position: Vector2 = Vector2.zero) {
    const { draw, width, origin, height, boundary } = this.game.renderer;

    let vx = 0;

    if (position.x > boundary.end.x) {
      vx = position.x - boundary.end.x;
    } else if (position.x < boundary.start.x) {
      vx = position.x - boundary.start.x;
    }

    draw.verticalLine([vx, position.y - origin.y], height, {
      style: {
        fill: 'rgba(0, 255, 0, 0.5)',
        width: 2
      }
    });

    let hy = 0;

    if (position.y > boundary.end.y) {
      hy = position.y - boundary.end.y;
    } else if (position.y < boundary.start.y) {
      hy = position.y - boundary.start.y;
    }

    draw.horizontalLine([position.x - origin.x, hy], width, {
      style: {
        fill: 'rgba(255, 0, 0, 0.5)',
        width: 2
      }
    });
  }

  cameraFollow(vector: Vector2) {
    const { ctx, origin } = this.game.renderer;

    ctx.resetTransform();

    const cameraPosition = new Vector2(origin).sub(vector);

    ctx.translate(+cameraPosition.x.toFixed(2), +cameraPosition.y.toFixed(2));

    ctx.scale(this.game.renderer.dpr, this.game.renderer.dpr);
  }

  render() {
    this.game.renderer.background('#000');

    const { draw } = this.game.renderer;

    // this.cameraFollow(this.spaceship.position);
    this.renderAxis(Vector2.zero);

    draw.grid(Vector2.zero, 10, {
      color: '#fff',
      opacity: 0.05
    });

    draw.grid(Vector2.zero, 50, {
      color: '#fff',
      opacity: 0.1
    });

    this.entities.forEach((entity) => entity.render());
  }
}

export default MainScene;
