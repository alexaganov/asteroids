interface Point2DObject {
  x: number;
  y: number;
}

type Point2DArray = [number, number];

class Point2D implements Point2DObject {
  static from(point: Point2DArray) {
    return new Point2D(point[0], point[1]);
  }
  private domPoint: DOMPoint;

  constructor(arrayPoint: Point2DArray);
  constructor(x: number, y: number);
  constructor(x: number | Point2DArray, y?: number) {
    if (Array.isArray(x)) {
      [x, y] = x;
    }

    this.domPoint = new DOMPoint(x, y);
  }

  get x() {
    return this.domPoint.x;
  }

  get y() {
    return this.domPoint.y;
  }

  toArray() {
    return [this.x, this.y];
  }

  transform(matrix: DOMMatrix) {
    this.domPoint = this.domPoint.matrixTransform(matrix);

    return this;
  }
}

export default Point2D;
