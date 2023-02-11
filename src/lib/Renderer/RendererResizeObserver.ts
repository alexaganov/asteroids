import Size from '@/lib/Size';
import Renderer from './Renderer';

class RendererResizeObserver {
  private _lastSize!: Size;
  private _shouldResize = true;

  constructor(public readonly _renderer: Renderer) {
    this._handleWindowResize = this._handleWindowResize.bind(this);

    this.init();
  }

  init() {
    this._lastSize = this._renderer.size;

    this.update();

    window.addEventListener('resize', this._handleWindowResize);
  }

  destroy() {
    window.removeEventListener('resize', this._handleWindowResize);
  }

  private _handleWindowResize(): void {
    const size = this._renderer.size;

    if (!this._lastSize.isEqual(size)) {
      this._shouldResize = true;
      this._lastSize = size;
    }
  }

  update(): void {
    if (this._shouldResize) {
      this._renderer.intrinsicSize = this._lastSize;
      this._shouldResize = false;
    } else {
      this._renderer.clear();
    }
  }
}

export default RendererResizeObserver;
