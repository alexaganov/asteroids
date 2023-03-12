import { useGameLoop } from '../components/GameLoop';

import useRefValue from './useRefValue';

const useGameInterval = (
  interval: number,
  {
    shouldExecuteOnFirstCall = false,
    isActive = true
  }: { shouldExecuteOnFirstCall?: boolean; isActive?: boolean } = {}
) => {
  const { gameLoop } = useGameLoop();
  const initialInterval = shouldExecuteOnFirstCall ? interval : 0;
  const state = useRefValue(() => {
    return {
      passedTime: initialInterval,
      isActive
    };
  });

  const stop = () => {
    state.isActive = false;
  };

  const start = () => {
    state.passedTime = initialInterval;
    state.isActive = true;
  };

  const execute = (cb: () => void) => {
    if (!state.isActive) {
      return;
    }

    if (state.passedTime >= interval) {
      cb();

      state.passedTime = gameLoop.simulationTimeStep;
    } else {
      state.passedTime += gameLoop.simulationTimeStep;
    }
  };

  const reset = () => {
    state.passedTime = initialInterval;
  };

  return {
    stop,
    start,
    execute,
    reset
  };
};

export default useGameInterval;
