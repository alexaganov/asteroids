import GameObject from './GameObject';
import Point2D from './Point2D';
import { Point2DArray } from './types/Point';
import { DEGREES_TO_RADIANS, RADIANS_TO_DEGREES } from './utils/math';
import Vector2 from './Vector2';

class Spaceship extends GameObject {
  private size = 100;
  private vertices: Point2DArray[] = [];

  private rotationSpeed = 4;

  public direction = Vector2.right;

  // TODO: add direction;

  init(): void {
    const hs = this.size / 2;

    this.vertices = [
      [0, -hs * 1.2],
      [hs / 1.1, hs * 0.7],
      [0, hs / 2],
      [-hs / 1.1, hs * 0.7]
    ];
  }

  destroy(): void {
    // do nothing
  }

  get transformedVertices() {
    const rotationMatrix = new DOMMatrix().rotateAxisAngle(
      0,
      0,
      1,
      this.direction.angle
    );

    return this.vertices.map((vertex) => {
      return new Point2D(vertex).transform(rotationMatrix);
    });
  }

  rotate(dir: -1 | 0 | 1) {
    this.direction.rotateBy(dir * this.rotationSpeed);
  }

  update(): void {
    // do nothing
  }

  render(): void {
    const { ctx } = this.game.renderer;
    const { transformedVertices } = this;

    ctx.beginPath();

    ctx.moveTo(transformedVertices[0].x, transformedVertices[0].y);

    for (let i = 1; i < transformedVertices.length; ++i) {
      const { x, y } = transformedVertices[i];

      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';

    ctx.fill();
    ctx.stroke();
  }
}

export default Spaceship;
