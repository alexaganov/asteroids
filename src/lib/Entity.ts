import Vector2 from './Vector2';

export interface IEntity {
  position: Vector2;

  draw(): void;
  update(): void;
}
