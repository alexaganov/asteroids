import { useRef } from 'react';

const useRefValue = <T extends object>(init: () => T) => {
  const ref = useRef<T>();

  if (!ref.current) {
    ref.current = init();
  }

  return ref.current;
};

export default useRefValue;
