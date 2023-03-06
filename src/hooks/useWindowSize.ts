import { useLayoutEffect, useState } from 'react';
import { debounce } from 'utils';

export function useWindowSize() {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', debounce(updateSize, 5));
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
