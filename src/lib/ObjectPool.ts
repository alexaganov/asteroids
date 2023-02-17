abstract class ObjectPullResource {
  abstract isActive(): boolean;
  abstract activate(): boolean;
  abstract deactivate(): void;
}

interface ObjectPullController<T extends object> {
  isActive: (obj: T) => boolean;
  activate: (obj: T) => void;
  deactivate: (obj: T) => void;
}

class ObjectPull<T extends object> {
  constructor(private controller: ObjectPullController<T>) {}

  get() {
    // todo
  }

  clear() {
    // todo
  }
}

export default ObjectPull;
