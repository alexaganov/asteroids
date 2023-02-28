import { createSafeContext, useSafeContext } from '@/shared/utils/contex';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';

interface GameLoopProps {
  fps?: number;
  children: ReactElement;
}

interface ContextValue {
  on: <EN extends keyof GameLoopEvents, CB = GameLoopEvents[EN]>(
    eventName: EN,
    cb: CB
  ) => () => void;
}

const Context = createSafeContext<ContextValue>();

export const useGameLoopUpdate = (update: GameLoopUpdateCallback) => {
  const gameLoop = useGameLoop();
  const updateRef = useRef(update);

  updateRef.current = update;

  useEffect(() => {
    const cleanup = gameLoop.on('update', () => {
      updateRef.current();
    });

    return cleanup;
  }, []);
};

export const useGameLoopRender = (render: GameLoopRenderCallback) => {
  const gameLoop = useGameLoop();
  const renderRef = useRef(render);

  renderRef.current = render;

  useEffect(() => {
    const cleanup = gameLoop.on('render', (dt) => {
      renderRef.current(dt);
    });

    return cleanup;
  }, []);
};

export const useGameLoop = () => useSafeContext(Context);

type GameLoopRenderCallback = (dt: number) => void;
type GameLoopUpdateCallback = () => void;

interface GameLoopEvents {
  render: GameLoopRenderCallback;
  update: GameLoopUpdateCallback;
}

const GameLoop = ({ children }: GameLoopProps) => {
  const subscribersRef = useRef({
    update: new Set<GameLoopUpdateCallback>(),
    render: new Set<GameLoopRenderCallback>()
  });

  const on = useCallback(
    <EN extends keyof GameLoopEvents, CB = GameLoopEvents[EN]>(
      eventName: EN,
      cb: CB
    ) => {
      subscribersRef.current[eventName].add(cb as any);

      return () => {
        subscribersRef.current[eventName].delete(cb as any);
      };
    },
    []
  );

  useEffect(() => {
    const fps = 240;
    const tickInterval = 1 / fps;
    const scale = 1;
    const scaledTickInterval = tickInterval * scale;
    let last = performance.now();
    let delta = 0;
    let rafId = -1;

    const update = () => {
      subscribersRef.current.update.forEach((sub) => sub());
    };

    const render = (dt: number) => {
      subscribersRef.current.render.forEach((sub) => sub(dt));
    };

    const tick = (timestamp: number = performance.now()) => {
      const now = timestamp;
      const deltaInMs = now - last;
      // NOTE: deltaInMs can be too large if tab was inactive for too long,
      // making while loop do a lot of updates
      // This hack allows us to prevent this issue
      const currentDelta = Math.min(deltaInMs / 1000, 1);

      delta += currentDelta;

      while (delta > scaledTickInterval) {
        delta -= scaledTickInterval;

        update();
      }

      render((delta * scale) / fps);

      last = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  const value = useMemo(() => {
    return {
      on
    };
  }, [on]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default GameLoop;
