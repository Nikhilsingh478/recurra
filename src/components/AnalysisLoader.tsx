import { useState, useEffect, useRef } from "react";

interface Props {
  visible: boolean;
  message: string;
  progress: number;
}

// ── Seeded, stable particles — no Math.random() ──────────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x:    5  + ((i * 53)  % 90),
  dur:  7  + ((i * 11)  % 9),
  delay: -((i * 6)      % 15),
  bright: i % 3 !== 0,
  size: 1.0 + ((i * 4)  % 3) * 0.55,
}));

// ── Palette ───────────────────────────────────────────────────────────
//   #03070f  — near-black navy (bg)
//   #0d1f42  — deepest wave shadow
//   #1a3a6e  — rich deep blue
//   #1e4d8c  — mid wave blue
//   #4a7fd4  — electric crest blue
//   #6a9de0  — lifted highlight blue
//   #8cb8f0  — pale sky (teal-ish glint)

const AnalysisLoader = ({ visible, message, progress }: Props) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animating,    setAnimating]    = useState(false);
  const [displayMsg,   setDisplayMsg]   = useState(message);
  const msgRef = useRef<HTMLSpanElement>(null);

  /* mount / unmount */
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // tiny rAF delay so opacity transition fires after paint
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    } else {
      setAnimating(false);
      setTimeout(() => setShouldRender(false), 600);
    }
  }, [visible]);

  /* blur-crossfade message swap */
  useEffect(() => {
    if (!msgRef.current || message === displayMsg) return;
    const el = msgRef.current;
    el.style.opacity = "0";
    el.style.filter  = "blur(10px)";
    const t = setTimeout(() => {
      setDisplayMsg(message);
      // Force reflow so transition fires
      void el.offsetHeight;
      el.style.opacity = "1";
      el.style.filter  = "blur(0px)";
    }, 240);
    return () => clearTimeout(t);
  }, [message]);

  if (!shouldRender) return null;

  return (
    <>
      <style>{`

        /* ── Particle rise ─────────────────────────────────────── */
        @keyframes ptc-rise {
          0%   { transform: translateY(0)       scale(1);    opacity: 0; }
          10%  { opacity: var(--pk); }
          88%  { opacity: var(--pk); }
          100% { transform: translateY(-100vh)  scale(0.6);  opacity: 0; }
        }

        /* ── Dot breathe ───────────────────────────────────────── */
        @keyframes dot-breathe {
          0%, 100% { transform: scale(0.45); opacity: 0.15; }
          50%      { transform: scale(1);    opacity: 1; }
        }
        .al-dot {
          display: inline-block;
          border-radius: 50%;
          will-change: transform, opacity;
        }
        .al-dot-1 { animation: dot-breathe 1.5s cubic-bezier(0.45,0,0.55,1) infinite 0s; }
        .al-dot-2 { animation: dot-breathe 1.5s cubic-bezier(0.45,0,0.55,1) infinite 0.22s; }
        .al-dot-3 { animation: dot-breathe 1.5s cubic-bezier(0.45,0,0.55,1) infinite 0.44s; }

        /* ── Message transition ────────────────────────────────── */
        .al-msg {
          transition: opacity 0.28s cubic-bezier(0.4,0,0.2,1),
                      filter  0.28s cubic-bezier(0.4,0,0.2,1);
          will-change: opacity, filter;
        }

        /* ── Particle ──────────────────────────────────────────── */
        .al-ptc {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform, opacity;
          animation: ptc-rise var(--d) cubic-bezier(0.4,0,0.6,1) infinite var(--dl);
          --pk: 0.55;
        }

        /* ══════════════════════════════════════════════════════════
           FULL-BLEED MORPHING BLOBS
           ─ Each blob lives in position:absolute inside inset:0
           ─ Positioned with negative offsets to bleed all 4 edges
           ─ Animates ONLY transform + border-radius + opacity
             (all GPU-composited — Apple-smooth)
           ─ mix-blend-mode: screen for luminous overlap
           ─ alternate timing: no snap-back, continuous breathing
        ══════════════════════════════════════════════════════════ */

        .blob {
          position: absolute;
          border-radius: 50%;
          background: var(--c);
          filter: blur(var(--blur));
          opacity: var(--op);
          mix-blend-mode: screen;
          will-change: transform, border-radius, opacity;
          animation: blob-breathe var(--md) cubic-bezier(0.45,0,0.55,1)
                     infinite alternate var(--del, 0s);
        }

        @keyframes blob-breathe {
          0% {
            border-radius: 44% 56% 53% 47% / 46% 54% 46% 54%;
            transform: translate(var(--x0), var(--y0)) scale(1);
            opacity: var(--op);
          }
          20% {
            border-radius: 62% 38% 42% 58% / 54% 46% 58% 42%;
            transform: translate(var(--x1), var(--y1)) scale(1.05);
          }
          45% {
            border-radius: 38% 62% 60% 40% / 42% 58% 44% 56%;
            transform: translate(var(--x2), var(--y2)) scale(0.96);
            opacity: calc(var(--op) * 1.25);
          }
          70% {
            border-radius: 56% 44% 38% 62% / 60% 40% 58% 42%;
            transform: translate(var(--x3), var(--y3)) scale(1.08);
          }
          100% {
            border-radius: 48% 52% 56% 44% / 50% 50% 46% 54%;
            transform: translate(var(--x0), calc(var(--y0) + 18px)) scale(1.02);
            opacity: var(--op);
          }
        }

        /* ── Deep elliptical vignette ──────────────────────────── */
        .vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse 80% 80% at 50% 50%,
            transparent 10%,
            rgba(3,7,15,0.45)  55%,
            rgba(3,7,15,0.92)  100%
          );
        }

        /* ── Grain film noise ──────────────────────────────────── */
        .grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.032;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
        }

        /* ── Progress shimmer ──────────────────────────────────── */
        @keyframes sheen {
          0%   { background-position: -250% center; }
          100% { background-position:  250% center; }
        }
        .bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #1a3a6e 0%,
            #4a7fd4 30%,
            #8cb8f0 52%,
            #4a7fd4 70%,
            #1a3a6e 100%
          );
          background-size: 280% auto;
          animation: sheen 2.6s cubic-bezier(0.4,0,0.6,1) infinite;
          box-shadow: 0 0 16px rgba(74,127,212,0.6);
          transition: width 0.42s cubic-bezier(0.4,0,0.2,1);
          will-change: width;
        }

      `}</style>

      {/* ══ ROOT OVERLAY ════════════════════════════════════════════ */}
      <div
        style={{
          position:   "fixed",
          inset:      0,
          zIndex:     9999,
          overflow:   "hidden",
          background: "#03070f",
          opacity:    animating ? 1 : 0,
          transition: "opacity 600ms cubic-bezier(0.4,0,0.2,1)",
          willChange: "opacity",
        }}
      >

        {/* ══ BLOB FIELD ════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>

          {/* Blob A — large deep blue, top-left, bleeds both edges */}
          <div className="blob" style={{
            "--c":    "#1a3a6e",
            "--blur": "105px",
            "--op":   "0.7",
            "--md":   "13s",
            "--del":  "0s",
            "--x0": "-2vw",  "--y0": "0vh",
            "--x1": "5vw",   "--y1": "8vh",
            "--x2": "-4vw",  "--y2": "14vh",
            "--x3": "8vw",   "--y3": "4vh",
            width: "85vw",  height: "85vw",
            maxWidth: "980px", maxHeight: "980px",
            left: "-28vw",  top: "-30vh",
          } as React.CSSProperties} />

          {/* Blob B — electric blue, bottom-right, bleeds both edges */}
          <div className="blob" style={{
            "--c":    "#4a7fd4",
            "--blur": "115px",
            "--op":   "0.55",
            "--md":   "17s",
            "--del":  "-5s",
            "--x0": "0vw",   "--y0": "0vh",
            "--x1": "-8vw",  "--y1": "-6vh",
            "--x2": "10vw",  "--y2": "-10vh",
            "--x3": "-4vw",  "--y3": "8vh",
            width: "90vw",  height: "90vw",
            maxWidth: "1040px", maxHeight: "1040px",
            right: "-28vw", bottom: "-28vh",
          } as React.CSSProperties} />

          {/* Blob C — mid blue, center-right */}
          <div className="blob" style={{
            "--c":    "#1e4d8c",
            "--blur": "95px",
            "--op":   "0.65",
            "--md":   "11s",
            "--del":  "-3s",
            "--x0": "0vw",   "--y0": "0vh",
            "--x1": "6vw",   "--y1": "-8vh",
            "--x2": "-4vw",  "--y2": "6vh",
            "--x3": "3vw",   "--y3": "-3vh",
            width: "65vw",  height: "65vw",
            maxWidth: "760px", maxHeight: "760px",
            right: "-8vw",  top: "18vh",
          } as React.CSSProperties} />

          {/* Blob D — electric blue, left-center */}
          <div className="blob" style={{
            "--c":    "#4a7fd4",
            "--blur": "125px",
            "--op":   "0.4",
            "--md":   "19s",
            "--del":  "-8s",
            "--x0": "0vw",   "--y0": "0vh",
            "--x1": "5vw",   "--y1": "10vh",
            "--x2": "-7vw",  "--y2": "4vh",
            "--x3": "2vw",   "--y3": "-6vh",
            width: "72vw",  height: "72vw",
            maxWidth: "840px", maxHeight: "840px",
            left: "-8vw",   top: "28vh",
          } as React.CSSProperties} />

          {/* Blob E — pale sky glint, top-right — mimics wave crest */}
          <div className="blob" style={{
            "--c":    "#6a9de0",
            "--blur": "80px",
            "--op":   "0.38",
            "--md":   "9s",
            "--del":  "-2s",
            "--x0": "0vw",   "--y0": "0vh",
            "--x1": "-5vw",  "--y1": "6vh",
            "--x2": "7vw",   "--y2": "-4vh",
            "--x3": "-3vw",  "--y3": "3vh",
            width: "55vw",  height: "55vw",
            maxWidth: "640px", maxHeight: "640px",
            right: "-4vw",  top: "-12vh",
          } as React.CSSProperties} />

          {/* Blob F — deepest shadow base, bottom-left bleed */}
          <div className="blob" style={{
            "--c":    "#0d1f42",
            "--blur": "140px",
            "--op":   "0.9",
            "--md":   "23s",
            "--del":  "-11s",
            "--x0": "0vw",   "--y0": "0vh",
            "--x1": "6vw",   "--y1": "-5vh",
            "--x2": "-4vw",  "--y2": "8vh",
            "--x3": "3vw",   "--y3": "-2vh",
            width: "100vw", height: "60vw",
            maxWidth: "1200px", maxHeight: "700px",
            left: "0vw",    bottom: "-18vh",
          } as React.CSSProperties} />

          {/* Blob G — soft pale sky focal center, very low opacity */}
          <div className="blob" style={{
            "--c":    "#8cb8f0",
            "--blur": "70px",
            "--op":   "0.18",
            "--md":   "8s",
            "--del":  "-4s",
            "--x0": "0vw",   "--y0": "0vh",
            "--x1": "3vw",   "--y1": "-5vh",
            "--x2": "-4vw",  "--y2": "4vh",
            "--x3": "2vw",   "--y3": "-2vh",
            width: "42vw",  height: "42vw",
            maxWidth: "500px", maxHeight: "500px",
            left: "29vw",   top: "32vh",
          } as React.CSSProperties} />

        </div>

        {/* grain + vignette sit above blobs */}
        <div className="grain"   style={{ zIndex: 1 }} />
        <div className="vignette" style={{ zIndex: 2 }} />

        {/* ── Particles ────────────────────────────────────────── */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="al-ptc"
            style={{
              left:   `${p.x}%`,
              bottom: "-2px",
              width:  `${p.size}px`,
              height: `${p.size}px`,
              background: p.bright
                ? "rgba(140,184,240,0.9)"
                : "rgba(74,127,212,0.45)",
              "--d":  `${p.dur}s`,
              "--dl": `${p.delay}s`,
              zIndex: 3,
            } as React.CSSProperties}
          />
        ))}

        {/* ══ TEXT UI ═════════════════════════════════════════════ */}
        <div
          style={{
            position:       "absolute",
            inset:          0,
            zIndex:         5,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "0 32px",
          }}
        >

          {/* Message */}
          <span
            ref={msgRef}
            className="al-msg"
            style={{
              fontFamily:    "'Syne', sans-serif",
              fontSize:      "clamp(1rem, 2.6vw, 1.25rem)",
              fontWeight:    600,
              color:         "rgba(255,255,255,0.95)",
              letterSpacing: "-0.018em",
              textAlign:     "center",
              marginBottom:  22,
              display:       "block",
              lineHeight:    1.45,
              textShadow:    "0 1px 30px rgba(0,0,0,0.95), 0 0 60px rgba(74,127,212,0.18)",
            }}
          >
            {displayMsg}
          </span>

          {/* Three dots — staggered, electric blue family */}
          <div style={{ display: "flex", gap: 7, marginBottom: 32 }}>
            {[
              { bg: "#1e4d8c", shadow: "#1e4d8c" },
              { bg: "#4a7fd4", shadow: "#4a7fd4" },
              { bg: "#8cb8f0", shadow: "#8cb8f0" },
            ].map((d, i) => (
              <span
                key={i}
                className={`al-dot al-dot-${i + 1}`}
                style={{
                  width:     5,
                  height:    5,
                  background: d.bg,
                  boxShadow: `0 0 10px ${d.shadow}`,
                }}
              />
            ))}
          </div>

          {/* Progress track */}
          <div
            style={{
              width:        "min(420px, 80vw)",
              height:       2,
              background:   "rgba(255,255,255,0.06)",
              borderRadius: 999,
              overflow:     "hidden",
              marginBottom: 15,
            }}
          >
            <div className="bar-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Label */}
          <p
            style={{
              fontSize:      10,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              color:         "rgba(255,255,255,0.26)",
              margin:        0,
              fontFamily:    "'Syne', sans-serif",
              fontWeight:    500,
            }}
          >
            Gemini AI · analyzing
          </p>

        </div>
      </div>
    </>
  );
};

export default AnalysisLoader;