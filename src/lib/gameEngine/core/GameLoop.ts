export interface GameLoopEvents {
  begin: (timestamp: number, frameDelta: number) => void;
  update: (simulationTimeStep: number) => void;
  render: (interpolation: number) => void;
  end: (fsp: number, panic: boolean) => void;
}

// https://github.com/IceCreamYou/MainLoop.js/blob/gh-pages/src/mainloop.js
class GameLoop {
  private _simulationTimeStep = 1000 / 60;
  private frameDelta = 0;
  private lastFrameTimeMs = 0;
  private _fps = 60;
  private fpsAlpha = 0.9;
  private fpsUpdateInterval = 1000;
  private lastFpsUpdate = 0;

  private framesSinceLastFpsUpdate = 0;
  private numUpdateSteps = 0;
  private minFrameDelay = 0;
  private running = false;
  private paused = false;
  private started = false;
  private panic = false;

  private rafId = -1;
  private subscriptions: {
    [key in keyof GameLoopEvents]?: Set<GameLoopEvents[key]>;
  } = {};

  constructor() {
    this.tick = this.tick.bind(this);
  }

  on<E extends keyof GameLoopEvents>(event: E, cb: GameLoopEvents[E]) {
    if (!this.subscriptions[event]) {
      //@ts-ignore
      this.subscriptions[event] = new Set();
    }

    this.subscriptions[event]?.add(cb);
  }

  off<E extends keyof GameLoopEvents>(event: E, cb: GameLoopEvents[E]) {
    if (!this.subscriptions[event]) {
      return;
    }

    this.subscriptions[event]?.delete(cb);
  }

  emit<E extends keyof GameLoopEvents>(
    event: E,
    params: Parameters<GameLoopEvents[E]>
  ) {
    if (!this.subscriptions[event]) {
      return;
    }

    //@ts-ignore
    this.subscriptions[event]?.forEach((cb) => cb(...params));
  }

  get simulationTimeStep() {
    return this._simulationTimeStep;
  }

  set simulationTimeStep(timeStep: number) {
    this._simulationTimeStep = timeStep;
  }

  get fsp() {
    return this._fps;
  }

  get maxAllowedFps() {
    return 1000 / this.minFrameDelay;
  }

  set maxAllowedFps(fps: number) {
    if (fps <= 0) {
      this.stop();
    } else {
      this.minFrameDelay = 1000 / fps;
    }
  }

  resetFrameDelta() {
    const oldFrameDelta = this.frameDelta;

    this.frameDelta = 0;

    return oldFrameDelta;
  }

  start() {
    if (this.started) {
      return this;
    }

    this.started = true;

    this.rafId = requestAnimationFrame((timestamp: number) => {
      this.emit('render', [1]);

      this.running = true;

      this.lastFrameTimeMs = timestamp;
      this.lastFpsUpdate = timestamp;
      this.framesSinceLastFpsUpdate = 0;
      this.rafId = requestAnimationFrame(this.tick);
    });

    return this;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  stop() {
    this.running = false;
    this.started = false;

    cancelAnimationFrame(this.rafId);

    return this;
  }

  updateFps(timestamp: number) {
    if (timestamp > this.lastFpsUpdate + this.fpsUpdateInterval) {
      this._fps =
        (this.fpsAlpha * this.framesSinceLastFpsUpdate * 1000) /
          (timestamp - this.lastFpsUpdate) +
        (1 - this.fpsAlpha) * this._fps;
    }
  }

  tick(timestamp: number) {
    this.rafId = requestAnimationFrame(this.tick);

    if (timestamp < this.lastFrameTimeMs + this.minFrameDelay) {
      return;
    }

    this.frameDelta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;

    this.emit('begin', [timestamp, this.frameDelta]);

    this.updateFps(timestamp);

    this.framesSinceLastFpsUpdate++;

    this.numUpdateSteps = 0;

    while (this.frameDelta >= this.simulationTimeStep) {
      this.frameDelta -= this.simulationTimeStep;

      if (!this.paused) {
        this.emit('update', [this.simulationTimeStep]);
      }

      if (++this.numUpdateSteps >= 240) {
        this.panic = true;
        break;
      }
    }

    this.emit('render', [this.frameDelta / this.simulationTimeStep]);
    this.emit('end', [this._fps, this.panic]);

    this.panic = false;
  }
}

export const createGameLoop = () => {
  return new GameLoop();
};

export default GameLoop;
