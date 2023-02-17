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

  abstract init(): void;
  abstract destroy(): void;
  abstract update(): void;
  abstract render(): void;
}

export default GameObject;
