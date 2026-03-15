import { useRef, useEffect, useState } from 'react';

interface StackCardProps {
  children: React.ReactNode;
  index: number;
  total: number;
  className?: string;
}

/* ── Single sticky card ── */
const StackCard = ({ children, index, total, className = '' }: StackCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // progress 0→1 as card scrolls from bottom of viewport to top
      const p = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));
      setProgress(p);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Each card behind the top one scales down slightly
  const scaleDown = index < total - 1 ? 1 - (total - 1 - index) * 0.04 * (1 - progress) : 1;
  const clampedScale = Math.max(0.82, Math.min(1, scaleDown));

  return (
    <div
      ref={ref}
      className={`stack-card-wrap ${className}`}
      style={{
        position: 'sticky',
        top: `${60 + index * 16}px`,
        zIndex: index + 1,
        transformOrigin: 'top center',
        transform: `scale(${clampedScale})`,
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