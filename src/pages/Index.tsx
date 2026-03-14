import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/50 z-[1]" />

      {/* Content */}
      <div className="relative z-[2]">
        <Navbar />
        <HeroSection />
      </div>
    </div>
  );
};

export default Index;
