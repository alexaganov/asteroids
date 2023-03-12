import Random from '@/lib/gameEngine/core/Random';
import { clamp, TWO_PI } from '@/lib/gameEngine/core/utils/math';
import Vector2, {
  Vector2Array,
  Vector2Object
} from '@/lib/gameEngine/core/Vector2';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/gameEngine/react/components/Renderer';
import useGameInterval from '@/lib/gameEngine/react/hooks/useGameInterval';
import useRefValue from '@/lib/gameEngine/react/hooks/useRefValue';

export interface Asteroid {
  position: Vector2;
  velocity: Vector2;
  vertices: Vector2Array[];
  initialVertices: Vector2Array[];
  rotationSpeed: number;
  angle: number;
  radius: number;
}

const generateAsteroidVertices = ({
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
}): Vector2Array[] => {
  const angleStep = TWO_PI / numOfVertices;
  const halfOfAngleStep = angleStep / 2;

  if (maxSpikeSize > maxRadius) {
    maxSpikeSize = maxRadius;
  }

  let nextAngle = Random.getNumber(0, TWO_PI);

  const vertices = Array.from({ length: numOfVertices }, () => {
    const angle = Random.getNumber(
      nextAngle - halfOfAngleStep,
      nextAngle + halfOfAngleStep
    );

    const gauss = clamp(Random.gauss(0.5, spikiness), 0, 1);
    const m = gauss * maxSpikeSize + (maxRadius - maxSpikeSize);

    const x = m * Math.cos(angle);
    const y = m * Math.sin(angle);

    nextAngle += angleStep;

    return [x, y] as Vector2Array;
  });

  return vertices;
};

const useAsteroidsSpawner = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();
  const asteroids = useRefValue(() => new Set<Asteroid>());

  const transformVertices = (
    vertices: Vector2Array[],
    position: Vector2Object,
    angle = 0
  ) => {
    const transformationMatrix = new DOMMatrix()
      .translateSelf(position.x, position.y)
      .rotateAxisAngleSelf(0, 0, 1, angle);

    return vertices.map((vertex) => {
      return new Vector2(vertex).transform(transformationMatrix).toArray();
    });
  };

  const spawn = () => {
    const { width, height } = canvasEl;
    const hw = width / 2;
    const hh = height / 2;
    const horizontal = Random.getBoolean();
    const maxRadius = Math.floor(Random.getNumber(30, 60));
    const maxX = hw + maxRadius / 2;
    const maxY = hh + maxRadius / 2;

    let x = 0;
    let y = 0;

    if (horizontal) {
      x = Random.pick(-maxX, maxX);
      y = Random.getNumber(-maxY, maxY);
    } else {
      x = Random.getNumber(-maxY, maxY);
      y = Random.pick(-maxY, maxY);
    }

    const position = new Vector2(x, y);
    const velocity = position.inverted.normalized.multiply(0.2);
    const initialVertices = generateAsteroidVertices({
      maxRadius,
      spikiness: 10,
      maxSpikeSize: 10,
      numOfVertices: 10
    });
    const vertices = transformVertices(initialVertices, position, 1);

    asteroids.add({
      position,
      velocity,
      radius: maxRadius,
      rotationSpeed: 0.1,
      angle: 0,
      vertices,
      initialVertices
    });
  };

  const asteroidsSpawnInterval = useGameInterval(1500, {
    shouldExecuteOnFirstCall: true
  });

  const updateAsteroids = (simulationTimeStep: number) => {
    const { width, height } = canvasEl;
    const hw = width / 2;
    const hh = height / 2;

    asteroids.forEach((asteroid) => {
      const hs = asteroid.radius / 2;
      const isOutside =
        asteroid.position.y > hh + hs ||
        asteroid.position.y < -(hh + hs) ||
        asteroid.position.x > hw + hs ||
        asteroid.position.x < -(hw + hs);

      if (isOutside) {
        asteroids.delete(asteroid);

        return;
      }

      asteroid.angle =
        (asteroid.angle + asteroid.rotationSpeed * simulationTimeStep) % 360;
      asteroid.position.add(asteroid.velocity.multipliedBy(simulationTimeStep));
      asteroid.vertices = transformVertices(
        asteroid.initialVertices,
        asteroid.position,
        asteroid.angle
      );
    });
  };

  const update = (simulationTimeStep: number) => {
    updateAsteroids(simulationTimeStep);

    asteroidsSpawnInterval.execute(spawn);
  };

  const drawAsteroid = ({ vertices }: Asteroid) => {
    ctx.beginPath();

    ctx.moveTo(vertices[0][0], vertices[0][1]);

    for (let i = 1; i < vertices.length; ++i) {
      const [x, y] = vertices[i];

      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#000';

    ctx.fill();
    ctx.stroke();
  };

  const render = () => {
    asteroids.forEach(drawAsteroid);
  };

  const reset = () => {
    asteroidsSpawnInterval.reset();
  };

  const stop = () => {
    asteroidsSpawnInterval.stop();
  };

  const start = () => {
    asteroidsSpawnInterval.start();
  };

  return {
    asteroids,
    spawn,
    render,
    update,
    reset,
    stop,
    start
  };
};

export default useAsteroidsSpawner;
