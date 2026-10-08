import { useEffect, useRef } from 'react';

/** Calls `fn` now and then every `ms` milliseconds (used for the live queue views). */
export default function usePolling(fn, ms = 5000, deps = []) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    let stop = false;
    const tick = () => { if (!stop) saved.current(); };
    tick();
    const id = setInterval(tick, ms);
    return () => { stop = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, ...deps]);
}
