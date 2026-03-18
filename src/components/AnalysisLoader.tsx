import { useState, useEffect, useRef } from "react";

interface Props {
  visible: boolean;
  message: string;
  progress: number;
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  x: Math.random() * 100,
  dur: 4 + Math.random() * 5,
  delay: Math.random() * -9,
  blue: i % 3 !== 0,
}));

const AnalysisLoader = ({ visible, message, progress }: Props) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const startRef = useRef(0);
  const gridFlashRef = useRef(0);
  const nextGridRef = useRef(4000 + Math.random() * 2000);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setTimeout(() => setAnimating(true), 10);
    } else {
      setAnimating(false);
      setTimeout(() => setShouldRender(false), 380);
    }
  }, [visible]);

  useEffect(() => {
    if (!shouldRender || !animating) return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    runningRef.current = true;
    startRef.current = performance.now();

    const blobs = Array.from({ length: 6 }, (_, i) => ({
      cx: 0.2 + Math.random() * 0.6,
      cy: 0.2 + Math.random() * 0.6,
      r: 60 + Math.random() * 60,
      speed: 0.0003 + Math.random() * 0.0004,
      phase: Math.random() * Math.PI * 2,
      light: i % 2 === 0,
    }));

    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const draw = (now: number) => {
      if (!runningRef.current) return;
      const elapsed = now - startRef.current;
      const w = cvs.width;
      const h = cvs.height;

      // Layer 1 — base
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5,8,16,1)";
      ctx.fillRect(0, 0, w, h);

      // Layer 5 prep — blur offset
      const blurOffset = elapsed < 3000 ? 2 * (1 - elapsed / 3000) : 0;

      // Layer 2 — blobs
      ctx.globalCompositeOperation = "screen";
      for (const b of blobs) {
        const bx = (b.cx + 0.15 * Math.sin(elapsed * b.speed + b.phase)) * w;
        const by = (b.cy + 0.12 * Math.cos(elapsed * b.speed * 1.3 + b.phase)) * h;
        const op = 0.06 + 0.06 * (0.5 + 0.5 * Math.sin(elapsed * 0.001 + b.phase));
        const col = b.light ? `rgba(147,180,248,${op})` : `rgba(59,111,212,${op})`;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        g.addColorStop(0, col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        // Layer 5 — double draw for blur sim
        if (blurOffset > 0.1) {
          ctx.globalAlpha = 0.4;
          const g2 = ctx.createRadialGradient(bx + blurOffset, by + blurOffset, 0, bx + blurOffset, by + blurOffset, b.r);
          g2.addColorStop(0, col);
          g2.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
        }
      }

      // Layer 3 — noise
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 200; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
        ctx.fillRect(nx, ny, 2, 2);
      }

      // Layer 4 — scan line
      const scanCycle = 3000;
      const scanT = easeInOutSine((elapsed % scanCycle) / scanCycle);
      const scanX = -80 + scanT * (w + 160);
      const sg = ctx.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
      sg.addColorStop(0, "rgba(255,255,255,0)");
      sg.addColorStop(0.3, "rgba(255,255,255,0.06)");
      sg.addColorStop(0.5, "rgba(147,180,248,0.08)");
      sg.addColorStop(0.7, "rgba(255,255,255,0.06)");
      sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(scanX - 40, 0, 80, h);
      // bloom
      const bg = ctx.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
      bg.addColorStop(0, "rgba(147,180,248,0)");
      bg.addColorStop(0.5, "rgba(147,180,248,0.04)");
      bg.addColorStop(1, "rgba(147,180,248,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(scanX - 40, 40, 80, h);

      // Layer 6 — grid flicker
      if (elapsed > nextGridRef.current && gridFlashRef.current === 0) {
        gridFlashRef.current = elapsed;
        nextGridRef.current = elapsed + 4000 + Math.random() * 2000;
      }
      if (gridFlashRef.current > 0) {
        const gElapsed = elapsed - gridFlashRef.current;
        if (gElapsed < 200) {
          const gOp = gElapsed < 100 ? gElapsed / 100 : (200 - gElapsed) / 100;
          ctx.strokeStyle = `rgba(59,111,212,${0.04 * gOp})`;
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
          for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        } else {
          gridFlashRef.current = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [shouldRender, animating]);

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        @keyframes al-glow{0%{box-shadow:0 0 0 0 rgba(59,111,212,0),0 0 20px rgba(59,111,212,0.05)}100%{box-shadow:0 0 0 1px rgba(59,111,212,0.15),0 0 40px rgba(59,111,212,0.12)}}
        @keyframes al-breathe{0%,100%{transform:scale(0.998)}50%{transform:scale(1.001)}}
        @keyframes al-float{0%{transform:translateY(100%);opacity:0}30%{opacity:0.4}70%{opacity:0.4}100%{transform:translateY(-100%);opacity:0}}
        @keyframes al-msgIn{from{opacity:0;filter:blur(6px)}to{opacity:1;filter:blur(0)}}
        .al-box{animation:al-glow 2.5s ease-in-out infinite alternate,al-breathe 3s ease-in-out infinite;will-change:transform}
        .al-particle{animation:al-float var(--d) linear infinite;animation-delay:var(--dl)}
        .al-msg{animation:al-msgIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards}
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          width: "100%", height: "100%",
          minHeight: "100vh",
          // @ts-ignore
          minHeight: "100dvh",
          minWidth: "100vw",
          zIndex: 9999,
          overflow: "hidden",
          margin: 0, padding: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%), #050810",
          opacity: animating ? 1 : 0,
          transition: "opacity 400ms ease",
          willChange: "opacity",
        }}
      >
        {/* Grain SVG filter */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <filter id="al-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
        </svg>
        <div style={{ position: "absolute", inset: 0, filter: "url(#al-grain)", opacity: 0.03, pointerEvents: "none" }} />

        {/* Canvas box */}
        <div
          className="al-box"
          style={{
            position: "relative",
            width: "min(480px, 90vw)",
            height: "min(300px, 56vw)",
            maxWidth: 480,
            background: "rgba(255,255,255,0.022)",
            border: "1px solid rgba(59,111,212,0.25)",
            borderRadius: 16,
            overflow: "hidden",
            transform: animating ? "scale(1)" : "scale(0.96)",
            filter: animating ? "blur(0)" : "blur(8px)",
            transition: "transform 500ms cubic-bezier(0.22,1,0.36,1), filter 500ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease",
          }}
        >
          <canvas ref={canvasRef} width={480} height={300} style={{ width: "100%", height: "100%", display: "block" }} />
          {/* Particles */}
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="al-particle"
              style={{
                position: "absolute",
                left: `${p.x}%`,
                bottom: 0,
                width: 2, height: 2,
                borderRadius: "50%",
                background: p.blue ? "rgba(147,180,248,0.4)" : "rgba(255,255,255,0.25)",
                "--d": `${p.dur}s`,
                "--dl": `${p.delay}s`,
                pointerEvents: "none",
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Text content */}
        <div style={{ marginTop: 24, textAlign: "center", width: "min(480px, 90vw)" }}>
          <span key={message} className="al-msg" style={{ display: "inline-block", fontFamily: "Syne, sans-serif", fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
            {message}
          </span>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 3 }}>
            <span className="ld ld1" style={{ background: "rgba(59,111,212,0.6)" }} />
            <span className="ld ld2" style={{ background: "rgba(59,111,212,0.6)" }} />
            <span className="ld ld3" style={{ background: "rgba(59,111,212,0.6)" }} />
          </div>
          <div style={{ marginTop: 16, height: 1.5, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#3b6fd4,#93b4f8)", borderRadius: 999, transition: "width 0.4s ease" }} />
          </div>
          <p style={{ marginTop: 10, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)" }}>
            Analyzing with Gemini AI
          </p>
        </div>
      </div>
    </>
  );
};

export default AnalysisLoader;
