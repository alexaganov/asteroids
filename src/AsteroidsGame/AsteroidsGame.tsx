import GameLoop from '@/lib/engine/components/GameLoop';
import Renderer from '@/lib/engine/components/Renderer';
import Background from './Background';
import MainScene from './scenes/MainScene';

const AsteroidsGame = () => {
  return (
    <GameLoop>
      <Renderer>
        <Background />
        <MainScene />
      </Renderer>
    </GameLoop>
  );
};

export default AsteroidsGame;
