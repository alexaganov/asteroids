import { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import Vector2 from '@/lib/Vector2';
// import { clamp } from '@/lib/utils/math';
// import Random from '@/lib/Random';
import Game from '@/lib/Game';
import { clamp } from './lib/utils/math';

const App = () => {
  const [activeSceneName, setActiveSceneName] = useState<'main' | 'matrix'>(
    'main'
  );
  const gameRef = useRef<Game | null>();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  const [asteroidProperties, setAsteroidProperties] = useState(() => {
    return {
      maxRadius: 100,
      numOfVertices: 10,
      spikiness: 0,
      maxSpikeSize: 200
    };
  });

  useEffect(() => {
    const canvasEl = canvasElRef.current!;
    const game = (gameRef.current = new Game(canvasEl));

    return () => {
      gameRef.current = null;

      console.log('destroy');

      game.destroy();
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current!;

    game.setActiveScene(activeSceneName);
  }, [activeSceneName]);

  const handleButtonClick = () => {
    const game = gameRef.current!;

    game.regenerateAsteroid(asteroidProperties);
  };

  // const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
  //   const game = gameRef.current!;

  //   setAsteroidProperties(old => ({
  //     ...old,
  //     [e.target.name]: +e.target.value
  //   }));

  //   game.regenerateAsteroid(asteroidProperties)
  // }

  return (
    <div className="app">
      <div style={{ color: '#fff' }} className="ui">
        {/* <button onClick={() => setActiveSceneName('main')}>main</button>
        <button onClick={() => setActiveSceneName('matrix')}>matrix</button> */}

        {/* <button onClick={handleButtonClick}>
          regenerate
        </button>
        <div>
          max radius
          <input
            onChange={handleInputChange}
            value={asteroidProperties.maxRadius}
            name="maxRadius"
            type="range"
            min={100}
            max={500}
          />
        </div>
        <div>
          max spike size
          <input
            onChange={handleInputChange}
            value={asteroidProperties.maxSpikeSize}
            name="maxSpikeSize"
            type="range"
            min={100}
            max={500}
          />
        </div>
        <div>
          spikiness
          <input
            onChange={handleInputChange}
            value={asteroidProperties.spikiness}
            name="spikiness"
            type="range"
            step={0.1}
            min={0}
            max={1}
          />
        </div>

        <div>
          numOfVertices
          <input
            onChange={handleInputChange}
            value={asteroidProperties.numOfVertices}
            name="numOfVertices"
            type="range"
            min={3}
            max={100}
          />
        </div> */}
      </div>
      <canvas className="canvas" ref={canvasElRef} />
    </div>
  );
};

export default App;
