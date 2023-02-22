import Asteroid from './Asteroid';
import GameLoop from './GameLoop';
import OldMainScene from './OldMainScene';
import MainScene from './MainScene';
import Matrix2D from './Matrix2D';
import Random from './Random';
import Renderer from './Renderer/Renderer';
import Scene from './Scene';
import Shape2D from './Shape2D';
import Size from './Size';
import UserInput from './UserInput';
import { DEGREES_TO_RADIANS, TWO_PI } from './utils/math';
import Vector2 from './Vector2';

/**
 * const game = createGame(GameAsteroids);
 * const gameScene = createGameScene(game, SceneClass);
 * createGameEntity()
 */

class Game {
  public readonly renderer: Renderer;
  public readonly gameLoop: GameLoop;
  public readonly userInput: UserInput;
  public scene: MainScene;

  constructor(
    public readonly canvasEl: HTMLCanvasElement,
    {
      onGameOver,
      onScore
    }: { onGameOver: () => void; onScore: (score: number) => void }
  ) {
    this._update = this._update.bind(this);
    this._render = this._render.bind(this);

    this.renderer = new Renderer(canvasEl);
    this.userInput = new UserInput();
    this.gameLoop = new GameLoop({
      update: this._update,
      render: this._render
    });

    this.scene = new MainScene(this, { onGameOver, onScore });

    this.init();
  }

  init() {
    this.scene.init();
  }

  destroy() {
    this.gameLoop.destroy();
    this.renderer.destroy();
    this.userInput.destroy();
    this.scene.destroy();
  }

  start() {
    this.scene.start();
  }

  reset() {
    this.scene.reset();
  }

  private _update() {
    this.scene.update();
  }

  private _render() {
    this.renderer.update();

    this.scene.render();
  }
}

export default Game;
