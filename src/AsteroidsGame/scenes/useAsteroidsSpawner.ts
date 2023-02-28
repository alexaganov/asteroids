import {
  useGameLoopRender,
  useGameLoopUpdate
} from '@/lib/engine/components/GameLoop';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/engine/components/Renderer';
import useRefValue from '@/lib/engine/hooks/useRefValue';
import Random from '@/lib/Random';
import { clamp, TWO_PI } from '@/lib/utils/math';
import Vector2, { Vector2Array, Vector2Object } from '@/lib/Vector2';

interface Asteroid {
  position: Vector2;
  velocity: Vector2;
  vertices: Vector2Array[];
  initialVertices: Vector2Array[];
  rotationSpeed: number;
  angle: number;
  radius: number;
}

const useInterval = (interval: number) => {
  const state = useRefValue(() => {
    return {
      lastInterval: 0
    };
  });

  return (cb: () => void) => {
    const now = performance.now();
    const isIntervalPassed = now > state.lastInterval;

    if (isIntervalPassed) {
      cb();

      state.lastInterval = now + interval;
    }
  };
};

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
  const eachSecond = useInterval(1000);
  const spawnConfig = useRefValue(() => {
    return {
      isEnabled: true,
      spawnInterval: 1000,
      lastSpawnTimestamp: 0
    };
  });

  const enable = () => {
    spawnConfig.isEnabled = true;
  };

  const disable = () => {
    spawnConfig.isEnabled = false;
  };

  const isEnabled = () => {
    return spawnConfig.isEnabled;
  };

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
    const velocity = position.inverted.normalized.multiply(1);
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
      rotationSpeed: 0,
      angle: 0,
      vertices,
      initialVertices
    });
  };

  useGameLoopUpdate(() => {
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

      asteroid.angle = (asteroid.angle + asteroid.rotationSpeed) % 360;
      asteroid.position.add(asteroid.velocity);
      asteroid.vertices = transformVertices(
        asteroid.initialVertices,
        asteroid.position,
        asteroid.angle
      );
    });

    if (spawnConfig.isEnabled) {
      eachSecond(() => {
        spawn();
      });
    } else {
      spawnConfig.lastSpawnTimestamp = 0;
    }
  });

  useGameLoopRender(() => {
    asteroids.forEach(({ vertices }) => {
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
    });
  });

  return {
    disable,
    enable,
    isEnabled,
    asteroids
  };
};

export default useAsteroidsSpawner;
