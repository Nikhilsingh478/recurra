import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import heroVideo from "@/assets/hero.webm";

const posterDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%23000' width='16' height='9'/%3E%3C/svg%3E";

const Index = () => {
  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-background">
      {/* Background Video — native element for LCP; poster enables instant paint */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        fetchPriority="high"
        poster={posterDataUrl}
        className="hero-video absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={heroVideo} type="video/webm" />
      </video>

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
