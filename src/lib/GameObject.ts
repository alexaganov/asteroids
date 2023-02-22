import Game from './Game';

abstract class GameObject {
  private _isActive = true;

  constructor(public game: Game) {}

  get isActive(): boolean {
    return this._isActive;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  init() {
    // not implemented
  }
  destroy() {
    // not implemented
  }
  update() {
    // not implemented
  }
  render() {
    // not implemented
  }
}

export default GameObject;
