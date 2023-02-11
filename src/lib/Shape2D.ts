import Vector2 from './Vector2';

class Shape2D {
  public vertices: Vector2[] = [];

  constructor(vertices: Vector2[]) {
    this.vertices = vertices;
  }

  rotate(degrees: number): this {
    return this;
  }

  scale(value: number): this {
    return this;
  }

  translate(position: Vector2): this {
    // this.vertices = this.vertices.map(([x, y]) => {
    //   return [x + position.x, y + position.y]
    // });

    return this;
  }

  clear() {
    this.vertices = [];
  }
}

export default Shape2D;
