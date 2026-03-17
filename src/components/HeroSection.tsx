import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlowButton from "./GlowButton";

const HeroSection = () => {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 py-12">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 rounded-[20px] border border-foreground/20 bg-foreground/10 px-4 py-2"
      >
        <span className="block w-1 h-1 rounded-full bg-foreground" />
        <span className="text-[13px] font-medium text-foreground">
          Early access for university exam prep
        </span>
      </motion.div>

      {/* Heading — single gradient across entire text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 md:mt-10 max-w-[613px] text-[32px] sm:text-[42px] md:text-[56px] font-medium leading-[1.1] text-gradient-hero"
      >
        Predict What Matters in Your Exams
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 md:mt-6 text-[14px] md:text-[15px] font-normal text-foreground/70 max-w-[680px] leading-relaxed"
      >
        Most students waste hours scanning old papers manually. Recurra does it in seconds and only shows you what actually repeats.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.0, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 md:mt-10"
      >
        <Link to="/analyze">
          <GlowButton variant="light">Generate Probables</GlowButton>
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
