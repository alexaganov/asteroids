import Game from './Game';
import GameObject from './GameObject';
import Random from './Random';
import { clamp, TWO_PI } from './utils/math';
import Vector2 from './Vector2';

interface StarConfig {
  position: Vector2;
  size: number;
  alpha: number;
}

class Star extends GameObject {
  public position: Vector2;
  public size: number;
  public color: string;
  public alpha = 1;
  public alphaDir = 1;

  constructor(game: Game, { position, size, alpha }: StarConfig) {
    super(game);

    this.position = position.clone();
    this.size = size;
    this.alpha = alpha;
    this.color = `rgba(255, 255, 255, ${this.alpha})`;
  }

  update() {
    this.alpha = clamp(this.alpha + this.alphaDir * 0.008, 0.5, 1);
    this.color = `rgba(255, 255, 255, ${this.alpha})`;

    // console.log('a', this.alpha);

    if (this.alpha >= 1) {
      this.alphaDir = -1;
    } else if (this.alpha <= 0.5) {
      this.alphaDir = 1;
    }
  }

  render() {
    const { ctx } = this.game.renderer;

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size / 2, 0, TWO_PI);

    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

interface StarsBackgroundConfig {
  starsPerTile?: number;
  tileSize?: number;
  origin?: Vector2;
}

interface StarsBackgroundTileConfig {
  size: number;
  numberOfStars: number;
  position: Vector2;
}

class StarsBackgroundTile extends GameObject {
  public size = 200;
  public position = Vector2.zero;
  public numberOfStars = 50;
  public stars: Set<Star>;

  constructor(
    game: Game,
    { size, position, numberOfStars }: StarsBackgroundTileConfig
  ) {
    super(game);

    this.size = size;
    this.position = position;
    this.numberOfStars = numberOfStars;

    const start = Array.from({ length: numberOfStars }, () => {
      const size = Random.getInteger(2, 6);

      return new Star(game, {
        position: new Vector2(
          Random.getInteger(this.position.x, this.position.x + this.size),
          Random.getInteger(this.position.y, this.position.y + this.size)
        ),
        size,
        alpha: Random.getNumber(0.5, 1)
      });
    });

    this.stars = new Set(start);
  }

  update() {
    this.stars.forEach((star) => star.update());
  }

  render() {
    // const { ctx } = this.game.renderer;

    // const hs = this.size / 2;

    // ctx.rect(this.position.x, this.position.y, this.size, this.size);
    // ctx.strokeStyle = '#fff';
    // ctx.lineWidth = 1;
    // ctx.stroke();

    this.stars.forEach((star) => star.render());
  }
}

class StarsBackground extends GameObject {
  public tiles: Map<string, StarsBackgroundTile> = new Map();
  public disabledTiles: Map<string, StarsBackgroundTile> = new Map();
  public origin = Vector2.zero;
  public tileSize = 500;
  public starsPerTile = 10;

  constructor(
    game: Game,
    { starsPerTile = 5, tileSize = 500, origin }: StarsBackgroundConfig = {}
  ) {
    super(game);

    const { width, height } = game.renderer;

    this.tileSize = tileSize ?? this.tileSize;
    this.starsPerTile = starsPerTile ?? this.starsPerTile;
    this.origin = origin ?? this.origin;

    const hw = width / 2;
    const hh = height / 2;

    const tileOffsetX = tileSize - (hw % tileSize);
    const tileOffsetY = tileSize - (hh % tileSize);

    const start = this.origin
      .clone()
      .sub(new Vector2(hw + tileOffsetX, hh + tileOffsetY));
    const end = start.inverted;

    for (let y = start.y; y < end.y; y += tileSize) {
      for (let x = start.x; x < end.x; x += tileSize) {
        const tileY = Math.round(y / tileSize);
        const tileX = Math.round(x / tileSize);

        this.tiles.set(
          `${tileX},${tileY}`,
          new StarsBackgroundTile(game, {
            size: tileSize,
            numberOfStars: starsPerTile,
            position: new Vector2(tileX * tileSize, tileY * tileSize)
          })
        );
      }
    }
  }

  update() {
    const { width, height } = this.game.renderer;

    const hw = width / 2;
    const hh = height / 2;

    const tileOffsetX = this.tileSize - (hw % this.tileSize);
    const tileOffsetY = this.tileSize - (hh % this.tileSize);

    const start = this.origin
      .clone()
      .sub(new Vector2(hw + tileOffsetX, hh + tileOffsetY));
    const end = start.inverted;

    for (let y = start.y; y < end.y; y += this.tileSize) {
      for (let x = start.x; x < end.x; x += this.tileSize) {
        const tileY = Math.round(y / this.tileSize);
        const tileX = Math.round(x / this.tileSize);
        const key = `${tileX},${tileY}`;

        if (this.tiles.has(key)) {
          this.tiles.get(key)?.update();
        } else {
          this.tiles.set(
            key,
            new StarsBackgroundTile(this.game, {
              size: this.tileSize,
              numberOfStars: this.starsPerTile,
              position: new Vector2(
                tileX * this.tileSize,
                tileY * this.tileSize
              )
            })
          );
        }
      }
    }
  }

  render() {
    const { width, height } = this.game.renderer;

    const hw = width / 2;
    const hh = height / 2;

    const tileOffsetX = this.tileSize - (hw % this.tileSize);
    const tileOffsetY = this.tileSize - (hh % this.tileSize);

    const start = this.origin
      .clone()
      .sub(new Vector2(hw + tileOffsetX, hh + tileOffsetY));
    const end = start.inverted;

    for (let y = start.y; y < end.y; y += this.tileSize) {
      for (let x = start.x; x < end.x; x += this.tileSize) {
        const tileY = Math.round(y / this.tileSize);
        const tileX = Math.round(x / this.tileSize);
        const key = `${tileX},${tileY}`;

        this.tiles.get(key)?.render();
      }
    }
  }
}

export default StarsBackground;
