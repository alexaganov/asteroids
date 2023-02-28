import { useGameLoopRender } from '@/lib/engine/components/GameLoop';
import { useRenderer2dContext } from '@/lib/engine/components/Renderer';
import useRefValue from '@/lib/engine/hooks/useRefValue';
import Vector2, { Vector2Array } from '@/lib/Vector2';

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
      direction: Vector2.top,
      rotationSpeed: 2,
      initialVertices,
      vertices: initialVertices
    };
  });

  useGameLoopRender(() => {
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
  });

  const transformVertices = (vertices: Vector2Array[], angle: number) => {
    const rotationMatrix = new DOMMatrix().rotateAxisAngle(0, 0, 1, angle);

    return vertices.map((vertex) => {
      return new Vector2(vertex).transform(rotationMatrix).toArray();
    });
  };

  const rotate = (dir: -1 | 0 | 1) => {
    state.direction.rotateBy(dir * state.rotationSpeed);

    state.vertices = transformVertices(
      state.initialVertices,
      state.direction.angle
    );
  };

  return {
    rotate,
    state
  };
};

export default useSpaceship;
