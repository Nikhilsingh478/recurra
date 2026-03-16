import { useState, useEffect, useRef, useCallback } from "react";
import { sendFeedback } from "@/utils/sendFeedback";

/* ── Star Rating ── */
const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{
            transform: (hover >= i || value >= i) ? "scale(1.15)" : "scale(1)",
            transition: "transform 0.15s ease, color 0.15s ease",
            color: (hover || value) >= i ? "#f59e0b" : "rgba(255,255,255,0.15)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            lineHeight: 1,
            padding: "2px",
          }}
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

/* ── Modal ── */
const STORAGE_KEY = "recurra_feedback_seen";

const FeedbackModal = () => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Show after 90s, once per session
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 90000);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 280);
  }, []);

  // ESC key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // Focus trap
  useEffect(() => {
    if (!open || closing) return;
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>("button, input, textarea, [tabindex]");
    if (focusable.length) focusable[0].focus();
  }, [open, closing]);

  const handleSubmit = async () => {
    if (sending) return;
    setSending(true);
    try {
      await sendFeedback({ rating, liked, improve, email });
      setSent(true);
      setTimeout(close, 2000);
    } catch {
      setSending(false);
    }
  };

  if (!open) return null;

  const animStyle: React.CSSProperties = closing
    ? { opacity: 0, transform: "scale(0.97)", transition: "all 0.28s cubic-bezier(.22,1,.36,1)" }
    : { opacity: 1, transform: "translateY(0)", animation: "fbModalIn 0.35s cubic-bezier(.22,1,.36,1) forwards" };

  const overlayStyle: React.CSSProperties = {
    opacity: closing ? 0 : 1,
    transition: "opacity 0.28s ease",
  };

  return (
    <>
      <style>{`
        @keyframes fbModalIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          ...overlayStyle,
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Feedback"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 9999,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 32px)", maxWidth: 480,
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: 32,
          willChange: "opacity, transform",
          ...animStyle,
        }}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "white" }}>
              Thank you for the feedback.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 600, color: "white", margin: 0 }}>
              How was your experience?
            </h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "8px 0 24px" }}>
              Help us improve Recurra with quick feedback.
            </p>

            {/* Rating */}
            <label style={labelStyle}>Rating</label>
            <StarRating value={rating} onChange={setRating} />

            {/* Liked */}
            <label style={{ ...labelStyle, marginTop: 20 }}>What did you like?</label>
            <textarea
              value={liked}
              onChange={(e) => setLiked(e.target.value)}
              placeholder="What did you like about the analysis results?"
              rows={2}
              style={textareaStyle}
            />

            {/* Improve */}
            <label style={{ ...labelStyle, marginTop: 16 }}>What could we improve?</label>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="What could we improve?"
              rows={2}
              style={textareaStyle}
            />

            {/* Email */}
            <label style={{ ...labelStyle, marginTop: 16 }}>Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              style={inputStyle}
            />

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{
                  flex: 1, minWidth: 140, height: 40, borderRadius: 8,
                  background: "white", color: "black",
                  fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500,
                  border: "none", cursor: sending ? "wait" : "pointer",
                  opacity: sending ? 0.7 : 1,
                  transition: "background 0.18s ease, opacity 0.18s ease",
                }}
                onMouseEnter={(e) => { if (!sending) (e.target as HTMLElement).style.background = "#e5e5e5"; }}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = "white"}
              >
                {sending ? "Sending..." : "Send Feedback"}
              </button>
              <button
                onClick={close}
                style={{
                  flex: 1, minWidth: 100, height: 40, borderRadius: 8,
                  background: "transparent", color: "rgba(255,255,255,0.6)",
                  fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500,
                  border: "none", cursor: "pointer",
                  transition: "color 0.18s ease",
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = "white"}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)"}
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Inter, sans-serif",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 8,
};

const textareaStyle: React.CSSProperties = {
  width: "100%", borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.85)",
  fontFamily: "Inter, sans-serif", fontSize: 14,
  padding: "10px 14px", resize: "none",
  outline: "none",
  transition: "border-color 0.18s ease",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 40, borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.85)",
  fontFamily: "Inter, sans-serif", fontSize: 14,
  padding: "0 14px",
  outline: "none",
  transition: "border-color 0.18s ease",
};

export default FeedbackModal;
