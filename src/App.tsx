import { useEffect, useRef, useState } from 'react';
import Game from '@/lib/Game';

const getStoredBestScore = () => {
  const storedBestScore = window.localStorage.getItem('best-score');
  const parsedBestScore = storedBestScore ? parseInt(storedBestScore) || 0 : 0;

  return parsedBestScore;
};

const storedBestScore = (score: number) => {
  window.localStorage.setItem('best-score', score.toString());
};

const App = () => {
  const [bestScore, setBestScore] = useState(getStoredBestScore);
  const [isFirstGame, setIsFirstGame] = useState(true);
  const [isGameOver, setIsGameOver] = useState(true);
  const [score, setScore] = useState(0);
  const gameRef = useRef<Game | null>();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    storedBestScore(bestScore);
  }, [bestScore]);

  useEffect(() => {
    const gameOverHandler = () => {
      setIsGameOver(true);
    };

    const scoringHandler = (score: number) => {
      setScore(score);
      setBestScore((oldBestScore) => {
        return score > oldBestScore ? score : oldBestScore;
      });
    };

    const canvasEl = canvasElRef.current!;
    const game = (gameRef.current = new Game(canvasEl, {
      onGameOver: gameOverHandler,
      onScore: scoringHandler
    }));

    const handleWindowKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setIsFirstGame(false);
        setIsGameOver(false);
        setScore(0);
        game.reset();
      }
    };

    window.addEventListener('keydown', handleWindowKeydown);

    return () => {
      gameRef.current = null;

      game.destroy();
      window.removeEventListener('keydown', handleWindowKeydown);
    };
  }, []);

  return (
    <div className="app">
      <canvas className="canvas" ref={canvasElRef} />

      <div className="ui">
        {isFirstGame && (
          <p className="t-fs a-blinking t-align-center">Press Enter to Play</p>
        )}

        {!isFirstGame && isGameOver && (
          <p className="t-fs-md t-align-center">
            <span className="t-fs-2xl">Game Over</span>
            <br />
            <br />
            <br />
            Score: {score}
            <br />
            <br />
            Best score: {bestScore}
            <br />
            <br />
            <span className="a-blinking">Press Enter to Try Again</span>
          </p>
        )}

        {!isGameOver && <p className="ui__score">{score}</p>}
      </div>
    </div>
  );
};

export default App;
