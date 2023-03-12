import { useEffect, useRef, useState } from 'react';

import useAsteroidsSpawner from './useAsteroidsSpawner';
import useSpaceship from './useSpaceship';

import {
  useGameLoop,
  useGameLoopEvent
} from '@/lib/gameEngine/react/components/GameLoop';

export enum GameState {
  FirstGame = 0,
  GameOver = 1,
  Running = 2,
  Paused = 3
}

const getBestScoreInLocalStorage = () => {
  const storedBestScore = localStorage.getItem('best-score');

  return storedBestScore ? parseInt(storedBestScore) || 0 : 0;
};

const setBestScoreInLocalStorage = (score: number) => {
  localStorage.setItem('best-score', score.toString());
};

const useAsteroidsGameController = ({
  spaceship,
  asteroidsSpawner
}: {
  spaceship: ReturnType<typeof useSpaceship>;
  asteroidsSpawner: ReturnType<typeof useAsteroidsSpawner>;
}) => {
  const { gameLoop } = useGameLoop();
  const [fps, setFps] = useState(0);
  const [gameState, setGameState] = useState(GameState.FirstGame);
  const [score, setScore] = useState({
    multiplier: 1,
    value: 0
  });
  const [hasSounds, setHasSounds] = useState(true);

  const toggleSounds = () => setHasSounds((oldHasSounds) => !oldHasSounds);

  // const bestScore
  const gameStateRef = useRef(gameState);

  gameStateRef.current = gameState;

  useEffect(() => {
    const handleWindowKeydown = (e: KeyboardEvent) => {
      if (
        e.code === 'Enter' &&
        [GameState.FirstGame, GameState.GameOver].includes(gameStateRef.current)
      ) {
        setGameState(GameState.Running);
        spaceship.reset();
        asteroidsSpawner.reset();
        setScore({
          value: 0,
          multiplier: 1
        });
      } else if (e.code === 'Escape') {
        if (gameStateRef.current === GameState.Running) {
          gameLoop.pause();
          setGameState(GameState.Paused);
        } else if (gameStateRef.current === GameState.Paused) {
          gameLoop.resume();
          setGameState(GameState.Running);
        }
      }
    };

    const handleWindowBlur = () => {
      if (gameStateRef.current === GameState.Running) {
        gameLoop.pause();
        setGameState(GameState.Paused);
      }
    };

    window.addEventListener('keydown', handleWindowKeydown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleWindowKeydown);
    };
  }, [gameLoop]);

  useGameLoopEvent('end', (fps) => {
    setFps(+fps.toFixed(0));
  });

  const resetScoreMultiplier = () => {
    setScore((oldScore) => {
      return {
        ...oldScore,
        multiplier: 1
      };
    });
  };

  useGameLoopEvent('end', (fps, panic) => {
    if (panic) {
      gameLoop.resetFrameDelta();
    }
  });

  return {
    gameState,
    setGameState,
    score,
    setScore,
    resetScoreMultiplier,
    toggleSounds,
    fps
  };
};

export default useAsteroidsGameController;
