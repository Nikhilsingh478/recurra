import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * MathRenderer
 * - $$...$$ → block math (rendered as InlineMath when `inline` prop is true to stay valid inside <p>/<span>)
 * - $...$   → inline math
 * - everything else → plain text
 */
interface MathRendererProps {
  content: string;
  className?: string;
  /** If true, render block math inline (safe inside <p>/<span> parents). Default: false */
  inline?: boolean;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

const parseSegments = (input: string): Segment[] => {
  if (!input) return [];
  const out: Segment[] = [];
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(input)) !== null) {
    if (m.index > last) out.push({ type: "text", value: input.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("$$")) {
      out.push({ type: "block", value: tok.slice(2, -2).trim() });
    } else {
      out.push({ type: "inline", value: tok.slice(1, -1).trim() });
    }
    last = m.index + tok.length;
  }
  if (last < input.length) out.push({ type: "text", value: input.slice(last) });
  return out;
};

const MathRenderer: React.FC<MathRendererProps> = ({ content, className, inline = false }) => {
  const segments = parseSegments(content ?? "");

  // No math → plain text
  if (segments.length === 0 || segments.every((s) => s.type === "text")) {
    const Tag = inline ? "span" : "div";
    return <Tag className={className}>{content}</Tag>;
  }

  // Inline mode: everything stays inside a <span>, block math becomes inline math to keep HTML valid
  if (inline) {
    return (
      <span className={className}>
        {segments.map((seg, i) => {
          if (seg.type === "text") return <React.Fragment key={i}>{seg.value}</React.Fragment>;
          if (seg.type === "inline") return <InlineMath key={i} math={seg.value} />;
          return (
            <span
              key={i}
              style={{ display: "inline-block", verticalAlign: "middle", margin: "0 2px" }}
            >
              <InlineMath math={seg.value} />
            </span>
          );
        })}
      </span>
    );
  }

  // Block mode: <div> parent so <BlockMath> (which renders a <div>) is valid HTML
  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <React.Fragment key={i}>{seg.value}</React.Fragment>;
        if (seg.type === "inline") return <InlineMath key={i} math={seg.value} />;
        return (
          <div key={i} style={{ margin: "8px 0", overflowX: "auto", maxWidth: "100%" }}>
            <BlockMath math={seg.value} />
          </div>
        );
      })}
    </div>
  );
};

export default MathRenderer;
