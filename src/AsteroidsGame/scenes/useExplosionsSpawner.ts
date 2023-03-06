import Random from '@/lib/gameEngine/core/Random';
import { clamp, lerp } from '@/lib/gameEngine/core/utils/math';
import Vector2 from '@/lib/gameEngine/core/Vector2';
import { useRenderer2dContext } from '@/lib/gameEngine/react/components/Renderer';
import useRefValue from '@/lib/gameEngine/react/hooks/useRefValue';

interface ExplosionParticle {
  velocity: Vector2;
  position: Vector2;
  initialPosition: Vector2;
  tailScale: number;
}

interface Explosion {
  particles: ExplosionParticle[];
  alpha: number;
  startTimestamp: number;
}

const useExplosionsSpawner = () => {
  const ctx = useRenderer2dContext();
  const explosions = useRefValue(() => new Set<Explosion>());

  const spawn = ({
    position,
    tailScale = 30,
    numberOfParticles = 10
  }: {
    position: Vector2;
    tailScale?: number;
    numberOfParticles?: number;
  }) => {
    const angleStep = 360 / numberOfParticles;

    const particles = Array.from({ length: numberOfParticles }, (_, i) => {
      const speed = Random.getNumber(0.2, 0.8);
      const velocity = Vector2.right
        .rotateBy(Random.getInteger(angleStep * i, angleStep * i + angleStep))
        .multiply(speed);
      const particlePosition = position
        .clone()
        .add(velocity.normalized.multiply(Random.getInteger(10, 30)));

      return {
        initialPosition: position.clone(),
        position: particlePosition,
        tailScale,
        velocity
      } as ExplosionParticle;
    });

    explosions.add({
      particles,
      alpha: 1,
      startTimestamp: performance.now()
    });
  };

  const update = (simulationTimeStep: number) => {
    explosions.forEach((explosion) => {
      if (explosion.alpha <= 0) {
        explosions.delete(explosion);

        return;
      }

      explosion.alpha -= 0.002 * simulationTimeStep;

      explosion.particles.forEach((particle) => {
        particle.position.add(
          particle.velocity.multipliedBy(simulationTimeStep)
        );
      });
    });
  };

  const drawExplosion = (explosion: Explosion) => {
    explosion.particles.forEach(
      ({ position, initialPosition, velocity, tailScale }) => {
        ctx.beginPath();

        const tailLength = velocity.length * tailScale;
        const tailPosition =
          position.distance(initialPosition) < tailLength
            ? initialPosition
            : position.clone().sub(velocity.normalized.multiply(tailLength));

        ctx.moveTo(position.x, position.y);
        ctx.lineTo(tailPosition.x, tailPosition.y);

        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${explosion.alpha})`;

        ctx.stroke();
      }
    );
  };

  const render = () => {
    explosions.forEach(drawExplosion);
  };

  return {
    spawn,
    explosions,
    render,
    update
  };
};

export default useExplosionsSpawner;
