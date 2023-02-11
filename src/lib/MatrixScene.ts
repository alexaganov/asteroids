import GameObject from './GameObject';
import Matrix2D from './Matrix2D';
import Scene from './Scene';
import { DEGREES_TO_RADIANS } from './utils/math';
import Vector2 from './Vector2';

class MatrixScene extends Scene {
  public entities: GameObject[] = [];
  public rectShape: Vector2[] = [];

  public pivot = new Vector2(-200, 150);

  init() {
    // const a = new Matrix(10, 20, 4, 5, 10, 6);
    // const b = new Matrix(3, 2, 3, 3, 4, 9);

    this.rectShape = [
      new Vector2(200, -200),
      new Vector2(300, -200),
      new Vector2(300, -100),
      new Vector2(200, -100)
    ];

    const rotateMatrix = Matrix2D.scaleAt(this.pivot, 2);

    // Matrix.rotateAt(-5 * DEGREES_TO_RADIANS, new Vector2(0, -50));

    // Matrix.multiply(
    //   Matrix.multiply(
    //     Matrix.translated({
    //       x: -pivot.x,
    //       y: -pivot.y
    //     }),
    //     Matrix.scaled({
    //       x: 1,
    //       y: 1
    //     })), Matrix.translated({
    //       x: pivot.x,
    //       y: pivot.y
    //     })
    // );

    this.rectShape = this.rectShape.map((v) => {
      return Matrix2D.multiply(rotateMatrix, v);
    });

    // console.log(a.multiply(b));
  }

  destroy() {}

  update() {}

  render() {
    const { draw, ctx, center, width, height } = this.game.renderer;

    ctx.save();
    draw.path(this.rectShape);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    draw.arc(this.pivot, 5);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();
  }
}

export default MatrixScene;
