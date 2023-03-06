import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react';

import GameLoop, { GameLoopEvents } from '@/lib/gameEngine/core/GameLoop';
import {
  createSafeContext,
  useSafeContext
} from '@/lib/gameEngine/react/utils/context';

type GameLoopProviderProps = PropsWithChildren<{
  gameLoop: GameLoop;
}>;

interface ContextValue {
  gameLoop: GameLoop;
}

const Context = createSafeContext<ContextValue>();

export const useGameLoopEvent = <E extends keyof GameLoopEvents>(
  event: E,
  cb?: GameLoopEvents[E] | false | null | undefined
) => {
  const { gameLoop } = useGameLoop();
  const cbRef = useRef(cb);

  cbRef.current = cb;

  const isFunction = typeof cbRef.current === 'function';

  useEffect(() => {
    if (!isFunction) {
      return;
    }

    const gameLoopEventHandler: GameLoopEvents[E] = (...args: unknown[]) => {
      //@ts-ignore
      cbRef.current(...args);
    };

    //@ts-ignore
    gameLoop.on(event, gameLoopEventHandler);

    return () => {
      gameLoop.off(event, gameLoopEventHandler);
    };
  }, [event, gameLoop, isFunction]);
};

export const useGameLoop = () => useSafeContext(Context);

const GameLoopProvider = ({ children, gameLoop }: GameLoopProviderProps) => {
  useEffect(() => {
    gameLoop.start();

    return () => {
      gameLoop.stop();
    };
  }, [gameLoop]);

  const value = useMemo(() => {
    return {
      gameLoop
    };
  }, [gameLoop]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default GameLoopProvider;
