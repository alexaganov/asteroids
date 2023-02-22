import Game from './Game';
import GameObject from './GameObject';
import Random from './Random';
import { TWO_PI } from './utils/math';
import Vector2 from './Vector2';

class ExplosionParticle extends GameObject {
  public position: Vector2;
  public tailPosition: Vector2;
  public initialPosition: Vector2;
  public velocity: Vector2;
  public acceleration: Vector2;
  public alpha = 1;
  public size = 2;
  public length = 20;

  constructor(
    game: Game,
    { position, velocity }: { position: Vector2; velocity: Vector2 }
  ) {
    super(game);

    this.initialPosition = position.clone();
    this.position = this.initialPosition.clone();
    this.tailPosition = this.position.clone();
    this.velocity = velocity.clone();
    this.acceleration = this.velocity.normalized.inverted.multiply(1);
  }

  init() {
    //
  }

  destroy(): void {
    // destroy
  }

  update() {
    this.position.add(this.velocity);
    this.alpha -= 0.015;

    const tailLength = this.velocity.magnitude * 5;

    const tailPosition =
      this.position.distance(this.initialPosition) < tailLength
        ? this.initialPosition
        : this.position
            .clone()
            .sub(this.velocity.normalized.multiply(tailLength));

    this.tailPosition = tailPosition;
  }

  render() {
    const { ctx } = this.game.renderer;

    ctx.beginPath();

    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.tailPosition.x, this.tailPosition.y);

    // const distance = this.headPosition.distance(this.tailPosition);

    // const trailGradient = ctx.createLinearGradient(
    //   this.headPosition.x,
    //   this.headPosition.y,
    //   this.tailPosition.x,
    //   this.tailPosition.y
    // );

    // console.log(this.size / distance, distance);

    // trailGradient.addColorStop(0, '#f00');
    // trailGradient.addColorStop(this.size / distance, '#f00');
    // trailGradient.addColorStop(this.size / distance, '#FFA500');
    // trailGradient.addColorStop(1, '#ff0');

    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;

    ctx.stroke();
  }
}

class ExplosionEffect extends GameObject {
  public position!: Vector2;
  public particles!: Set<ExplosionParticle>;
  public disabledParticles: Set<ExplosionParticle> = new Set();
  public velocity!: Vector2;

  constructor(
    game: Game,
    {
      position,
      numberOfParticles = 10
    }: { position: Vector2; numberOfParticles?: number }
  ) {
    super(game);

    const maxAngle = 360 / numberOfParticles;

    this.position = position.clone();
    this.particles = new Set(
      Array.from({ length: numberOfParticles }, (_, i) => {
        const speed = Random.getInteger(5, 10);
        const velocity = Vector2.right
          .rotateBy(Random.getInteger(maxAngle * i, maxAngle * i + maxAngle))
          .multiply(speed);

        const position = this.position
          .clone()
          .add(velocity.normalized.multiply(10))
          .add(velocity.normalized.multiply(Random.getInteger(0, 30)));

        console.log('angle', velocity.angle);

        return new ExplosionParticle(game, {
          position,
          velocity
        });
      })
    );
  }

  init() {
    // init
  }

  reset({ position }: { position: Vector2 }) {
    this.position = position;
    const maxAngle = 360 / this.disabledParticles.size;
    this.particles = new Set(
      Array.from(this.disabledParticles, (particle, i) => {
        const velocity = Vector2.right
          .rotateBy(Random.getInteger(maxAngle * i, maxAngle * i + maxAngle))
          .multiply(Random.getInteger(4, 7));

        const position = this.position
          .clone()
          .add(velocity.normalized.multiply(20))
          .add(velocity.normalized.multiply(Random.getInteger(0, 30)));

        particle.alpha = 1;
        particle.position = position.clone();
        particle.velocity = velocity;

        return particle;
      })
    );

    this.disabledParticles = new Set();
  }

  destroy(): void {
    // destroy
  }

  update() {
    // update
    this.particles.forEach((particle) => {
      particle.update();

      if (particle.alpha <= 0) {
        this.particles.delete(particle);
        this.disabledParticles.add(particle);
      }
    });
  }

  render() {
    // render
    this.particles.forEach((particle) => {
      particle.render();
    });
  }
}

export default ExplosionEffect;
