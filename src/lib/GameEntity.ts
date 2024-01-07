import Game from './Game';
import GameObject from './GameObject';
import Matrix2D from './Matrix2D';
import Vector2, { Vector2Like, Vector2Object } from './gameEngine/core/Vector2';

abstract class GameEntity extends GameObject {
  public transform = new Matrix2D();
}

export default GameEntity;
