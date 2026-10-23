import { useRef, useEffect } from 'react';

interface StackCardProps {
  children: React.ReactNode;
  index: number;
  total: number;
  className?: string;
}

/* ── Single sticky card ── */
const StackCard = ({ children, index, total, className = '' }: StackCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // The top card never scales, so it needs no scroll work at all
    if (!el || index >= total - 1) return;

    let lastScale = -1;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // progress 0→1 as card scrolls from bottom of viewport to top
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));
      // Each card behind the top one scales down slightly
      const scaleDown = 1 - (total - 1 - index) * 0.04 * (1 - progress);
      const scale = Math.max(0.82, Math.min(1, scaleDown));
      if (Math.abs(scale - lastScale) < 0.0005) return;
      lastScale = scale;
      el.style.transform = `scale(${scale})`;
    };

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    // Only listen to scroll while the card is on screen
    let listening = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener('scroll', onScroll);
      }
    });
    observer.observe(el);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [index, total]);

  return (
    <div
      ref={ref}
      className={`stack-card-wrap ${className}`}
      style={{
        position: 'sticky',
        top: `${60 + index * 16}px`,
        zIndex: index + 1,
        transformOrigin: 'top center',
        transition: 'transform 0.1s linear',
        willChange: 'transform',
        marginBottom: index < total - 1 ? '20px' : 0,
      }}
    >
      {children}
    </div>
  );
};

interface ScrollStackProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollStack = ({ children, className = '' }: ScrollStackProps) => {
  const items = Array.isArray(children) ? children : [children];
  const total = items.length;

  return (
    <div className={`relative ${className}`}>
      {items.map((child, i) => (
        <StackCard key={i} index={i} total={total}>
          {child}
        </StackCard>
      ))}
    </div>
  );
};

export const ScrollStackItem = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`w-full rounded-[28px] ${className}`}
    style={{
      minHeight: 300,
      padding: '40px 44px',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

export default ScrollStack;