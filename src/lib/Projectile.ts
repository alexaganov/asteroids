import Game from './Game';
import GameObject from './GameObject';
import Vector2 from './gameEngine/core/Vector2';

class Projectile extends GameObject {
  private speed = 10;
  public size = 3;
  private initialPosition!: Vector2;
  private direction!: Vector2;
  public position!: Vector2;
  public tailPosition!: Vector2;

  constructor(
    game: Game,
    {
      position = Vector2.zero,
      direction = Vector2.top,
      speed
    }: { position?: Vector2; direction?: Vector2; speed?: number } = {}
  ) {
    super(game);

    this.initialPosition = position.clone();
    this.position = this.initialPosition.clone();
    this.tailPosition = this.initialPosition.clone();
    this.direction = direction.normalized;
    this.speed = speed ?? this.speed;
  }

  reset({
    position,
    direction,
    speed
  }: {
    position?: Vector2;
    direction?: Vector2;
    speed?: number;
  } = {}) {
    this.initialPosition = position ? position.clone() : this.initialPosition;
    this.position = this.initialPosition.clone();
    this.tailPosition = this.initialPosition.clone();
    this.direction = direction ? direction.normalized : this.direction;
    this.speed = speed ?? this.speed;
  }

  destroy(): void {
    // do nothing
  }

  init(): void {
    // do nothing
  }

  update() {
    this.position.add(this.direction.clone().multiply(this.speed));

    const tailLengthVector = this.direction.inverted.multiply(this.speed);

    const tailPosition =
      this.position.distance(this.initialPosition) < tailLengthVector.magnitude
        ? this.initialPosition
        : this.position.clone().add(tailLengthVector);

    this.tailPosition = tailPosition;
  }

  render() {
    const { ctx } = this.game.renderer;

    // ctx.beginPath();

    // ctx.moveTo(this.position.x, this.position.y);
    // ctx.lineTo(this.tailPosition.x, this.tailPosition.y);

    // const distance = this.position.distance(this.tailPosition);

    // const trailGradient = ctx.createLinearGradient(
    //   this.position.x,
    //   this.position.y,
    //   this.tailPosition.x,
    //   this.tailPosition.y
    // );

    // // console.log(this.size / distance, distance);

    // trailGradient.addColorStop(0, '#f00');
    // trailGradient.addColorStop(this.size / distance, '#f00');
    // trailGradient.addColorStop(this.size / distance, '#FFA500');
    // trailGradient.addColorStop(1, '#ff0');

    // ctx.lineWidth = 2;
    // ctx.strokeStyle = trailGradient;

    // ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f0';
    ctx.fill();
  }
}

export default Projectile;
