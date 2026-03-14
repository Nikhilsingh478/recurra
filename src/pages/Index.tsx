import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import heroVideo from "@/assets/hero.webm";

const Index = () => {
  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-background">
      {/* Background Video */}
      <motion.video
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={heroVideo} type="video/webm" />
      </motion.video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/50 z-[1]" />

      {/* Content */}
      <div className="relative z-[2] flex flex-col h-full">
        <Navbar />
        <HeroSection />
      </div>
    </div>
  );
};

export default Index;
