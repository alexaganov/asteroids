import React, { PropsWithChildren, useEffect, useRef } from 'react';

import useRefValue from '../hooks/useRefValue';
import { createSafeContext, useSafeContext } from '../utils/context';

import { useGameLoopEvent } from './GameLoopProvider';

interface KeyState {
  isPressing: boolean;
  isPressed: boolean;
}

type KeyboardKeys = `Key${'A' | 'D'}` | 'Space';

interface ContextValue {
  keyboard: {
    horizontal: -1 | 0 | 1;
    pressingKeys: {
      [key in KeyboardKeys]?: boolean;
    };
    pressedKeys: {
      [key in KeyboardKeys]?: boolean;
    };
  };
}

const Context = createSafeContext<ContextValue>();

export const useGameUserInput = () => useSafeContext(Context);

type GameUserInputProviderProps = PropsWithChildren;

const GameUserInputProvider = ({ children }: GameUserInputProviderProps) => {
  const keyboardState = useRefValue(
    () =>
      ({
        horizontal: 0,
        pressedKeys: {},
        pressingKeys: {}
      } as ContextValue['keyboard'])
  );

  useEffect(() => {
    const handleWindowKeydown = (e: KeyboardEvent) => {
      keyboardState.pressingKeys[e.code as KeyboardKeys] = true;
      keyboardState.pressedKeys[e.code as KeyboardKeys] = true;

      //@ts-ignore
      keyboardState.horizontal =
        (keyboardState.pressingKeys.KeyA ? -1 : 0) +
        (keyboardState.pressingKeys.KeyD ? 1 : 0);
    };

    const handleWindowKeyup = (e: KeyboardEvent) => {
      keyboardState.pressingKeys[e.code as KeyboardKeys] = false;
      keyboardState.pressedKeys[e.code as KeyboardKeys] = false;

      //@ts-ignore
      keyboardState.horizontal =
        (keyboardState.pressingKeys.KeyA ? -1 : 0) +
        (keyboardState.pressingKeys.KeyD ? 1 : 0);
    };

    const handleWindowFocusout = () => {
      keyboardState.pressingKeys = {};
      keyboardState.pressedKeys = {};
    };

    window.addEventListener('keydown', handleWindowKeydown);
    window.addEventListener('keyup', handleWindowKeyup);
    window.addEventListener('blur', handleWindowFocusout);

    return () => {
      window.removeEventListener('keydown', handleWindowKeydown);
      window.removeEventListener('keyup', handleWindowKeyup);
      window.addEventListener('blur', handleWindowFocusout);
    };
  }, []);

  useGameLoopEvent('end', () => {
    for (const pressedKey in keyboardState.pressedKeys) {
      keyboardState.pressedKeys[pressedKey as KeyboardKeys] = false;
    }
  });

  const value = {
    keyboard: keyboardState
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default GameUserInputProvider;
