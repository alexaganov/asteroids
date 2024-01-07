import Size, { ISize } from '@/lib/Size';
import {
  countDigits,
  DEGREES_TO_RADIANS
} from '@/lib/gameEngine/core/utils/math';
import Vector2, {
  Vector2Like,
  Vector2Object
} from '@/lib/gameEngine/core/Vector2';
import Renderer from './Renderer';

interface DrawShapeStyle {
  fill?: string;
  stroke?: {
    color?: string;
    width?: number;
  };
}

interface StrokeConfig {
  fill?: string;
  width?: number;
}

interface FillConfig {
  style?: string;
}

interface DrawLine {
  (): void;
  (xAndY: number): void;
  (v: Vector2Object | [number, number]): void;
  (x: number, y: number): void;
  (x?: number | Vector2Object | [number, number], y?: number): void;
}

interface IRendererDraw {
  moveTo: DrawLine;
  lineTo: DrawLine;
}

const DEFAULT_STROKE_CONFIG: Readonly<Required<StrokeConfig>> = {
  width: 1,
  fill: '#000'
};

const DEFAULT_FILL_CONFIG: Readonly<Required<FillConfig>> = {
  style: '#000'
};

class RendererDraw implements IRendererDraw {
  private readonly _renderer: Renderer;

  constructor(renderer: Renderer) {
    this._renderer = renderer;
  }

  applyStyles(
    styles: DrawShapeStyle = { fill: '#000' },
    draw: (drawer: RendererDraw) => void
  ) {
    this._renderer.ctx.save();

    draw(this);

    if (styles.fill) {
      this._renderer.ctx.fillStyle = styles.fill;
      this._renderer.ctx.fill();
    }

    if (styles.stroke) {
      const { color, width } = styles.stroke;

      if (color) {
        this._renderer.ctx.strokeStyle = color;
      }

      if (width) {
        this._renderer.ctx.lineWidth = width;
      }

      this._renderer.ctx.stroke();
    }

    this._renderer.ctx.restore();
  }

  polygon(points: Vector2Object[], styles?: DrawShapeStyle) {
    const drawPolygon = () => {
      this._renderer.ctx.beginPath();
      this.moveTo(points[0]);

      for (let i = 1; i < points.length; ++i) {
        this.lineTo(points[i]);
      }

      this._renderer.ctx.closePath();
    };

    this.applyStyles(styles, drawPolygon);
  }

  moveTo(x?: number | Vector2Object | [number, number], y?: number): void {
    [x, y] = this.toPoint(x, y);

    this._renderer.ctx.moveTo(x, y);
  }

  toPoint(
    x: number | Vector2Object | [number, number] | undefined,
    y?: number | undefined
  ): [number, number] {
    if (Array.isArray(x)) {
      [x, y] = x;
    } else if (typeof x === 'number') {
      y = typeof y === 'number' ? y : x;
    } else if (Vector2.isVector2Like(x)) {
      ({ x, y } = x);
    } else {
      y = 0;
      x = 0;
    }

    return [+x.toFixed(2), +y.toFixed(2)];
  }

  lineTo(x?: number | Vector2Object | [number, number], y?: number) {
    [x, y] = this.toPoint(x, y);

    this._renderer.ctx.lineTo(x, y);
  }

  grid(
    center: Vector2,
    size: number,
    {
      opacity = 0.2,
      color = '#000'
    }: {
      opacity?: number;
      color?: string;
    } = { opacity: 0.2, color: '#000' }
  ) {
    const { origin, height, width } = this._renderer;
    const { start, end } = this._renderer.boundary;

    this._renderer.ctx.save();
    this._renderer.ctx.globalAlpha = opacity;

    const numOfLinesByX = Math.floor(width / size);

    const startX = (numOfLinesByX * size) / 2;
    const lineOffsetX = (center.x - startX) % size;
    const offsetX = startX + lineOffsetX - center.x;

    for (let l = 0; l <= numOfLinesByX; ++l) {
      const y = center.y - origin.y;
      const x = l * size - offsetX;

      this.verticalLine([x, y], height, {
        style: {
          fill: color
        }
        // fixPxBoundary: true
      });
    }

    // console.log(origin.x, origin.y);

    const numOfLinesByY = Math.floor(height / size);
    const startY = (numOfLinesByY * size) / 2;
    const lineOffsetY = (center.y - startY) % size;
    const offsetY = startY + lineOffsetY - center.y;

    const x = center.x - origin.x;

    for (let l = 0; l <= numOfLinesByY; ++l) {
      const y = l * size - offsetY;

      this.horizontalLine([x, y], width, {
        style: {
          fill: color
        }
        // fixPxBoundary: true
      });
    }

    this._renderer.ctx.restore();
  }

  line(
    start: Vector2Like,
    end: Vector2Like,
    {
      style = DEFAULT_STROKE_CONFIG,
      fixPxBoundary
    }: {
      style?: StrokeConfig;
      fixPxBoundary?: boolean;
    } = {
      style: DEFAULT_STROKE_CONFIG
    }
  ) {
    start = Vector2.toObject(start);
    end = Vector2.toObject(end);

    if (fixPxBoundary) {
      const lineWidth =
        style && style.width ? style.width : DEFAULT_STROKE_CONFIG.width;

      start = {
        x: this.fixLineWidthBoundaryMismatch(start.x, lineWidth),
        y: this.fixLineWidthBoundaryMismatch(start.y, lineWidth)
      };

      end = {
        x: this.fixLineWidthBoundaryMismatch(end.x, lineWidth),
        y: this.fixLineWidthBoundaryMismatch(end.y, lineWidth)
      };
    }

    this.path([start, end]);

    this.stroke(style);
  }

