export interface ISize {
  width: number;
  height: number;
}

class Size implements ISize {
  public width = 0;
  public height = 0;

  constructor();
  constructor(size: number | ISize);
  constructor(width: number, height: number);
  constructor(...args: any[]) {
    if (args.length === 1) {
      this.set(args[0]);
    } else if (args.length === 2) {
      this.set(args[0], args[1]);
    }
  }

  public set(size: number | ISize): void;
  public set(width: number, height: number): void;
  public set(...args: any[]): void {
    if (args.length === 1) {
      if (typeof args[0] === 'number') {
        this.width = args[0];
        this.height = args[0];
      } else {
        this.width = args[0].width;
        this.height = args[0].height;
      }
    } else {
      this.width = args[0];
      this.height = args[1];
    }
  }

  public isEqual(size: number | ISize): boolean {
    if (typeof size === 'number') {
      return this.width === size && this.height === size;
    } else {
      return this.width === size.width && this.height === size.height;
    }
  }
}

export default Size;
