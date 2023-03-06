import AsteroidsGameMain from './AsteroidsGameMain';

import { createGameLoop } from '@/lib/gameEngine/core/GameLoop';
import GameLoopProvider from '@/lib/gameEngine/react/components/GameLoopProvider';
import GameUserInputProvider from '@/lib/gameEngine/react/components/GameUserInputProvider';
import Renderer from '@/lib/gameEngine/react/components/Renderer';

const gameLoop = createGameLoop();

const AsteroidsGame = () => {
  return (
    <GameLoopProvider gameLoop={gameLoop}>
      <GameUserInputProvider>
        <Renderer>
          <AsteroidsGameMain />
        </Renderer>
      </GameUserInputProvider>
    </GameLoopProvider>
  );
};

export default AsteroidsGame;
