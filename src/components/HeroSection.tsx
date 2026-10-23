import { Link } from "react-router-dom";
import GlowButton from "./GlowButton";

const HeroSection = () => {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 py-12">
      {/* Badge */}
      <div
        className="enter-fade-up flex items-center gap-2 rounded-[20px] border border-foreground/20 bg-foreground/10 px-4 py-2"
        style={{ animationDelay: "0.15s" }}
      >
        <span className="block w-1 h-1 rounded-full bg-foreground" />
        <span className="text-[13px] font-medium text-foreground">
          Early access for university exam prep
        </span>
      </div>

      {/* Heading — single gradient across entire text. This is the LCP element,
          so it only animates transform (never opacity) and has no delay. */}
      <h1 className="enter-rise mt-8 md:mt-10 max-w-[613px] text-[32px] sm:text-[42px] md:text-[56px] font-medium leading-[1.1] text-gradient-hero">
        Predict What Matters in Your Exams
      </h1>

      {/* Subtitle */}
      <p
        className="enter-fade-up mt-5 md:mt-6 text-[14px] md:text-[15px] font-normal text-foreground/70 max-w-[680px] leading-relaxed"
        style={{ animationDelay: "0.45s" }}
      >
        Most students waste hours scanning old papers manually. Recurra does it in seconds and only shows you what actually repeats.
      </p>

      {/* CTA */}
      <div
        className="enter-fade-up mt-8 md:mt-10"
        style={{ animationDelay: "0.65s", "--enter-scale": 0.95 } as React.CSSProperties}
      >
        <Link to="/analyze">
          <GlowButton variant="light">Generate Probables</GlowButton>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
