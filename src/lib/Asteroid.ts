import GameObject from './Game';
import Random from './Random';
import { clamp, RADIANS_TO_DEGREES, TWO_PI } from './utils/math';
import Vector2, { Vector2Object } from './Vector2';

class Asteroid {
  static generateVertices({
    position = { x: 0, y: 0 },
    maxRadius,
    numOfVertices,
    spikiness = 0,
    maxSpikeSize
  }: {
    position?: Vector2Object;
    maxRadius: number;
    numOfVertices: number;
    spikiness: number;
    maxSpikeSize: number;
  }): Vector2[] {
    const angleStep = TWO_PI / numOfVertices;
    const halfOfAngleStep = angleStep / 2;

    if (maxSpikeSize > maxRadius) {
      maxSpikeSize = maxRadius;
    }

    let nextAngle = Random.get(0, TWO_PI);

    const vertices = Array.from({ length: numOfVertices }, (_) => {
      const angle = Random.get(
        nextAngle - halfOfAngleStep,
        nextAngle + halfOfAngleStep
      );

      const gauss = clamp(Random.gauss(0.5, spikiness), 0, 1);
      const m = gauss * maxSpikeSize + (maxRadius - maxSpikeSize);

      const x = m * Math.cos(angle) + position.x;
      const y = m * Math.sin(angle) + position.y;

      nextAngle += angleStep;

      return new Vector2(x, y);
    });

    return vertices;
  }
}

export default Asteroid;
