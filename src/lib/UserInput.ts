class UserInput {
  public readonly pressingKeys: {
    [key: string]: boolean;
  } = {};

  public readonly pressedKeys: {
    [key: string]: boolean;
  } = {};

  constructor() {
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);

    this.init();
  }

  public init() {
    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('keyup', this._handleKeyUp);
  }

  public destroy() {
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
  }

  // public createControls<Action extends string, Key extends string>(controls: {[key in Key]: Action}) {

  // }

  private _handleKeyDown(e: KeyboardEvent) {
    const wasPressed = this.pressingKeys[e.code];

    this.pressingKeys[e.code] = true;
    this.pressedKeys[e.code] = !wasPressed;
  }

  private _handleKeyUp(e: KeyboardEvent) {
    this.pressingKeys[e.code] = false;
    this.pressedKeys[e.code] = false;
    // e.preventDefault();
  }
}

export default UserInput;
