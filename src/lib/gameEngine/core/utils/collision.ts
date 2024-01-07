import Vector2, { Vector2Like } from '../Vector2';

export const checkCollisionCircleToCircle = (
  a: {
    radius: number;
    position: Vector2Like;
  },
  b: {
    radius: number;
    position: Vector2Like;
  }
): boolean => {
  const distance = new Vector2(a.position).distance(new Vector2(b.position));

  return 0 >= distance - (a.radius + b.radius);
};

export const findVerticesIntersection = (
  a: Vector2Like[],
  b: Vector2Like[]
) => {
  for (let i = 0; i < a.length - 1; ++i) {
    for (let l = 0; l < b.length - 1; ++l) {
      const intersection = Vector2.getIntersection(
        a[i],
        a[i + 1],
        b[l],
        b[l + 1]
      );

      if (intersection) {
        return intersection;
      }
    }
  }

  return null;
};

export const checkCollisionCircularShapeToCircularShape = (
  a: {
    radius: number;
    position: Vector2Like;
    vertices: Vector2Like[];
  },
  b: {
    radius: number;
    position: Vector2Like;
    vertices: Vector2Like[];
  }
): boolean => {
  const isCollisionPossible = checkCollisionCircleToCircle(a, b);

  return (
    isCollisionPossible && !!findVerticesIntersection(a.vertices, b.vertices)
  );
};
