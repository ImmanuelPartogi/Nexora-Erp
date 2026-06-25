// ============================================
// FILE: web-app/src/shared/components/PullToRefresh.tsx
// Touch-based pull-to-refresh wrapper for mobile lists.
// ============================================
import {
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from 'react';
import { RefreshIcon } from './Icons';

const THRESHOLD = 70; // px needed to trigger
const MAX_PULL = 100; // visual clamp

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = () => {
    const el = containerRef.current;
    return el ? el.scrollTop <= 0 : true;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (refreshing || !isAtTop()) return;
    startY.current = e.clientY;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (startY.current === null || refreshing) return;
    const delta = e.clientY - startY.current;
    if (delta > 0 && isAtTop()) {
      // resistance factor
      const resisted = Math.min(delta * 0.5, MAX_PULL);
      setPull(resisted);
    }
  };

  const onPointerUp = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const showSpinner = pull > 4 || refreshing;

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div
        className="flex items-center justify-center overflow-hidden text-brand-600 transition-[height] duration-200"
        style={{ height: pull }}
      >
        {showSpinner && (
          <RefreshIcon
            size={20}
            className={refreshing ? 'animate-spin' : ''}
            style={{ transform: `rotate(${pull * 3}deg)` }}
          />
        )}
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startY.current = null;
          setPull(0);
        }}
      >
        {children}
      </div>
    </div>
  );
}