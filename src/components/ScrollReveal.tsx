import { useEffect, useRef, useMemo } from 'react';

interface ScrollRevealProps {
  children: string;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

/* Same timing model as a scrubbed GSAP stagger: each word tweens for WORD_DURATION,
   starting WORD_STAGGER after the previous one. */
const WORD_DURATION = 0.5;
const WORD_STAGGER = 0.05;

const POSITIONS: Record<string, number> = { top: 0, center: 0.5, bottom: 1 };

/* Resolves a ScrollTrigger-style "<element> <viewport>" position (e.g. "center center")
   to the element's top offset (relative to the viewport top) at which it is reached. */
const resolveTop = (position: string, elHeight: number, viewportHeight: number) => {
  const [el = 'top', vp = 'bottom'] = position.split(' ');
  return (POSITIONS[vp] ?? 1) * viewportHeight - (POSITIONS[el] ?? 0) * elHeight;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = false,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
}: ScrollRevealProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span
          className="inline-block word"
          key={index}
          style={{ opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : undefined }}
        >
          {word}
        </span>
      );
    });
  }, [children, baseOpacity, enableBlur, blurStrength]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller: HTMLElement | Window = scrollContainerRef?.current ?? window;
    const words = Array.from(el.querySelectorAll<HTMLElement>('.word'));
    const total = WORD_DURATION + WORD_STAGGER * Math.max(0, words.length - 1);
    const lastWordProgress = new Float32Array(words.length).fill(-1);

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportTop = scroller === window ? 0 : (scroller as HTMLElement).getBoundingClientRect().top;
      const vh = scroller === window ? window.innerHeight : (scroller as HTMLElement).clientHeight;
      const top = rect.top - viewportTop;

      // Rotation: from "top bottom" to rotationEnd
      const rotStart = resolveTop('top bottom', rect.height, vh);
      const rotEnd = resolveTop(rotationEnd, rect.height, vh);
      const rotP = clamp01((rotStart - top) / Math.max(1, rotStart - rotEnd));
      el.style.transform = `rotate(${baseRotation * (1 - rotP)}deg)`;

      // Words: from "top bottom-=20%" to wordAnimationEnd
      const wordStart = vh * 0.8;
      const wordEnd = resolveTop(wordAnimationEnd, rect.height, vh);
      const t = clamp01((wordStart - top) / Math.max(1, wordStart - wordEnd)) * total;

      for (let i = 0; i < words.length; i++) {
        const p = clamp01((t - i * WORD_STAGGER) / WORD_DURATION);
        if (p === lastWordProgress[i]) continue;
        lastWordProgress[i] = p;
        const style = words[i].style;
        style.opacity = String(baseOpacity + (1 - baseOpacity) * p);
        if (enableBlur) {
          const blur = blurStrength * (1 - p);
          style.filter = blur > 0.01 ? `blur(${blur}px)` : 'none';
        }
      }
    };

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    // Only listen to scroll while the element is near the viewport
    let listening = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          listening = true;
          scroller.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll, { passive: true });
          update();
        } else if (!entry.isIntersecting && listening) {
          listening = false;
          scroller.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
          update();
        }
      },
      { root: scroller === window ? null : (scroller as HTMLElement), rootMargin: '20% 0px' }
    );
    el.style.transformOrigin = '0% 50%';
    observer.observe(el);
    update();

    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p
        className={`text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold ${textClassName}`}
      >
        {splitText}
      </p>
    </h2>
  );
};

export default ScrollReveal;
