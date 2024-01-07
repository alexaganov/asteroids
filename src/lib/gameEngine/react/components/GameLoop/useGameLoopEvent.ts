import { useEffect, useRef } from 'react';

import { useGameLoop } from './GameLoopProvider';

import { GameLoopEvents } from '@/lib/gameEngine/core/GameLoop';

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
