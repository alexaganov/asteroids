import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  createSafeContext,
  useSafeContext
} from '@/lib/gameEngine/react/utils/context';

interface ContextValue {
  canvasEl: HTMLCanvasElement;
  getContext: HTMLCanvasElement['getContext'];
}

const Context = createSafeContext<ContextValue>();

interface RendererProps {
  className?: string;
  children: ReactNode;
}

export const useRenderer = () => useSafeContext(Context);

export const useRenderer2dContext = () => {
  const { getContext } = useRenderer();

  return getContext('2d') as CanvasRenderingContext2D;
};

const Renderer = ({ className, children }: RendererProps) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const contextsRef = useRef<{
    '2d': CanvasRenderingContext2D | null;
  }>({
    '2d': null
  });

  useLayoutEffect(() => {
    setCanvasEl(canvasElRef.current);

    const updateCanvasSize = () => {
      const canvasEl = canvasElRef.current;

      if (!canvasEl) {
        return;
      }

      canvasEl.width = canvasEl.offsetWidth * window.devicePixelRatio;
      canvasEl.height = canvasEl.offsetHeight * window.devicePixelRatio;
    };

    updateCanvasSize();

    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const value = useMemo(() => {
    if (!canvasEl) {
      return null;
    }

    const getContext: HTMLCanvasElement['getContext'] = (
      contextId,
      options
    ) => {
      //@ts-ignore
      if (contextsRef.current[contextId]) {
        //@ts-ignore
        return contextsRef.current[contextId];
      }

      //@ts-ignore
      return (contextsRef.current[contextId] = canvasEl.getContext(
        contextId,
        options
      ));
    };

    return {
      getContext,
      canvasEl
    };
  }, [canvasEl]);

  return (
    <>
      <canvas
        ref={canvasElRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          inset: 0
        }}
      />
      {value && <Context.Provider value={value}>{children}</Context.Provider>}
    </>
  );
};

export default Renderer;
