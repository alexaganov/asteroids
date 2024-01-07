import { ReactNode, useMemo } from 'react';

import { GameLoopEvents } from '../../core/GameLoop';
import { WithOnPrefix } from '../types';
import { createSafeContext } from '../utils/context';

import { useGameLoopEvent } from './GameLoop';

interface GameObjectProps extends Partial<WithOnPrefix<GameLoopEvents>> {
  isActive?: boolean;
  children?: ReactNode;
}

const Context = createSafeContext();

const GameObject = ({
  isActive = true,
  children,
  onBegin,
  onEnd,
  onRender,
  onUpdate
}: GameObjectProps) => {
  useGameLoopEvent('begin', isActive && onBegin);
  useGameLoopEvent('update', isActive && onUpdate);
  useGameLoopEvent('render', isActive && onRender);
  useGameLoopEvent('end', isActive && onEnd);

  const value = useMemo(() => {
    return {};
  }, []);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default GameObject;
