import { clamp } from './utils/math';
import { MILLISECONDS_IN_SECOND } from './utils/time';

export type GameLoopRender = (gameLoop: GameLoop) => void;
export type GameLoopUpdate = (gameLoop: GameLoop) => void;

export interface GameLoopOptions {
  fps?: number;
  scale?: number;
  render: GameLoopRender;
  update: GameLoopUpdate;
}

class GameLoop {
  static readonly DEFAULT_FPS = 60;

  private _rafId = -1;
  private _fps: number = GameLoop.DEFAULT_FPS;
  private _mspf: number = 1 / this._fps;
  private _scale = 1;
  private _scaledFrameInterval: number = this._scale * this._mspf;

  // TODO: подобрать более подходящее название
  private _delta = 0;
  private _last?: number;

  private _render: GameLoopRender;
  private _update: GameLoopRender;
  private isPaused = false;

  constructor({ fps, scale, render, update }: GameLoopOptions) {
    if (typeof fps === 'number') {
      this.fps = fps;
    }

    if (typeof scale === 'number') {
      this.scale = scale;
    }

    this._frame = this._frame.bind(this);
    this._render = render;
    this._update = update;

    this.init();
  }

  public init() {
    this._rafId = requestAnimationFrame(this._frame);
  }

  public get fps(): number {
    return this._fps;
  }

  public set fps(value: number) {
    this._fps = clamp(value, 0, 240);
    this._mspf = 1 / this._fps;
    this._scaledFrameInterval = this._scale * this._mspf;
  }

  public get mspf() {
    return this._mspf;
  }

  public get scale(): number {
    return this._scale;
  }

  public set scale(value: number) {
    if (value < 0) {
      value = 0;
    }

    this._scale = value;
    this._scaledFrameInterval = this._scale * this._mspf;
  }

  // fixed updates
  private _frame(timestamp: number) {
    const now = timestamp;
    const last = this._last ?? now;
    const delta = Math.min(
      (now - last) / MILLISECONDS_IN_SECOND,
      1 // минимальная задержка 1 секунда на случай если вкладка была переключена
    );

    this._delta += delta;

    while (
      this._delta > this._scaledFrameInterval &&
      this._scaledFrameInterval > 0
    ) {
      this._delta -= this._scaledFrameInterval;

      this._update(this);
    }

    this._render(this);

    this._last = now;
    this._rafId = requestAnimationFrame(this._frame);
  }

  public destroy() {
    cancelAnimationFrame(this._rafId);
  }
}

export default GameLoop;
