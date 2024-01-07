import GameObject from './GameObject';
import Point2D from './Point2D';
import { Point2DArray } from './types/Point';
import {
  DEGREES_TO_RADIANS,
  RADIANS_TO_DEGREES,
  TWO_PI
} from './gameEngine/core/utils/math';
import Vector2, { Vector2Array } from './gameEngine/core/Vector2';

class Spaceship extends GameObject {
  public size = 100;
  public position: Vector2 = Vector2.zero;
  private vertices: Vector2Array[] = [];
  public transformedVertices: Vector2Array[] = [];

  private rotationSpeed = 4;

  public direction = Vector2.right;

  public color = '#fff';

  init(): void {
    const hs = this.size / 2;

    this.transformedVertices = this.vertices = [
      [0, -hs],
      Vector2.right.multiply(hs).rotateBy(40).toArray(),
      [0, hs / 2],
      Vector2.left.multiply(hs).rotateBy(-40).toArray()
    ];

    this.updateTransformedVertices();
  }

  destroy(): void {
    // do nothing
  }

  updateTransformedVertices() {
    const rotationMatrix = new DOMMatrix().rotateAxisAngle(
      0,
      0,
      1,
      this.direction.angle
    );

    this.transformedVertices = this.vertices.map((vertex) => {
      return new Vector2(vertex).transform(rotationMatrix).toArray();
    });
  }

  rotate(dir: -1 | 0 | 1) {
    this.direction.rotateBy(dir * this.rotationSpeed);

    this.updateTransformedVertices();
  }

  update(): void {
    // do nothing
  }

  reset() {
    this.direction = Vector2.right;

    this.updateTransformedVertices();
  }

  render(): void {
    const { ctx } = this.game.renderer;
    const { transformedVertices } = this;

    ctx.beginPath();

    ctx.moveTo(transformedVertices[0][0], transformedVertices[0][1]);

    for (let i = 1; i < transformedVertices.length; ++i) {
      const [x, y] = transformedVertices[i];

      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';

    ctx.fill();
    ctx.stroke();

    // ctx.beginPath();
    // ctx.arc(this.position.x, this.position.y, this.size / 2, 0, TWO_PI);
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = '#0f0';

    // ctx.stroke();
  }
}

export default Spaceship;
