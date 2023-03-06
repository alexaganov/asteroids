import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import Background from './Background';
import MainScene from './scenes/MainScene';

import { useGameLoopEvent } from '@/lib/gameEngine/react/components/GameLoopProvider';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/gameEngine/react/components/Renderer';
import {
  createSafeContext,
  useSafeContext
} from '@/lib/gameEngine/react/utils/context';

export enum GameState {
  FirstGame = 0,
  GameOver = 1,
  Running = 2,
  Paused = 3
}

interface ContextValue {
  state: GameState;
  setState: (state: GameState) => void;
}

const Context = createSafeContext<ContextValue>();

interface AsteroidsGameControllerrProps {
  children: ReactNode;
}

export const useAsteroidsGameController = () => useSafeContext(Context);

const AsteroidsGameControllerProvider = ({
  children
}: AsteroidsGameControllerrProps) => {
  const [state, setState] = useState(GameState.FirstGame);

  useEffect(() => {
    const handleWindowKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setState((oldState) => {
          if (oldState === GameState.Paused) {
            return GameState.Running;
          } else if (oldState === GameState.Running) {
            return GameState.Paused;
          }

          return oldState;
        });
      } else if (e.code === 'Enter') {
        setState((oldState) => {
          if ([GameState.FirstGame, GameState.GameOver].includes(oldState)) {
            return GameState.Running;
          }

          return oldState;
        });
      }
    };

    const handleWindowBlur = () => {
      setState((oldState) => {
        if (oldState === GameState.Running) {
          return GameState.Paused;
        }

        return oldState;
      });
    };

    window.addEventListener('keydown', handleWindowKeydown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleWindowKeydown);
      window.addEventListener('blur', handleWindowBlur);
    };
  }, []);

  const value = useMemo(() => {
    return {
      state,
      setState
    };
  }, [state]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const AsteroidsGameMain = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();

  useGameLoopEvent('render', () => {
    ctx.resetTransform();
    ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  });

  return (
    <>
      <Background />
      <MainScene />
    </>
  );
};

export default AsteroidsGameMain;
