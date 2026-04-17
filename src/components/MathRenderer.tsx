import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
  className?: string;
}

type Segment =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

const parseSegments = (content: string): Segment[] => {
  const segments: Segment[] = [];
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }

    const token = match[0];

    if (token.startsWith("$$") && token.endsWith("$$")) {
      segments.push({
        type: "block",
        value: token.slice(2, -2).trim(),
      });
    } else {
      segments.push({
        type: "inline",
        value: token.slice(1, -1).trim(),
      });
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }

  return segments;
};

const MathRenderer = ({ content, className }: MathRendererProps) => {
  const value = content ?? "";
  const segments = parseSegments(value);

  if (segments.length === 0 || segments.every((segment) => segment.type === "text")) {
    return <div className={className}>{value}</div>;
  }

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.value}</span>;
        }

        if (segment.type === "inline") {
          return <InlineMath key={index} math={segment.value} />;
        }

        return <BlockMath key={index} math={segment.value} />;
      })}
    </div>
  );
};

export default MathRenderer;
