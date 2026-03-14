import { motion } from "framer-motion";
import GlowButton from "./GlowButton";

const HeroSection = () => {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 py-12">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 rounded-[20px] border border-foreground/20 bg-foreground/10 px-4 py-2"
      >
        <span className="block w-1 h-1 rounded-full bg-foreground" />
        <span className="text-[13px] font-medium">
          <span className="text-foreground/60">Early access available from</span>
          <span className="text-foreground"> May 1, 2026</span>
        </span>
      </motion.div>

      {/* Heading — word-by-word blur reveal */}
      <h1 className="mt-8 md:mt-10 max-w-[613px] text-[32px] sm:text-[42px] md:text-[56px] font-medium leading-[1.28]">
        {"Web3 at the Speed of Experience".split(" ").map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: "blur(16px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.6 + i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block text-gradient-hero mr-[0.3em]"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 md:mt-6 text-[14px] md:text-[15px] font-normal text-foreground/70 max-w-[680px] leading-relaxed"
      >
        Powering seamless experiences and real-time connections, EOS is the base for creators who move with purpose, leveraging resilience, speed, and scale to shape the future.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 md:mt-10"
      >
        <GlowButton variant="light">Join Waitlist</GlowButton>
      </motion.div>
    </section>
  );
};

export default HeroSection;
