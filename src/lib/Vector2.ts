import { DEGREES_TO_RADIANS, RADIANS_TO_DEGREES } from './utils/math';

export type Vector2Object = {
  x: number;
  y: number;
};

export type Vector2Array = [number, number];

export type Vector2Like = Vector2Object | Vector2Array;

class Vector2 implements Vector2Object {
  public x: number;
  public y: number;

  static get zero(): Vector2 {
    return new Vector2(0);
  }
  static get one(): Vector2 {
    return new Vector2(1);
  }
  static get left(): Vector2 {
    return new Vector2(-1, 0);
  }
  static get right(): Vector2 {
    return new Vector2(1, 0);
  }
  static get top(): Vector2 {
    return new Vector2(0, -1);
  }
  static get bottom(): Vector2 {
    return new Vector2(0, 1);
  }

  constructor();
  constructor(xAndY: number);
  constructor(v: Vector2Object | [number, number]);
  constructor(x: number, y: number);
  constructor(x: number | Vector2Object | [number, number] = 0, y?: number) {
    if (typeof x === 'number') {
      y = typeof y === 'number' ? y : x;
    } else if (Vector2.isVector2Like(x)) {
      ({ x, y } = x);
    } else if (Array.isArray(x)) {
      [x, y] = x;
    }

    this.x = x;
    this.y = y || 0;
  }

  set(xAndY: number): this;
  set(v: Vector2 | Vector2Object): this;
  set(xyv: number | Vector2 | Vector2Object, y?: number): this {
    if (typeof xyv === 'number') {
      this.x = xyv;
      this.y = typeof y === 'number' ? y : xyv;
    } else if (Vector2.isVector2Like(xyv)) {
      this.x = xyv.x;
      this.y = xyv.y;
    }

    return this;
  }

  static isVector2Like(v: any): v is Vector2Object {
    return (
      typeof v === 'object' &&
      typeof v.x === 'number' &&
      typeof v.y === 'number'
    );
  }

  static toObject(v: Vector2Like | number): Vector2Object {
    if (v instanceof Vector2) {
      return v.toObject();
    }

    let x: number;
    let y: number;

    if (Vector2.isVector2Like(v)) {
      ({ x, y } = v);
    } else if (Array.isArray(v)) {
      [x, y] = v;
    } else {
      x = y = v;
    }

    return {
      x,
      y
    };
  }

  invert(): this {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  multiply(v: number | Vector2): this {
    if (typeof v === 'number') {
      this.x *= v;
      this.y *= v;
    } else {
      this.x *= v.x;
      this.y *= v.y;
    }

    return this;
  }

  crossProduct(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  clone(): Vector2 {
    return new Vector2(this);
  }

  distance(v: Vector2): number {
    const x = this.x - v.x;
    const y = this.y - v.y;

    return Math.hypot(x, y);
  }

  get magnitude() {
    return Math.hypot(this.x, this.y);
  }

  set magnitude(newMagnitude: number) {
    this.normalize().multiply(newMagnitude);
  }

  get length() {
    return this.magnitude;
  }
  // angle(radians?: boolean) {
  //   const angle = Math.PI - Math.atan2(this.x, this.y);

  //   return radians ? angle : angle * RADIANS_TO_DEGREES;
  // }

  rotateBy(angleInDegrees: number): this {
    const angleInRadians = angleInDegrees * DEGREES_TO_RADIANS;
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);

    const x = cos * this.x - sin * this.y;
    const y = sin * this.x + cos * this.y;

    this.x = x;
    this.y = y;

    return this;
  }

  // rotateBy(angleInDegrees: number): this {
  //   const { angle, magnitude } = this;
  //   const newAngle = angleInDegrees + angle;

  //   return this.rotate(newAngle);
  //   // this.x = magnitude * Math.cos(newAngle);
  //   // this.y = magnitude * Math.sin(newAngle);

  //   return this;
  // }

  normalize(): this {
    const m = this.magnitude;

    if (m > 0) {
      this.multiply(1 / m);
    }

    return this;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  toObject(): Vector2Object {
    return {
      x: this.x,
      y: this.y
    };
  }

  equals(vector: Vector2Object): boolean {
    return this.x === vector.x && this.y === vector.y;
  }

  /**
   * @returns angle in degrees
   */
  get angle(): number {
    return (Math.PI - Math.atan2(this.x, this.y)) * RADIANS_TO_DEGREES;
    // return Math.atan2(this.y, this.x) * RADIANS_TO_DEGREES;
  }

  get normalized(): Vector2 {
    return new Vector2(this).normalize();
  }

  get inverted(): Vector2 {
    return new Vector2(this).invert();
  }
}

export default Vector2;
