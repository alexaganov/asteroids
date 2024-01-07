import { useLayoutEffect, useRef, useState } from 'react';

const useSound = (src: string) => {
  const audioElRef = useRef<HTMLAudioElement>();
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const audioEl = (audioElRef.current = new Audio(src));

    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    audioEl.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audioEl.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [src]);

  const play = () => {
    if (isLoading || !audioElRef.current) {
      return;
    }

    (audioElRef.current.cloneNode() as HTMLAudioElement).play();
  };

  return {
    isLoading,
    play
  };
};

export default useSound;
