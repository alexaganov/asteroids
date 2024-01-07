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

export const useGameLoop = () => useSafeContext(Context);

export const GameLoopProvider = ({
  children,
  gameLoop
}: GameLoopProviderProps) => {
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
