import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const Footer = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("reveal-visible"); }),
      { threshold: 0.15 }
    );
    items.forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        footer { overflow: hidden; }

        .footer-link {
          position: relative;
          color: rgba(255,255,255,0.38);
          font-size: 0.84rem;
          text-decoration: none;
          width: fit-content;
          transition: color .25s ease, transform .25s ease;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0; bottom: -3px;
          height: 1px; width: 0%;
          background: rgba(255,255,255,0.6);
          transition: width .35s cubic-bezier(.22,1,.36,1);
        }
        .footer-link:hover { color: rgba(255,255,255,0.85); transform: translateX(3px); }
        .footer-link:hover::after { width: 100%; }

        .footer-email-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          text-decoration: none;
          transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;
          will-change: transform;
          width: fit-content;
        }
        .footer-email-btn:hover {
          background: rgba(59,111,212,0.1);
          border-color: rgba(59,111,212,0.3);
          color: rgba(147,180,248,0.9);
          transform: translateY(-1px);
        }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          filter: blur(8px);
          transition:
            opacity .9s cubic-bezier(.22,1,.36,1),
            transform .9s cubic-bezier(.22,1,.36,1),
            filter .9s cubic-bezier(.22,1,.36,1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); filter: blur(0); }
      `}</style>

      <footer
        ref={ref}
        className="relative border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#050810" }}
      >
        <div className="mx-auto max-w-[1400px] px-6 sm:px-12 py-20">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">

            {/* Brand */}
            <div className="reveal">
              <Link
                to="/"
                className="inline-block text-white mb-4 font-bold tracking-wider"
                style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem" }}
              >
                RECURRA
              </Link>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.34)", lineHeight: 1.8, maxWidth: 300 }}>
                AI-powered exam pattern intelligence for university students.
                Predict what matters. Prepare with focus.
              </p>
            </div>

            {/* Navigation */}
            <div className="reveal">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginBottom: 18 }}>
                Navigation
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Analyze",  to: "/analyze" },
                  { label: "Process",  to: "/process" },
                  { label: "Features", to: "/features" },
                  { label: "Docs",     to: "/docs" },
                ].map(l => (
                  <Link key={l.to} to={l.to} className="footer-link">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="reveal">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginBottom: 18 }}>
                Contact
              </p>
              <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.32)", lineHeight: 1.75, marginBottom: 20, maxWidth: 260 }}>
                Have feedback, suggestions, or found a bug?
                We'd love to hear from you.
              </p>
              <a
                href="mailto:recurraofficial@gmail.com"
                className="footer-email-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 7l-10 7L2 7"/>
                </svg>
                recurraofficial@gmail.com
              </a>
            </div>

          </div>

          {/* Bottom row */}
          <div
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-10 reveal"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} Recurra. Built for university students.
            </p>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.18)" }}>
              Powered by Gemini AI
            </p>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;