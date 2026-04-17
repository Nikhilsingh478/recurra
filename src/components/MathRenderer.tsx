import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * MathRenderer
 * - Detects $$...$$ (block) and $...$ (inline) math segments
 * - Renders math via KaTeX, plain text as-is
 * - Safe fallback to raw text if KaTeX throws
 */
interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean; // if true, render block math inline-style (no <div>)
}

type Segment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

const parseSegments = (input: string): Segment[] => {
  if (!input) return [];
  const segments: Segment[] = [];
  // Match $$...$$ first, then $...$
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: input.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith("$$") && token.endsWith("$$")) {
      segments.push({ type: "block", value: token.slice(2, -2).trim() });
    } else {
      segments.push({ type: "inline", value: token.slice(1, -1).trim() });
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < input.length) {
    segments.push({ type: "text", value: input.slice(lastIndex) });
  }
  return segments;
};

const SafeInline: React.FC<{ value: string }> = ({ value }) => {
  try {
    return <InlineMath math={value} />;
  } catch {
    return <span>${value}$</span>;
  }
};

const SafeBlock: React.FC<{ value: string; inline?: boolean }> = ({ value, inline }) => {
  try {
    if (inline) {
      // render block math but inline-flow (avoid breaking parent text layout)
      return (
        <span style={{ display: "inline-block", verticalAlign: "middle", margin: "0 2px" }}>
          <InlineMath math={value} />
        </span>
      );
    }
    return (
      <span style={{ display: "block", margin: "8px 0", overflowX: "auto", maxWidth: "100%" }}>
        <BlockMath math={value} />
      </span>
    );
  } catch {
    return <span>$${value}$$</span>;
  }
};

const MathRenderer: React.FC<MathRendererProps> = ({ content, className, inline }) => {
  const segments = parseSegments(content ?? "");

  // Fast path: no math at all
  if (segments.length === 0 || segments.every((s) => s.type === "text")) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <React.Fragment key={i}>{seg.value}</React.Fragment>;
        if (seg.type === "inline") return <SafeInline key={i} value={seg.value} />;
        return <SafeBlock key={i} value={seg.value} inline={inline} />;
      })}
    </span>
  );
};

export default MathRenderer;
