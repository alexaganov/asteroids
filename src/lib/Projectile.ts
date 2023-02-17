import Game from './Game';
import GameObject from './GameObject';
import Vector2 from './Vector2';

class Projectile extends GameObject {
  private speed = 10;
  private size = 3;
  private initialPosition!: Vector2;
  private direction!: Vector2;
  public headPosition!: Vector2;
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
    this.headPosition = this.initialPosition.clone();
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
    this.headPosition = this.initialPosition.clone();
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
    this.headPosition.add(this.direction.clone().multiply(this.speed));

    const tailLengthVector = this.direction.inverted.multiply(this.speed);

    const tailPosition =
      this.headPosition.distance(this.initialPosition) <
      tailLengthVector.magnitude
        ? this.initialPosition
        : this.headPosition.clone().add(tailLengthVector);

    this.tailPosition = tailPosition;
  }

  render() {
    const { ctx } = this.game.renderer;

    ctx.beginPath();

    ctx.moveTo(this.headPosition.x, this.headPosition.y);
    ctx.lineTo(this.tailPosition.x, this.tailPosition.y);

    const distance = this.headPosition.distance(this.tailPosition);

    const trailGradient = ctx.createLinearGradient(
      this.headPosition.x,
      this.headPosition.y,
      this.tailPosition.x,
      this.tailPosition.y
    );

    console.log(this.size / distance, distance);

    trailGradient.addColorStop(0, '#f00');
    trailGradient.addColorStop(this.size / distance, '#f00');
    trailGradient.addColorStop(this.size / distance, '#FFA500');
    trailGradient.addColorStop(1, '#ff0');

    ctx.lineWidth = 2;
    ctx.strokeStyle = trailGradient;

    ctx.stroke();

    // ctx.beginPath();
    // ctx.arc(this.headPosition.x, this.headPosition.y, 10, 0, 2 * Math.PI);
    // ctx.fillStyle = 'red';
    // ctx.fill();
  }
}

export default Projectile;
