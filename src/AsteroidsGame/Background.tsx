import { useGameLoopRender } from '@/lib/engine/components/GameLoop';
import {
  useRenderer,
  useRenderer2dContext
} from '@/lib/engine/components/Renderer';
import React from 'react';

const Background = () => {
  const { canvasEl } = useRenderer();
  const ctx = useRenderer2dContext();

  useGameLoopRender(() => {
    ctx.resetTransform();

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
  });

  return null;
};

export default Background;