  verticalLine(
    position: Vector2Like,
    length: number,
    config: {
      style?: StrokeConfig;
      fixPxBoundary?: boolean;
    } = {}
  ) {
    const { x, y } = Vector2.toObject(position);

    this.line([x, y], [x, y + length], config);
  }

  horizontalLine(
    position: Vector2Like,
    length: number,
    config: {
      style?: StrokeConfig;
      fixPxBoundary?: boolean;
    } = {}
  ) {
    const { x, y } = Vector2.toObject(position);

    this.line([x, y], [x + length, y], config);
  }

  stroke({
    width = DEFAULT_STROKE_CONFIG.width,
    fill = DEFAULT_STROKE_CONFIG.fill
  }: StrokeConfig = DEFAULT_STROKE_CONFIG) {
    const { ctx } = this._renderer;

    ctx.save();
    ctx.strokeStyle = fill;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }

  fill({
    style = DEFAULT_FILL_CONFIG.style
  }: FillConfig = DEFAULT_FILL_CONFIG) {
    const { ctx } = this._renderer;

    ctx.save();
    ctx.fillStyle = style;
    ctx.fill();
    ctx.restore();
  }

  roundPx(px: number) {
    return Math.round(px / 0.5) * 0.5;
  }

  startPath(moveTo?: number | Vector2Like) {
    this._renderer.ctx.beginPath();

    if (moveTo) {
      this.moveTo(moveTo);
    }
  }

  endPath() {
    this._renderer.ctx.closePath();
  }

  path(points: ([number, number] | Vector2Object)[]): void;
  path(draw: (draw: RendererDraw) => void): void;
  path(
    pointsOrCb:
      | ((draw: RendererDraw) => void)
      | ([number, number] | Vector2Object)[]
  ) {
    const { ctx } = this._renderer;
    ctx.beginPath();

    if (Array.isArray(pointsOrCb)) {
      this.moveTo(pointsOrCb[0]);

      for (let i = 1; i < pointsOrCb.length; ++i) {
        this.lineTo(pointsOrCb[i]);
      }
    } else {
      pointsOrCb(this);
    }

    ctx.closePath();
  }

  fixLineWidthBoundaryMismatch(px: number, lineWidth: number) {
    const halfLineWidth = lineWidth / 2;
    const start = px - halfLineWidth;
    const end = px + halfLineWidth;
    const fixStart = Math.floor(start) - start;
    const fixEnd = Math.ceil(end) - end;
    const fix = Math.abs(fixStart) > Math.abs(fixEnd) ? fixEnd : fixStart;

    return px + fix;
  }

  fixPxBoundaryMismatch(px: number, lineWidth?: number) {
    // const strokeWidthHalf = strokeWidth / 2;
    // const startStrokeX = num - strokeWidthHalf;
    // const endStrokeX = num + strokeWidthHalf;
    // const startXFloored = Math.floor(startStrokeX);
    // const endXCeiled = Math.ceil(endStrokeX);
    // const fixLeft = startXFloored - startStrokeX;
    // const fixRight = endXCeiled - endStrokeX;
    // // x += ((Math.ceil(endStrokeX) - Math.floor(startStrokeX)) - strokeWidth) / 2
    // const fix = Math.abs(fixLeft) > Math.abs(fixRight) ? fixRight : fixLeft;// (Math.ceil(endStrokeX) - endStrokeX);
  }

  fixNum(num: number) {
    const strokeWidth = 4; //this._renderer.ctx.lineWidth;

    // console.log(strokeWidth);
    const strokeWidthHalf = strokeWidth / 2;
    const startStrokeX = num - strokeWidthHalf;
    const endStrokeX = num + strokeWidthHalf;
    const startXFloored = Math.floor(startStrokeX);
    const endXCeiled = Math.ceil(endStrokeX);

    const fixLeft = startXFloored - startStrokeX;
    const fixRight = endXCeiled - endStrokeX;

    // x += ((Math.ceil(endStrokeX) - Math.floor(startStrokeX)) - strokeWidth) / 2
    const fix = Math.abs(fixLeft) > Math.abs(fixRight) ? fixRight : fixLeft; // (Math.ceil(endStrokeX) - endStrokeX);

    return num; //+ fix;
  }

  arc(
    position: Vector2Object,
    radius: number,
    startAngleInDegrees = 0,
    engAngleInDegrees = 360
  ) {
    this._renderer.ctx.arc(
      position.x,
      position.y,
      radius,
      startAngleInDegrees * DEGREES_TO_RADIANS,
      engAngleInDegrees * DEGREES_TO_RADIANS
    );
  }

  circle(position: Vector2Object, radius: number) {
    const { ctx } = this._renderer;

    ctx.beginPath();
    this.arc(position, radius);
    ctx.closePath();
  }

  rect(position: Vector2Object, size: ISize) {
    this._renderer.ctx.rect(position.x, position.y, size.width, size.height);
  }
}

export default RendererDraw;
