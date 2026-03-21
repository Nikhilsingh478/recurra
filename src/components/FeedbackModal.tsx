import { useState, useEffect, useRef, useCallback } from "react";
import { sendFeedback } from "@/utils/sendFeedback";
import { analytics } from "@/lib/analytics";

/* ── Emoji Rating ── */

const RATINGS = [
  { emoji: "😔", label: "Poor", value: 1 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😄", label: "Great", value: 4 },
  { emoji: "🤩", label: "Amazing", value: 5 },
];

const EmojiRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="
      grid grid-cols-5 gap-1.5
      rounded-2xl p-1.5
      sm:flex sm:justify-between
      "
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {RATINGS.map((r) => {
        const isActive = active === r.value;
        const isSelected = value === r.value;

        return (
          <button
            key={r.value}
            type="button"
            onMouseEnter={() => setHover(r.value)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(r.value)}
            className="
            relative flex flex-col items-center
            gap-1 rounded-xl
            py-2 px-1
            sm:px-3 sm:py-2.5
            transition-all duration-200 ease-out
            "
            style={{
              background: isSelected
                ? "rgba(59,111,212,0.12)"
                : isActive
                ? "rgba(255,255,255,0.04)"
                : "transparent",
              border: isSelected
                ? "1px solid rgba(59,111,212,0.3)"
                : "1px solid transparent",
              transform: isActive ? "scale(1.04)" : "scale(1)",
              cursor: "pointer",
            }}
            aria-label={`Rate ${r.label}`}
          >
            <span
              className="text-[20px] sm:text-2xl leading-none"
              style={{
                filter: isActive
                  ? "none"
                  : "grayscale(0.6) brightness(0.7)",
              }}
            >
              {r.emoji}
            </span>

            <span
              className="text-[8px] sm:text-[9px] font-medium tracking-wider uppercase text-center"
              style={{
                color: isSelected
                  ? "rgba(147,180,248,0.9)"
                  : isActive
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(255,255,255,0.2)",
              }}
            >
              {r.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* ── Modal Logic ── */

const STORAGE_KEY = "recurra_feedback_seen";
const SESSION_KEY = "recurra_feedback_session_id";

const getSessionId = () => {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  sessionStorage.setItem(SESSION_KEY, generated);
  return generated;
};

const FeedbackModal = () => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "entering" | "visible" | "leaving"
  >("idle");

  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [email, setEmail] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessionId = getSessionId();
    if (localStorage.getItem(STORAGE_KEY) === sessionId) return;

    const t = setTimeout(() => {
      setOpen(true);
      setPhase("entering");

      localStorage.setItem(STORAGE_KEY, sessionId);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("visible"));
      });
    }, 90000);

    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setPhase("leaving");

    setTimeout(() => {
      setOpen(false);
      setPhase("idle");
    }, 320);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  useEffect(() => {
    if (phase !== "visible") return;

    const el = modalRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      "button, input, textarea, [tabindex]"
    );

    if (focusable.length) focusable[0].focus();
  }, [phase]);

  const handleSubmit = async () => {
    if (sending) return;

    setSending(true);

    try {
      await sendFeedback({
        rating,
        liked,
        improve,
        email,
      });

      setSent(true);
      analytics.feedbackSubmitted(rating);
      setTimeout(close, 2200);
    } catch {
      setSending(false);
    }
  };

  if (!open) return null;

  const isVisible = phase === "visible";
  const isLeaving = phase === "leaving";

  return (
    <>
      {/* Overlay */}

      <div
        onClick={close}
        className="fixed inset-0 z-[9998] transition-all duration-300 ease-out"
        style={{
          background: "rgba(3,5,12,0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          opacity: isVisible ? 1 : isLeaving ? 0 : 0,
        }}
      />

      {/* Wrapper */}

      <div
        className="
        fixed inset-0 z-[9999]
        flex items-end sm:items-center
        justify-center
        p-4
        pointer-events-none
        "
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Feedback"
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto w-full transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            maxWidth: 440,
            maxHeight: "90vh",
            overflowY: "auto",

            background:
              "linear-gradient(170deg, rgba(15,23,42,0.98) 0%, rgba(8,12,24,0.99) 100%)",

            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,

            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03), 0 25px 80px -12px rgba(0,0,0,0.8), 0 0 60px -20px rgba(59,111,212,0.15)",

            willChange: "opacity, transform, filter",

            opacity: isVisible ? 1 : isLeaving ? 0 : 0,

            transform: isVisible
              ? "translate3d(0,0,0) scale(1)"
              : isLeaving
              ? "translate3d(0,8px,0) scale(0.97)"
              : "translate3d(0,24px,0) scale(0.98)",

            filter: isVisible ? "blur(0px)" : "blur(4px)",
          }}
        >
          {/* Accent line */}

          <div className="h-px w-full rounded-t-[20px] overflow-hidden">
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(59,111,212,0.4) 30%, rgba(147,180,248,0.3) 70%, transparent 100%)",
              }}
            />
          </div>

          <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-7">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(34,197,94)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div className="text-center">
                  <p className="font-heading text-lg font-semibold text-white/90">
                    Thanks for your feedback
                  </p>

                  <p
                    className="text-sm mt-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    It helps us make Recurra better.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(59,111,212,0.12)",
                        border: "1px solid rgba(59,111,212,0.2)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7ba4f0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>

                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{ color: "rgba(147,180,248,0.6)" }}
                    >
                      Feedback
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-semibold text-white/95 leading-tight">
                    How was your experience?
                  </h3>

                  <p
                    className="text-[13px] mt-1.5 leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Quick feedback helps us build a better tool for you.
                  </p>
                </div>

                {/* Rating */}

                <div className="mb-5">
                  <label
                    className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-2.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    How would you rate it?
                  </label>

                  <EmojiRating value={rating} onChange={setRating} />
                </div>

                {/* Inputs */}

                <div className="space-y-4 mb-5">
                  <div>
                    <label
                      className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-2"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      What did you like?
                    </label>

                    <textarea
                      value={liked}
                      onChange={(e) => setLiked(e.target.value)}
                      placeholder="The analysis was accurate, fast..."
                      rows={2}
                      className="fb-textarea"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-2"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      What could be better?
                    </label>

                    <textarea
                      value={improve}
                      onChange={(e) => setImprove(e.target.value)}
                      placeholder="I wish it could also..."
                      rows={2}
                      className="fb-textarea"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-2"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      Email{" "}
                      <span style={{ color: "rgba(255,255,255,0.15)" }}>
                        · optional
                      </span>
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="fb-input"
                    />
                  </div>
                </div>

                {/* Buttons */}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className="fb-submit-btn flex-1"
                  >
                    {sending ? "Sending…" : "Send Feedback"}
                  </button>

                  <button onClick={close} className="fb-skip-btn">
                    Skip
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackModal;