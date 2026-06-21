import { useEffect, useRef } from 'react';

export function FpsMeter() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let frames = 0;
    let since = performance.now();

    const tick = (now: number) => {
      frames++;
      const elapsed = now - since;
      if (elapsed >= 500) {
        if (ref.current) ref.current.textContent = `${Math.round((frames * 1000) / elapsed)} fps`;
        frames = 0;
        since = now;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={ref} className="fps" aria-hidden="true">
      … fps
    </div>
  );
}
