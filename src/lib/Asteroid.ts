import Game from './Game';
import GameObject from './GameObject';
import Point2D from './Point2D';
import Random from './Random';
import { clamp, TWO_PI } from './utils/math';
import Vector2, { Vector2Array, Vector2Object } from './Vector2';

const generateAsteroidVertices = ({
  maxRadius,
  numOfVertices,
  spikiness = 0,
  maxSpikeSize
}: {
  position?: Vector2Object;
  maxRadius: number;
  numOfVertices: number;
  spikiness: number;
  maxSpikeSize: number;
}): Vector2Array[] => {
  const angleStep = TWO_PI / numOfVertices;
  const halfOfAngleStep = angleStep / 2;

  if (maxSpikeSize > maxRadius) {
    maxSpikeSize = maxRadius;
  }

  let nextAngle = Random.getNumber(0, TWO_PI);

  const vertices = Array.from({ length: numOfVertices }, () => {
    const angle = Random.getNumber(
      nextAngle - halfOfAngleStep,
      nextAngle + halfOfAngleStep
    );

    const gauss = clamp(Random.gauss(0.5, spikiness), 0, 1);
    const m = gauss * maxSpikeSize + (maxRadius - maxSpikeSize);

    const x = m * Math.cos(angle);
    const y = m * Math.sin(angle);

    nextAngle += angleStep;

    return [x, y] as Vector2Array;
  });

  return vertices;
};

class Asteroid extends GameObject {
  public direction!: Vector2;
  public speed = 10;
  public maxRadius = 20;
  public rotationSpeed = 2;
  public angle = 0;
  public vertices: Vector2Array[];
  public initialPosition!: Vector2;
  public position!: Vector2;
  public transformedVertices!: Vector2Array[];

  constructor(
    game: Game,
    {
      position,
      direction,
      speed,
      maxRadius,
      rotationSpeed
    }: {
      direction: Vector2;
      position: Vector2;
      speed?: number;
      maxRadius?: number;
      rotationSpeed?: number;
    }
  ) {
    super(game);

    this.initialPosition = position;
    this.position = this.initialPosition.clone();
    this.direction = direction.normalized;
    this.speed = speed ?? this.speed;
    this.rotationSpeed = rotationSpeed ?? this.rotationSpeed;
    this.maxRadius = maxRadius ?? this.maxRadius;
    this.vertices = generateAsteroidVertices({
      maxRadius: this.maxRadius,
      spikiness: 10,
      maxSpikeSize: 10,
      numOfVertices: 10
    });
    this.transformedVertices = this.vertices;
  }

  // get transformedVertices() {
  //   const rotationMatrix = new DOMMatrix()
  //     .translateSelf(this.position.x, this.position.y)
  //     .rotateAxisAngleSelf(0, 0, 1, this.angle);

  //   return this.vertices.map((vertex) => {
  //     return new Point2D(vertex).transform(rotationMatrix);
  //   });
  // }

  reset({
    position,
    direction,
    speed,
    maxRadius,
    rotationSpeed
  }: {
    direction: Vector2;
    position: Vector2;
    speed?: number;
    maxRadius?: number;
    rotationSpeed?: number;
  }) {
    this.initialPosition = position;
    this.position = this.initialPosition.clone();
    this.direction = direction.normalized;
    this.speed = speed ?? this.speed;
    this.rotationSpeed = rotationSpeed ?? this.rotationSpeed;
    this.maxRadius = maxRadius ?? this.maxRadius;
    this.vertices = generateAsteroidVertices({
      maxRadius: this.maxRadius,
      spikiness: 10,
      maxSpikeSize: 10,
      numOfVertices: 10
    });
  }

  update() {
    const nextStep = this.direction.clone().multiply(this.speed);

    this.angle += this.rotationSpeed;
    this.position.add(nextStep);

    const rotationMatrix = new DOMMatrix()
      .translateSelf(this.position.x, this.position.y)
      .rotateAxisAngleSelf(0, 0, 1, this.angle);

    this.transformedVertices = this.vertices.map((vertex) => {
      const { x, y } = new Point2D(vertex).transform(rotationMatrix);
      return [x, y];
    });
  }

  destroy(): void {
    // do nothing
  }

  init(): void {
    // do nothing
  }

  render() {
    const { ctx } = this.game.renderer;
    const { transformedVertices } = this;

    ctx.beginPath();

    ctx.moveTo(transformedVertices[0][0], transformedVertices[0][1]);

    for (let i = 1; i < transformedVertices.length; ++i) {
      const [x, y] = transformedVertices[i];

      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';

    ctx.fill();
    ctx.stroke();

    // circle
    // ctx.beginPath();

    // ctx.arc(this.position.x, this.position.y, this.maxRadius, 0, TWO_PI);

    // ctx.strokeStyle = '#0f0';
    // ctx.lineWidth = 1;
    // ctx.stroke();
  }
}

export default Asteroid;
