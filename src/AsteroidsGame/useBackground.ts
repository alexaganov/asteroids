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
import useRefValue from '@/lib/gameEngine/react/hooks/useRefValue';

interface BackgroundStar {
  position: Vector2;
  alpha: number;
  alphaDir?: number;
  size: number;
}

interface BackgroundTile {
  position: Vector2;
  stars: BackgroundStar[];
}

const config = {
  tileSize: 500,
  numberOfStarsPerTile: 5,
  minStarSize: 2,
  maxStarSize: 6,
  minStarAlpha: 0.5,
  maxStarAlpha: 1
};

const generateStars = (
  numberOfStars: number,
  start: Vector2Object,
  end: Vector2Object
) => {
  return Array.from({ length: numberOfStars }, () => {
    return {
      position: new Vector2(
        Random.getInteger(start.x, end.x),
        Random.getInteger(start.y, end.y)
      ),
      size: Random.getInteger(config.minStarSize, config.maxStarSize),
      alpha: Random.getNumber(config.minStarAlpha, config.maxStarAlpha)
    } as BackgroundStar;
  });
};

const getTileKey = (tileX: number, tileY: number) => {
  return `${tileX},${tileY}`;
};

const createTile = (tileX: number, tileY: number): BackgroundTile => {
  const position = new Vector2(
    tileX * config.tileSize,
    tileY * config.tileSize
  );

  return {
    position,
    stars: generateStars(config.numberOfStarsPerTile, position, {
      x: position.x + config.tileSize,
      y: position.y + config.tileSize
    })
  };
};

function* getTilesPositionsGenerator({
  width,
  height,
  tileSize,
  origin = Vector2.zero
}: {
  width: number;
  height: number;
  tileSize: number;
  origin?: Vector2;
}) {
  const hw = width / 2;
  const hh = height / 2;

  const tileOffsetX = tileSize - (hw % tileSize);
  const tileOffsetY = tileSize - (hh % tileSize);

  const start = origin.sub(new Vector2(hw + tileOffsetX, hh + tileOffsetY));
  const end = start.inverted;

  for (let y = start.y; y < end.y; y += tileSize) {
    for (let x = start.x; x < end.x; x += tileSize) {
      const tileX = Math.round(x / tileSize);
      const tileY = Math.round(y / tileSize);

      yield [tileX, tileY] as Vector2Array;
    }
  }
}

const useBackground = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();
  const tiles = useRefValue(() => {
    const result = new Map<string, BackgroundTile>();
    const tilesGenerator = getTilesPositionsGenerator({
      width: canvasEl.width,
      height: canvasEl.height,
      tileSize: config.tileSize
    });

    for (const [tileX, tileY] of tilesGenerator) {
      const key = getTileKey(tileX, tileY);

      result.set(key, createTile(tileX, tileY));
    }

    return result;
  });

  const eachTilePosition = (cb: (tileX: number, tileY: number) => void) => {
    const tilesGenerator = getTilesPositionsGenerator({
      width: canvasEl.width,
      height: canvasEl.height,
      tileSize: config.tileSize
    });

    for (const tilePosition of tilesGenerator) {
      cb(...tilePosition);
    }
  };

  const drawStar = (star: BackgroundStar) => {
    ctx.beginPath();
    ctx.arc(star.position.x, star.position.y, star.size / 2, 0, TWO_PI);

    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();
  };

  const drawTile = (tileX: number, tileY: number) => {
    const key = `${tileX},${tileY}`;
    const tile = tiles.get(key);

    if (tile) {
      ctx.beginPath();

      ctx.rect(
        tile.position.x,
        tile.position.y,
        config.tileSize,
        config.tileSize
      );
      ctx.lineWidth = 0.2;

      ctx.strokeStyle = '#0f0';
      ctx.stroke();

      tile.stars.forEach(drawStar);
    }
  };

  const update = (simulatedTimeStep: number) => {
    eachTilePosition((tileX, tileY) => {
      const key = getTileKey(tileX, tileY);
      const tile = tiles.get(key);

      if (tile) {
        tile.stars.forEach((star) => {
          star.alpha = clamp(
            star.alpha + (star.alphaDir || 1) * 0.0005 * simulatedTimeStep,
            0.5,
            1
          );

          if (star.alpha >= 1) {
            star.alphaDir = -1;
          } else if (star.alpha <= 0.5) {
            star.alphaDir = 1;
          }
        });
      } else {
        tiles.set(key, createTile(tileX, tileY));
      }
    });
  };

  const render = () => {
    eachTilePosition(drawTile);
  };

  return {
    update,
    render
  };
};

export default useBackground;
