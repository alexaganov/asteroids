class RigidShape {
  constructor(public center: number, public angle: number = 0) {}
}

export class Rectangle extends RigidShape {
  constructor(center: number, public width: number, public height: number) {
    super(center);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // ctx.save();
    // ctx.translate();
  }
}

export default RigidShape;
