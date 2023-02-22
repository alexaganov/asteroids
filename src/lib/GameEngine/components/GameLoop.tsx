import { createSafeContext } from '@/shared/utils/contex';
import React, { ReactElement } from 'react';

interface GameLoopProps {
  fps?: number;
  children: ReactElement;
}

interface ContextValue {
  fps?: number;
}

const Context = createSafeContext<ContextValue>();

const GameLoop = ({ children }: GameLoopProps) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>;
};

export default GameLoop;
