import { Vector2Object } from '@/lib/Vector2';

export const fixLinePosition = (position: number, lineWidth: number) => {
  const halfLineWidth = lineWidth / 2;
  const lineStart = position - halfLineWidth;
  const lineEnd = position + halfLineWidth;
  const offsetStart = Math.floor(lineStart) - lineStart;
  const offsetEnd = Math.ceil(lineEnd) - lineEnd;
  const offset =
    Math.abs(offsetStart) > Math.abs(offsetEnd) ? offsetEnd : offsetStart;

  return position + offset;
};

export const drawGrid = ({
  ctx,
  origin,
  position,
  width,
  height,
  size = 50,
  color = '#444',
  strokeWeight = 1
}: {
  position: Vector2Object;
  ctx: CanvasRenderingContext2D;
  origin: Vector2Object;
  width: number;
  height: number;
  size?: number;
  color?: string;
  strokeWeight?: number;
}) => {
  ctx.save();

  ctx.resetTransform();
  ctx.translate(origin.x, origin.y);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWeight;

  const hh = height / 2;
  const totalLinesByX = Math.floor(width / size);
  const centerLineX = (totalLinesByX * size) / 2;
  const lineOffsetX = (centerLineX - position.x) % size;
  const offsetX = centerLineX + lineOffsetX;

  for (let l = 0; l <= totalLinesByX; ++l) {
    const x = fixLinePosition(l * size - offsetX, strokeWeight);

    ctx.beginPath();

    ctx.moveTo(x, -hh);
    ctx.lineTo(x, hh);

    ctx.stroke();
  }

  const hw = width / 2;
  const totalLinesByY = Math.floor(height / size);
  const centerLineY = (totalLinesByY * size) / 2;
  const lineOffsetY = (centerLineY - position.y) % size;
  const offsetY = centerLineY + lineOffsetY;

  for (let l = 0; l <= totalLinesByY; ++l) {
    const y = fixLinePosition(l * size - offsetY, strokeWeight);

    ctx.beginPath();

    ctx.moveTo(-hw, y);
    ctx.lineTo(hw, y);

    ctx.stroke();
  }

  ctx.restore();
};

export const drawAxis = ({
  ctx,
  position,
  origin,
  width,
  height,
  lineWidth = 2
}: {
  position: Vector2Object;
  ctx: CanvasRenderingContext2D;
  origin: Vector2Object;
  width: number;
  height: number;
  size?: number;
  strokeWeight?: number;
  lineWidth?: number;
}) => {
  ctx.save();
  ctx.resetTransform();

  ctx.translate(origin.x, origin.y);
  ctx.lineWidth = lineWidth;

  // Draw vertical line
  let vx = position.x;

  if (position.x > width) {
    vx = position.x - width;
  } else if (position.x < 0) {
    vx = position.x - 0;
  }

  vx = fixLinePosition(vx, lineWidth);

  ctx.beginPath();

  const hh = height / 2;

  ctx.moveTo(vx, -hh);
  ctx.lineTo(vx, hh);

  ctx.strokeStyle = 'rgba(0, 255, 0)';
  ctx.stroke();

  // Draw horizontal line
  let hy = 0;

  if (position.y > width) {
    hy = position.y - width;
  } else if (position.y < 0) {
    hy = position.y - 0;
  }

  hy = fixLinePosition(hy, lineWidth);

  ctx.beginPath();

  const hw = width / 2;

  ctx.moveTo(-hw, hy);
  ctx.lineTo(hw, hy);

  ctx.strokeStyle = 'rgba(255, 0, 0)';
  ctx.stroke();
};
