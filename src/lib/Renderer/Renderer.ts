import RendererResizeObserver from './RendererResizeObserver';
import Size, { ISize } from '../Size';
import Vector2, { Vector2Object } from '../Vector2';
import RendererDraw from './RendererDraw';

export interface RendererOptions {
  dpr?: number;
}

class Renderer {
  public readonly ctx: CanvasRenderingContext2D;
  public readonly draw: RendererDraw;

  private _dpr = 1;
  private _lastSize!: Size;
  private _shouldUpdate = true;

  constructor(
    public readonly el: HTMLCanvasElement,
    options?: RendererOptions
  ) {
    const _options = {
      dpr: window.devicePixelRatio,
      ...options
    };

    this.ctx = this.el.getContext('2d')!;
    this._dpr = _options.dpr;
    this.draw = new RendererDraw(this);

    this._handleWindowResize = this._handleWindowResize.bind(this);

    this.init();
  }

  init() {
    this._lastSize = this.size;

    this.update();

    window.addEventListener('resize', this._handleWindowResize);
  }

  destroy() {
    window.addEventListener('resize', this._handleWindowResize);
  }

  private _handleWindowResize(): void {
    const size = this.size;

    if (!this._lastSize.isEqual(size)) {
      this._shouldUpdate = true;
      this._lastSize = size;
    }
  }

  updateOrigin() {
    const { x, y } = this.origin;

    this.ctx.translate(x, y);
    this.ctx.scale(this._dpr, this._dpr);
  }

  update(): void {
    if (this._shouldUpdate) {
      this.intrinsicSize = this._lastSize;

      this._shouldUpdate = false;

      this.updateOrigin();
    } else {
      this.clear();
    }
  }

  get origin(): Vector2Object {
    const { width, height } = this.intrinsicSize;

    return {
      x: width / 2,
      y: height / 2
    };
  }

  get boundary(): {
    start: Vector2Object;
    end: Vector2Object;
  } {
    const { width, height } = this.el;

    const x = width / 2;
    const y = height / 2;

    return {
      start: {
        x: -x,
        y: -y
      },
      end: {
        x,
        y
      }
    };
  }

  get dpr(): number {
    return this._dpr;
  }

  get size(): Size {
    return new Size(this.el.offsetWidth, this.el.offsetHeight);
  }

  get intrinsicSize(): Size {
    return new Size(this.el.width, this.el.height);
  }

  set intrinsicSize(size: number | ISize) {
    this.el.width = this._dpr * (typeof size === 'number' ? size : size.width);
    this.el.height =
      this._dpr * (typeof size === 'number' ? size : size.height);
  }

  get width(): number {
    return this.el.width;
  }

  get height(): number {
    return this.el.height;
  }

  get center(): Vector2Object {
    return {
      x: this.width / 2,
      y: this.height / 2
    };
  }

  clear(): void {
    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    this.ctx.restore();
  }

  background(color: string) {
    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      0,
      0,
      this.el.width * this.dpr,
      this.el.height * this.dpr
    );
    this.ctx.restore();
  }
}

export default Renderer;
