import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import heroVideo from "@/assets/hero.webm";

const Index = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const loadVideo = () => setVideoSrc(heroVideo);
    let id: number;
    if (typeof requestIdleCallback !== "undefined") {
      id = requestIdleCallback(loadVideo, { timeout: 500 });
      return () => cancelIdleCallback(id);
    }
    id = window.setTimeout(loadVideo, 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Static fallback — paints instantly; add hero-frame.webp to public for custom frame */}
      <div
        className="absolute inset-0 w-full h-full z-0 bg-[#000]"
        style={{
          backgroundImage: "url(/hero-frame.webp), linear-gradient(180deg, #0a0a0a 0%, #000 100%)",
          backgroundSize: "cover, cover",
          backgroundPosition: "center, center",
        }}
        aria-hidden
      />

      {/* Video — loads after mount, fades in when ready */}
      {videoSrc && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          src={videoSrc}
          className={`hero-video absolute inset-0 w-full h-full object-cover z-[1] ${
            videoReady ? "hero-video-visible" : ""
          }`}
          style={{ width: "100%", height: "100%" }}
          onLoadedData={() => setVideoReady(true)}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/50 z-[2]" />

      {/* Content */}
      <div className="relative z-[3] flex flex-col flex-1 min-h-screen">
        <Navbar />
        <HeroSection />
      </div>
    </div>
  );
};

export default Index;
