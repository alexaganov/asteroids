import { DEGREES_TO_RADIANS } from './gameEngine/core/utils/math';
import Vector2, { Vector2Like, Vector2Object } from './gameEngine/core/Vector2';

class Matrix2D {
  public a: number;
  public b: number;
  public c: number;
  public d: number;
  public tx: number;
  public ty: number;

  constructor(
    a?: number,
    b?: number,
    c?: number,
    d?: number,
    tx?: number,
    ty?: number
  );
  constructor(matrix?: Matrix2D);
  constructor(a: number | Matrix2D = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
    if (typeof a === 'object') {
      ({ a, b, c, d, tx, ty } = a);
    }

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  multiply(...matrices: Matrix2D[]): this {
    matrices.forEach((matrix) => {
      this.a = this.a * matrix.a + this.b * matrix.c;
      this.b = this.a * matrix.b + this.b * matrix.d;
      this.c = this.c * matrix.a + this.d * matrix.c;
      this.d = this.c * matrix.b + this.d * matrix.d;
      this.tx = this.a * matrix.tx + this.b * matrix.ty + this.tx;
      this.ty = this.c * matrix.tx + this.d * matrix.ty + this.ty;
    });

    return this;
  }

  applyMatrixTo(pos: Vector2Object): Vector2Object;
  applyMatrixTo(pos: [number, number]): [number, number];
  applyMatrixTo(
    pos: Vector2Object | [number, number]
  ): Vector2Object | [number, number] {
    let x: number;
    let y: number;

    if (Array.isArray(pos)) {
      [x, y] = pos;
    } else {
      ({ x, y } = pos);
    }

    x = this.a * x + this.b * y + this.tx;
    y = this.c * x + this.d * y + this.ty;

    return Array.isArray(pos) ? [x, y] : { x, y };
  }

  static multiply(ma: Matrix2D, mb: Matrix2D): Matrix2D {
    // static multiply(vector: Vector2): Vector2;
    // static multiply(mOrV: Vector2 | Matrix2D): Vector2 | Matrix2D {
    // if (mOrV instanceof Vector2) {
    //   const vector = mOrV;

    //   return new Vector2(
    //     this.a * vector.x + this.b * vector.y + this.tx,
    //     this.c * vector.x + this.d * vector.y + this.ty
    //   );
    // }

    // const matrix = mOrV;

    return new Matrix2D(
      ma.a * mb.a + ma.b * mb.c, // a
      ma.a * mb.b + ma.b * mb.d, // b
      ma.c * mb.a + ma.d * mb.c, // c
      ma.c * mb.b + ma.d * mb.d, // d
      ma.a * mb.tx + ma.b * mb.ty + ma.tx, // tx
      ma.c * mb.tx + ma.d * mb.ty + ma.ty // tx
    );
  }

  static getTransformationMatrix({
    position = { x: 0, y: 0 },
    rotation = 0,
    scaling = 1
  }: {
    position?: { x: number; y: number };
    rotation?: number;
    scaling?: number | { x: number; y: number };
  } = {}) {
    const scalingObject =
      typeof scaling === 'number' ? { x: scaling, y: scaling } : scaling;

    return new Matrix2D(
      Math.cos(rotation) * scalingObject.x,
      -Math.sin(rotation) * scalingObject.y,
      Math.sin(rotation) * scalingObject.x,
      Math.cos(rotation) * scalingObject.y,
      position.x,
      position.y
    );
  }

  static getTranslationMatrix({ x, y }: Vector2Object) {
    return new Matrix2D(1, 0, 0, 1, x, y);
  }

  static getRotationMatrix(angleInRadians: number, pivot?: Vector2Object) {
    const rotationMatrix = new Matrix2D(
      Math.cos(angleInRadians),
      -Math.sin(angleInRadians),
      Math.sin(angleInRadians),
      Math.cos(angleInRadians),
      0,
      0
    );

    if (pivot) {
      return this.getTranslationMatrix(pivot).multiply(
        rotationMatrix,
        this.getTranslationMatrix({
          x: -pivot.x,
          y: -pivot.y
        })
      );
    }

    return rotationMatrix;
  }

  static extractRotationMatrix(matrix: Matrix2D): Matrix2D {
    return new Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, 0, 0);
  }

  static extractTranslationMatrix(matrix: Matrix2D): Matrix2D {
    return new Matrix2D(1, 0, 0, 1, matrix.tx, matrix.ty);
  }

  static getScalingMatrix(scale: Vector2Object | number) {
    const { x, y } = typeof scale === 'object' ? scale : { x: scale, y: scale };

    return new Matrix2D(x, 0, 0, y, 0, 0);
  }

  rotate(angleInRadians: number, pivot?: Vector2Object) {
    this.multiply(Matrix2D.getRotationMatrix(angleInRadians, pivot));

    return this;
  }

  addRotation(angleInRadians: number, pivot?: Vector2Object): this {
    const newRotation = Matrix2D.multiply(
      Matrix2D.extractRotationMatrix(this),
      Matrix2D.getRotationMatrix(angleInRadians, pivot)
    );

    return this.copy(
      newRotation
      // Matrix2D.multiply(Matrix2D.extractTranslationMatrix(this), )
    );
  }

  copy(matrix: Matrix2D): this {
    this.a = matrix.a;
    this.b = matrix.b;
    this.c = matrix.c;
    this.d = matrix.d;
    this.tx = matrix.tx;
    this.ty = matrix.ty;

    return this;
  }

  // static scaleAt(pivot: Vector2Like, scaling: number | Vector2Like) {
  //   pivot = Vector2.toObject(pivot);

  //   return Matrix2D.compose(
  //     Matrix2D.translate([-pivot.x, -pivot.y]),
  //     Matrix2D.scale(scaling),
  //     Matrix2D.translate(pivot)
  //   );
  // }
}

export default Matrix2D;
