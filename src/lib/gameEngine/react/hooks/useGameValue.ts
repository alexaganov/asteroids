import { useRef } from 'react';

export interface GameValue<T> {
  value: T;
}

const useGameValue = <T>(init: T | (() => T)): GameValue<T> => {
  const valueRef = useRef<GameValue<T> | undefined>(
    typeof init !== 'function'
      ? {
          value: init
        }
      : undefined
  );

  if (!valueRef.current) {
    valueRef.current = {
      //@ts-ignore
      value: init()
    };
  }

  return valueRef.current;
};

export default useGameValue;
