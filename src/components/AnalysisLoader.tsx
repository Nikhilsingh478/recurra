import { useState, useEffect, useRef } from "react";

interface Props {
  visible: boolean;
  message: string;
  progress: number;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: 5 + Math.random() * 90,
  dur: 5 + Math.random() * 7,
  delay: -(Math.random() * 12),
  blue: i % 3 !== 0,
  size: 1.5 + Math.random() * 2,
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

  /* ── mount / unmount with exit delay ── */
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setTimeout(() => setAnimating(true), 10);
    } else {
      setAnimating(false);
      setTimeout(() => setShouldRender(false), 420);
    }
  }, [visible]);

  /* ── canvas draw loop ── */
  useEffect(() => {
    if (!shouldRender || !animating) return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    /* resize canvas to actual screen size */
    const resize = () => {
      cvs.width  = window.innerWidth;
      cvs.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    runningRef.current = true;
    startRef.current   = performance.now();
    gridFlashRef.current = 0;
    nextGridRef.current  = 4000 + Math.random() * 2000;

    /* blobs — larger, spread across full screen */
    const blobs = [
      /* big center-left blue */
      { cx: 0.22, cy: 0.45, r: 0.38, speed: 0.00025, phase: 0,    light: false },
      /* big center-right light blue */
      { cx: 0.72, cy: 0.50, r: 0.42, speed: 0.00020, phase: 2.1,  light: true  },
      /* top-center */
      { cx: 0.50, cy: 0.18, r: 0.30, speed: 0.00035, phase: 1.0,  light: false },
      /* bottom-left */
      { cx: 0.15, cy: 0.78, r: 0.28, speed: 0.00028, phase: 3.5,  light: true  },
      /* bottom-right */
      { cx: 0.82, cy: 0.75, r: 0.32, speed: 0.00022, phase: 4.8,  light: false },
      /* center accent */
      { cx: 0.50, cy: 0.55, r: 0.22, speed: 0.00040, phase: 0.7,  light: true  },
    ];

    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const draw = (now: number) => {
      if (!runningRef.current) return;
      const elapsed = now - startRef.current;
      const W = cvs.width;
      const H = cvs.height;

      /* ── Layer 1: base fill ── */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#050810";
      ctx.fillRect(0, 0, W, H);

      /* ── Layer 2: orb blobs — screen blend for glow ── */
      ctx.globalCompositeOperation = "screen";
      for (const b of blobs) {
        const bx = (b.cx + 0.14 * Math.sin(elapsed * b.speed + b.phase)) * W;
        const by = (b.cy + 0.10 * Math.cos(elapsed * b.speed * 1.3 + b.phase)) * H;
        const r  = b.r * Math.min(W, H);
        /* pulse opacity */
        const op = 0.18 + 0.10 * (0.5 + 0.5 * Math.sin(elapsed * 0.0008 + b.phase));
        const col = b.light
          ? `rgba(147,180,248,${op})`
          : `rgba(59,111,212,${op})`;

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, col);
        g.addColorStop(0.6, b.light ? `rgba(93,140,220,${op * 0.4})` : `rgba(40,80,180,${op * 0.4})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      /* ── Layer 3: noise grain ── */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      for (let i = 0; i < 300; i++) {
        const nx = Math.random() * W;
        const ny = Math.random() * H;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(nx, ny, 2, 2);
      }

      /* ── Layer 4: horizontal scan sweep ── */
      const scanCycle = 3200;
      const scanT = easeInOutSine((elapsed % scanCycle) / scanCycle);
      const scanX = -100 + scanT * (W + 200);
      const sg = ctx.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
      sg.addColorStop(0,   "rgba(255,255,255,0)");
      sg.addColorStop(0.3, "rgba(255,255,255,0.055)");
      sg.addColorStop(0.5, "rgba(147,180,248,0.09)");
      sg.addColorStop(0.7, "rgba(255,255,255,0.055)");
      sg.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(scanX - 60, 0, 120, H);
      /* bloom below scan */
      const bg = ctx.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
      bg.addColorStop(0,   "rgba(59,111,212,0)");
      bg.addColorStop(0.5, "rgba(59,111,212,0.035)");
      bg.addColorStop(1,   "rgba(59,111,212,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(scanX - 60, 0, 120, H);

      /* ── Layer 5: radial vignette ── */
      const vg = ctx.createRadialGradient(W/2, H/2, H * 0.2, W/2, H/2, H * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      /* ── Layer 6: grid flicker ── */
      if (elapsed > nextGridRef.current && gridFlashRef.current === 0) {
        gridFlashRef.current = elapsed;
        nextGridRef.current  = elapsed + 4500 + Math.random() * 2500;
      }
      if (gridFlashRef.current > 0) {
        const gEl = elapsed - gridFlashRef.current;
        if (gEl < 220) {
          const gOp = gEl < 110 ? gEl / 110 : (220 - gEl) / 110;
          ctx.strokeStyle = `rgba(59,111,212,${0.055 * gOp})`;
          ctx.lineWidth = 0.8;
          for (let x = 0; x < W; x += 28) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
          }
          for (let y = 0; y < H; y += 28) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
          }
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
      window.removeEventListener("resize", resize);
    };
  }, [shouldRender, animating]);

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        @keyframes al-float {
          0%   { transform: translateY(0);     opacity: 0; }
          15%  { opacity: var(--peak-op); }
          80%  { opacity: var(--peak-op); }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
        @keyframes al-msgIn {
          from { opacity:0; filter:blur(7px); transform:translate3d(0,6px,0); }
          to   { opacity:1; filter:blur(0);   transform:translate3d(0,0,0); }
        }
        @keyframes al-ldot {
          0%,80%,100% { transform:scale3d(0.55,0.55,1); opacity:0.2; }
          40%         { transform:scale3d(1,1,1);        opacity:1; }
        }
        .al-ld  { display:inline-block; width:5px; height:5px; border-radius:50%; will-change:transform,opacity; }
        .al-ld1 { animation:al-ldot 1.1s ease-in-out infinite 0s; }
        .al-ld2 { animation:al-ldot 1.1s ease-in-out infinite 0.17s; }
        .al-ld3 { animation:al-ldot 1.1s ease-in-out infinite 0.34s; }
        .al-msg { animation:al-msgIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .al-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: al-float var(--d) linear infinite;
          animation-delay: var(--dl);
          --peak-op: 0.45;
        }
      `}</style>

      {/* ── FULL SCREEN OVERLAY ── */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          width: "100%",
          height: "100%",
          minHeight: "100vh",
          /* dynamic viewport height — fixes mobile browser bar gap */
          ...(CSS.supports("min-height", "100dvh") ? { minHeight: "100dvh" } : {}),
          minWidth: "100vw",
          zIndex: 9999,
          overflow: "hidden",
          margin: 0,
          padding: 0,
          opacity: animating ? 1 : 0,
          transition: "opacity 420ms ease",
          willChange: "opacity",
        }}
      >
        {/* ── Canvas — fills 100% of overlay ── */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />

        {/* ── Floating particles — over canvas, under text ── */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="al-particle"
            style={{
              left:   `${p.x}%`,
              bottom: "-4px",
              width:  `${p.size}px`,
              height: `${p.size}px`,
              background: p.blue
                ? "rgba(147,180,248,0.55)"
                : "rgba(255,255,255,0.3)",
              "--d":  `${p.dur}s`,
              "--dl": `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* ── Text UI — centered on top of canvas ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 20px",
            zIndex: 2,
          }}
        >
          {/* Message */}
          <span
            key={message}
            className="al-msg"
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              fontWeight: 600,
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "-0.01em",
              textAlign: "center",
              marginBottom: 18,
              display: "block",
            }}
          >
            {message}
          </span>

          {/* Dots */}
          <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
            <span className="al-ld al-ld1" style={{ background: "rgba(147,180,248,0.7)" }} />
            <span className="al-ld al-ld2" style={{ background: "rgba(147,180,248,0.7)" }} />
            <span className="al-ld al-ld3" style={{ background: "rgba(147,180,248,0.7)" }} />
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "min(420px, 80vw)",
              height: 1.5,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #3b6fd4, #93b4f8)",
                borderRadius: 999,
                transition: "width 0.4s ease",
                boxShadow: "0 0 8px rgba(59,111,212,0.6)",
              }}
            />
          </div>

          {/* Label */}
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.22)",
              margin: 0,
            }}
          >
            Analyzing with Gemini AI
          </p>
        </div>
      </div>
    </>
  );
};

export default AnalysisLoader;