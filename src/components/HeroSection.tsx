import GlowButton from "./GlowButton";

const HeroSection = () => {
  return (
    <section className="relative z-10 flex flex-col items-center text-center pt-[200px] md:pt-[280px] pb-[102px] px-6">
      {/* Badge */}
      <div className="flex items-center gap-2 rounded-[20px] border border-foreground/20 bg-foreground/10 px-4 py-2">
        <span className="block w-1 h-1 rounded-full bg-foreground" />
        <span className="text-[13px] font-medium">
          <span className="text-foreground/60">Early access available from</span>
          <span className="text-foreground"> May 1, 2026</span>
        </span>
      </div>

      {/* Heading */}
      <h1 className="mt-10 text-gradient-hero text-[36px] md:text-[56px] font-medium leading-[1.28] max-w-[613px]">
        Web3 at the Speed of Experience
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-[15px] font-normal text-foreground/70 max-w-[680px]">
        Powering seamless experiences and real-time connections, EOS is the base for creators who move with purpose, leveraging resilience, speed, and scale to shape the future.
      </p>

      {/* CTA */}
      <div className="mt-10">
        <GlowButton variant="light">Join Waitlist</GlowButton>
      </div>
    </section>
  );
};

export default HeroSection;
