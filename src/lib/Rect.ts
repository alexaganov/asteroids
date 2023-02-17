import GameEntity from './GameEntity';
import Matrix2D from './Matrix2D';
import { Vector2Object } from './Vector2';

class Rect extends GameEntity {
  private vertices: [number, number][] = [
    [-100, -100],
    [100, -100],
    [100, 100],
    [-100, 100]
  ];

  private matrix = new DOMMatrix();

  private angle = 0;
  public rectPath2D = new Path2D();
  public worldPath2D = new Path2D();

  destroy() {
    // do nothing
  }

  init(): void {
    // do nothing

    this.rectPath2D.moveTo(-100, -100);
    this.rectPath2D.lineTo(100, -100);
    this.rectPath2D.lineTo(100, 100);
    this.rectPath2D.lineTo(-100, 100);
    this.rectPath2D.closePath();

    // console.log(this.path2d);
  }

  update() {
    // this.angle += 1;
    this.matrix.rotateSelf(0, 0, 1);

    this.worldPath2D = new Path2D();

    this.worldPath2D.addPath(this.rectPath2D, this.matrix);
  }

  render() {
    const { ctx, width, height } = this.game.renderer;

    ctx.save();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke(this.worldPath2D);
    ctx.restore();
    // const matrix = new DOMMatrix();

    // matrix.translateSelf(10, 10)

    // const transformedVertices = this.vertices.map(
    //   (vertex) => {
    //     const result = matrix.transformPoint({ x: vertex[0], y: vertex[1] });

    //     // console.log(result.toJSON());

    //     return result;
    //   }
    //   // transformationMatrix.applyMatrixTo(vertex)
    // );

    // ctx.beginPath();

    // ctx.moveTo(transformedVertices[0].x, transformedVertices[0].y);

    // for (let i = 1; i < transformedVertices.length; ++i) {
    //   const { x, y } = transformedVertices[i];

    //   ctx.lineTo(x, y);
    // }

    // ctx.closePath();
  }
}

export default Rect;
