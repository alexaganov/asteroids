import { DEGREES_TO_RADIANS } from './utils/math';
import Vector2, { Vector2Like, Vector2Object } from './Vector2';

class Matrix2D {
  private a: number;
  private b: number;
  private c: number;
  private d: number;
  private tx: number;
  private ty: number;

  constructor(matrix: Matrix2D);
  constructor(
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number
  );
  constructor(a: number | Matrix2D = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
    if (a instanceof Matrix2D) {
      ({ a, b, c, d, tx, ty } = a);
    }

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  multiply(matrix: Matrix2D): Matrix2D;
  multiply(vector: Vector2): Vector2;
  multiply(mOrV: Vector2 | Matrix2D): Vector2 | Matrix2D {
    if (mOrV instanceof Vector2) {
      const vector = mOrV;

      return new Vector2(
        this.a * vector.x + this.b * vector.y + this.tx,
        this.c * vector.x + this.d * vector.y + this.ty
      );
    }

    const matrix = mOrV;

    return new Matrix2D(
      this.a * matrix.a + this.b * matrix.c, // a
      this.a * matrix.b + this.b * matrix.d, // b
      this.c * matrix.a + this.d * matrix.c, // c
      this.c * matrix.b + this.d * matrix.d, // d

      this.a * matrix.tx + this.b * matrix.ty + this.tx, // tx
      this.c * matrix.tx + this.d * matrix.ty + this.ty // tx
    );
  }

  static multiply(matrixA: Matrix2D, matrixB: Matrix2D): Matrix2D;
  static multiply(matrix: Matrix2D, vector: Vector2Object): Vector2;
  static multiply(
    matrix: Matrix2D,
    matrixOrVector: Matrix2D | Vector2Object
  ): Vector2 | Matrix2D {
    if (matrixOrVector instanceof Matrix2D) {
      const matrixB = matrixOrVector;

      return new Matrix2D(
        matrix.a * matrixB.a + matrix.b * matrixB.c, // a
        matrix.a * matrixB.b + matrix.b * matrixB.d, // b
        matrix.c * matrixB.a + matrix.d * matrixB.c, // c
        matrix.c * matrixB.b + matrix.d * matrixB.d, // d
        matrix.a * matrixB.tx + matrix.b * matrixB.ty + matrix.tx, // tx
        matrix.c * matrixB.tx + matrix.d * matrixB.ty + matrix.ty // tx
      );
    }
    const vector = matrixOrVector;

    return new Vector2(
      matrix.a * vector.x + matrix.b * vector.y + matrix.tx,
      matrix.c * vector.x + matrix.d * vector.y + matrix.ty
    );
  }

  static transform(
    position: Vector2Like,
    angleInDegrees = 0,
    scaling: number | Vector2Like = 1
  ) {
    const angle = angleInDegrees * DEGREES_TO_RADIANS;

    position = Vector2.toObject(position);
    scaling = Vector2.toObject(scaling);

    return new Matrix2D(
      Math.cos(angle) * scaling.x,
      -Math.sin(angle) * scaling.y,
      Math.sin(angle) * scaling.x,
      Math.cos(angle) * scaling.y,
      position.x,
      position.y
    );
  }

  static translate(vector: Vector2Like) {
    vector = Vector2.toObject(vector);

    return new Matrix2D(1, 0, 0, 1, vector.x, vector.y);
  }

  static rotate(angleInDegrees: number) {
    const angleInRadians = angleInDegrees * DEGREES_TO_RADIANS;

    return new Matrix2D(
      Math.cos(angleInRadians),
      -Math.sin(angleInRadians),
      Math.sin(angleInRadians),
      Math.cos(angleInRadians),
      0,
      0
    );
  }

  static rotateAt(angleInDegrees: number, pivot: Vector2Object) {
    return Matrix2D.compose(
      Matrix2D.translate(pivot),
      Matrix2D.rotate(angleInDegrees),
      Matrix2D.translate({
        x: -pivot.x,
        y: -pivot.y
      })
    );
  }

  static compose(...matrices: Matrix2D[]) {
    return matrices.reduce((prev, curr) => prev.multiply(curr));
  }

  static scale(scaling: number | Vector2Like) {
    scaling = Vector2.toObject(scaling);

    return new Matrix2D(1 * scaling.x, 0, 0, 1 * scaling.y, 0, 0);
  }

  static scaleAt(pivot: Vector2Like, scaling: number | Vector2Like) {
    pivot = Vector2.toObject(pivot);

    return Matrix2D.compose(
      Matrix2D.translate([-pivot.x, -pivot.y]),
      Matrix2D.scale(scaling),
      Matrix2D.translate(pivot)
    );
  }
}

export default Matrix2D;
