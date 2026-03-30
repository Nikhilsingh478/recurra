import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScrollReveal from "@/components/ScrollReveal";
import Magnet from "@/components/Magnet";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import Footer from "@/components/Footer";
import heroVideo from "@/assets/hero.webm";

/* ── Reveal hook ── */
const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return { ref, visible };
};

const rs = (visible: boolean, delay = 0): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "translate3d(0,0,0)" : "translate3d(0,12px,0)",
  transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  willChange: "opacity, transform",
});

/* ════════════════════════════════════════════ */
const Index = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Lazy load video */
  useEffect(() => {
    const load = () => setVideoSrc(heroVideo);
    let id: number;
    if (typeof requestIdleCallback !== "undefined") {
      id = requestIdleCallback(load, { timeout: 500 });
      return () => cancelIdleCallback(id);
    }
    id = window.setTimeout(load, 100);
    return () => clearTimeout(id);
  }, []);

  /* Parallax on hero video — passive, rAF throttled */
  useEffect(() => {
    let rafId: number;
    let scheduled = false;
    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(() => {
          const el = videoRef.current;
          if (el) el.style.transform = `translate3d(0, ${window.scrollY * 0.38}px, 0)`;
          scheduled = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  const ctaReveal   = useReveal(0);
  const statsReveal = useReveal(0);
  const procReveal  = useReveal(0);

  return (
    <>
      <Helmet>
        <title>Recurra: Find Repeating Questions in Your University Exam Papers</title>
        <meta name="description" content="Recurra analyzes your university syllabus and previous year papers using AI to find which questions repeat most. Get unit-wise high-probability exam questions in under a minute. Free for students." />
        <link rel="canonical" href="https://recurraio.vercel.app/" />
      </Helmet>
      <style>{`
        .hero-video { opacity:0; transition:opacity 0.8s ease; }
        .hero-video-visible { opacity:1; }

        /* ── Stack card themes (single accent color) ── */
        .sc-01 {
          background: rgba(8,16,40,0.97);
          border: 1px solid rgba(59,111,212,0.18);
        }
        .sc-02 {
          background: rgba(8,16,40,0.97);
          border: 1px solid rgba(59,111,212,0.18);
        }
        .sc-03 {
          background: rgba(8,16,40,0.97);
          border: 1px solid rgba(59,111,212,0.18);
        }

        /* ── Stat col dividers ── */
        .stat-col + .stat-col { border-left:1px solid rgba(255,255,255,0.06); }
        @media(max-width:640px){
          .stat-col + .stat-col { border-left:none; border-top:1px solid rgba(255,255,255,0.06); }
        }

        /* ── Magnet CTA ── */
        .magnet-cta {
          display:inline-flex; align-items:center; justify-content:center;
          height:54px; padding:0 36px; border-radius:999px;
          font-size:0.95rem; font-weight:600;
          color:#050810;
          background:#fff;
          text-decoration:none;
          transition:transform 0.22s ease, box-shadow 0.22s ease;
          will-change:transform; cursor:pointer; border:none;
          position:relative; overflow:hidden;
        }
        .magnet-cta::after {
          content: "";
          position:absolute; top:0; left:-100%;
          width:50%; height:100%;
          background:linear-gradient(90deg, transparent, rgba(220,232,255,0.8), transparent);
          animation:shimmer 3s infinite linear;
          transform: skewX(-20deg);
        }
        @keyframes shimmer {
          0%  { transform: skewX(-20deg) translateX(0); }
          100%{ transform: skewX(-20deg) translateX(400%); }
        }
        .magnet-cta span { position:relative; z-index:2; }
        .magnet-cta:hover {
          box-shadow:0 8px 40px rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.4);
        }

        /* ── ScrollReveal text ── */
        .sr-stmt p {
          color:rgba(255,255,255,0.82) !important;
          font-size:clamp(1.7rem,3.8vw,3rem) !important;
          line-height:1.18 !important;
          font-weight:500 !important;
        }

        /* ── Shared label ── */
        .sec-label {
          font-size:10px; font-weight:700; text-transform:uppercase;
          letter-spacing:0.2em; color:rgba(255,255,255,0.6);
        }
      `}</style>

      <div className="relative w-full min-h-screen flex flex-col overflow-x-hidden" style={{ background:"#050810" }}>

        {/* ─────── HERO ─────── */}
        <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-[#000]">
          <div
            className="absolute inset-0 w-full h-full z-0"
            style={{
              backgroundImage:"url(/hero-frame.webp), linear-gradient(180deg,#0a0a0a 0%,#000 100%)",
              backgroundSize:"cover,cover",
              backgroundPosition:"center,center",
            }}
            aria-hidden
          />
          {videoSrc && (
            <video
              ref={videoRef}
              autoPlay loop muted playsInline preload="none" src={videoSrc}
              className={`hero-video absolute inset-0 w-full object-cover z-[1]${videoReady ? " hero-video-visible" : ""}`}
              style={{ width:"100%", height:"110%", top:0 }}
              onLoadedData={() => setVideoReady(true)}
            >
              <track kind="captions" />
            </video>
          )}
          <div className="absolute inset-0 bg-background/50 z-[2]" />
          <div className="relative z-[3] flex flex-col flex-1 min-h-screen">
            <Navbar />
            <HeroSection />
          </div>
        </div>

        {/* ─────── SCROLL REVEAL STATEMENT ─────── */}
        <section className="mx-auto w-full max-w-[900px] px-5 sm:px-10 py-24 sm:py-36">
          <p className="sec-label mb-8">WHY IT EXISTS</p>
          <ScrollReveal
            baseOpacity={0}
            enableBlur
            baseRotation={2}
            blurStrength={5}
            containerClassName="sr-stmt"
            wordAnimationEnd="center center"
          >
            Students waste hours manually scanning old papers trying to guess what's coming. Recurra does that in seconds and shows you only what actually repeats.
          </ScrollReveal>
        </section>

        {/* ─────── THE PROCESS — SCROLL STACK ─────── */}
        <section className="w-full pb-24 sm:pb-32">

          {/* Heading */}
          <div ref={procReveal.ref} className="mx-auto max-w-[900px] px-5 sm:px-10 pb-12">
            <div
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
            >
              <div style={rs(procReveal.visible, 0)}>
                <p className="sec-label mb-4">The Process</p>
                <h2
                  style={{
                    fontWeight: 600,
                    fontSize: "clamp(2rem,5vw,3.4rem)",
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Three steps.
                  <br />
                  <span style={{ color:"rgba(255,255,255,0.65)" }}>That's all it takes.</span>
                </h2>
              </div>
              <p
                style={{
                  ...rs(procReveal.visible, 80),
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.75,
                  maxWidth: 260,
                  paddingBottom: 4,
                }}
              >
                Input your material.
                Let Recurra find the patterns.
                Walk into your exam prepared.
              </p>
            </div>
          </div>

          {/* Stack */}
          <div className="mx-auto max-w-[900px] px-5 sm:px-10">
            <ScrollStack>

              <ScrollStackItem className="sc-01">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.22em", color:"rgba(147,180,248,0.85)", marginBottom:18 }}>
                      01: Input
                    </p>
                    <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:"clamp(1.4rem,3vw,2rem)", color:"rgba(255,255,255,0.9)", lineHeight:1.18, marginBottom:12 }}>
                      Paste Your Syllabus
                      <br />&amp; Previous Papers
                    </h3>
                    <p style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.7)", lineHeight:1.75, maxWidth:460 }}>
                      Raw text. No formatting required. Recurra handles the rest.
                      The more years of papers you add, the sharper the predictions.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["Syllabus","Question Papers"].map(t => (
                      <span key={t} className="rounded-full" style={{ padding:"4px 12px", fontSize:11, color:"rgba(180,205,250,0.9)", background:"rgba(59,111,212,0.07)", border:"1px solid rgba(59,111,212,0.16)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem className="sc-02">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.22em", color:"rgba(147,180,248,0.85)", marginBottom:18 }}>
                      02: Analyze
                    </p>
                    <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:"clamp(1.4rem,3vw,2rem)", color:"rgba(255,255,255,0.9)", lineHeight:1.18, marginBottom:12 }}>
                      Gemini AI Maps
                      <br />Every Pattern
                    </h3>
                    <p style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.7)", lineHeight:1.75, maxWidth:460 }}>
                      Frequency counting. Syllabus filtering. Priority ranking.
                      All in under a minute, not a generic dump, a structured analysis.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["Frequency counted","Syllabus filtered","Priority ranked"].map(t => (
                      <span key={t} className="rounded-full" style={{ padding:"4px 12px", fontSize:11, color:"rgba(180,205,250,0.9)", background:"rgba(59,111,212,0.07)", border:"1px solid rgba(59,111,212,0.16)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem className="sc-03">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.22em", color:"rgba(147,180,248,0.85)", marginBottom:18 }}>
                      03: Prepare
                    </p>
                    <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:"clamp(1.4rem,3vw,2rem)", color:"rgba(255,255,255,0.9)", lineHeight:1.18, marginBottom:12 }}>
                      Unit-wise Probables.
                      <br />Only What Matters.
                    </h3>
                    <p style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.7)", lineHeight:1.75, maxWidth:460 }}>
                      Results organized by unit, ranked by frequency.
                      The must-prepare list is your shortest path to exam day confidence.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["Unit-wise","Strategy","Must Prepare List"].map(t => (
                      <span key={t} className="rounded-full" style={{ padding:"4px 12px", fontSize:11, color:"rgba(180,205,250,0.9)", background:"rgba(59,111,212,0.07)", border:"1px solid rgba(59,111,212,0.16)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </ScrollStackItem>

            </ScrollStack>
          </div>
        </section>

        {/* ─────── STATS ─────── */}
        <section className="mx-auto w-full max-w-[900px] px-5 sm:px-10 py-16 sm:py-24">
          <div
            ref={statsReveal.ref}
            className="grid grid-cols-1 sm:grid-cols-3 gap-0 rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(255,255,255,0.055)", background:"rgba(255,255,255,0.018)" }}
          >
            {[
              { num:"< 1m", label:"From paste to results" },
              { num:"8",     label:"Max questions per unit" },
              { num:"4",     label:"Result sections" },
            ].map((s, i) => (
              <div key={i} className="stat-col text-center py-10 px-6">
                <p style={{
                  fontFamily:"Syne,sans-serif", fontWeight:700,
                  fontSize:"clamp(2rem,5vw,2.8rem)", color:"rgba(255,255,255,0.9)",
                  lineHeight:1, marginBottom:8,
                  opacity: statsReveal.visible ? 1 : 0,
                  transition:`opacity 0.7s ease ${i * 110}ms`,
                }}>{s.num}</p>
                <p style={{
                  fontSize:"0.8rem", color:"rgba(255,255,255,0.65)",
                  opacity: statsReveal.visible ? 1 : 0,
                  transition:`opacity 0.7s ease ${i * 110 + 90}ms`,
                }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────── CTA ─────── */}
        <section className="mx-auto w-full max-w-[700px] px-5 sm:px-10 py-16 sm:py-24 text-center">
          <div ref={ctaReveal.ref}>
            <p style={{ ...rs(ctaReveal.visible,0), fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em", color:"rgba(255,255,255,0.6)", marginBottom:20 }}>
              READY
            </p>
            <h2 style={{ ...rs(ctaReveal.visible,60), fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:"clamp(1.8rem,5vw,3rem)", color:"rgba(255,255,255,0.9)", lineHeight:1.18, marginBottom:16, letterSpacing:"-0.01em" }}>
              Stop guessing.
              <br />
              <span style={{ color:"rgba(255,255,255,0.65)" }}>Start predicting.</span>
            </h2>
            <p style={{ ...rs(ctaReveal.visible,120), fontSize:"0.92rem", color:"rgba(255,255,255,0.65)", lineHeight:1.75, maxWidth:380, margin:"0 auto 36px" }}>
              Paste your syllabus and previous year papers.
              <br />Recurra does the rest in under a minute.
            </p>
            <div style={rs(ctaReveal.visible,180)}>
              <Magnet padding={60} magnetStrength={3}>
                <Link to="/analyze" className="magnet-cta">
                  <span>Generate Probables →</span>
                </Link>
              </Magnet>
            </div>
          </div>
        </section>

        {/* ─────── SEO TEXT SECTION ─────── */}
        <section
          style={{
            background: "rgba(255,255,255,0.012)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="mx-auto max-w-[900px] px-5 sm:px-10 py-14 sm:py-16">
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.2)",
                marginBottom: 20,
              }}
            >
              About Recurra
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h2
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  AI-Powered Exam Pattern Analysis for University Students
                </h2>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.25)",
                    lineHeight: 1.8,
                  }}
                >
                  Recurra is a free AI tool that helps university students
                  identify which questions are most likely to appear in their
                  upcoming exams. By analyzing previous year question papers
                  against your subject syllabus, Recurra finds patterns, counts
                  how often each question or topic repeats, and generates a
                  ranked list of high-probability exam questions organized
                  unit-wise.
                </p>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  Previous Year Paper Analysis in Under a Minute
                </h2>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.25)",
                    lineHeight: 1.8,
                  }}
                >
                  Students using Recurra paste their syllabus and previous year
                  papers as plain text. Gemini AI then maps every question to
                  its syllabus unit, counts its frequency across exam years,
                  and ranks it by priority. The result is a structured,
                  syllabus-filtered list of probable exam questions, not a
                  generic dump, but a focused preparation guide that helps
                  students study smarter before their university exams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────── FOOTER ─────── */}
        <Footer />
      </div>
    </>
  );
};

export default Index;