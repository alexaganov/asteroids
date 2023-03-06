import { lerp } from '@/lib/gameEngine/core/utils/math';
import Vector2, { Vector2Array } from '@/lib/gameEngine/core/Vector2';
import { useGameLoopRender } from '@/lib/gameEngine/react/components/GameLoop';
import { useGameLoopEvent } from '@/lib/gameEngine/react/components/GameLoopProvider';
import { useRenderer2dContext } from '@/lib/gameEngine/react/components/Renderer';
import useRefValue from '@/lib/gameEngine/react/hooks/useRefValue';

const useSpaceship = () => {
  const ctx = useRenderer2dContext();
  const state = useRefValue(() => {
    const size = 100;
    const hs = size / 2;
    const initialVertices: Vector2Array[] = [
      [0, -hs],
      Vector2.right.multiply(hs).rotateBy(40).toArray(),
      [0, hs / 2],
      Vector2.left.multiply(hs).rotateBy(-40).toArray()
    ];

    return {
      isActive: true,
      angle: 90,
      lastAngle: 90,
      direction: Vector2.top,
      lastDirection: Vector2.top,
      rotationSpeed: 0.4,
      initialVertices,
      vertices: initialVertices,
      lastVertices: initialVertices,
      size,
      rotateDir: 0
    };
  });

  const transformVertices = (vertices: Vector2Array[], angle: number) => {
    const rotationMatrix = new DOMMatrix().rotateAxisAngle(0, 0, 1, angle);

    return vertices.map((vertex) => {
      return new Vector2(vertex).transform(rotationMatrix).toArray();
    });
  };

  const rotate = (dir: -1 | 0 | 1) => {
    state.rotateDir = dir;
  };

  const reset = () => {
    (state.vertices = state.initialVertices), (state.direction = Vector2.top);
  };

  const drawSpaceship = () => {
    const { vertices } = state;

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

  const update = (simulationTimeStep: number) => {
    state.lastAngle = state.angle;
    state.angle += state.rotateDir * state.rotationSpeed * simulationTimeStep;
    state.vertices = transformVertices(state.initialVertices, state.angle);
  };

  return {
    rotate,
    state,
    reset,
    update,
    render: drawSpaceship
  };
};

export default useSpaceship;
