import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Magnet from "@/components/Magnet";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Document not found:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Recurra</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <style>{`
        .magnet-cta {
          display:inline-flex; align-items:center; justify-content:center;
          height:56px; padding:0 40px; border-radius:999px;
          font-size:0.95rem; font-weight:600;
          color:#050810;
          background:linear-gradient(180deg,#ffffff,#e6ecff);
          text-decoration:none;
          transition:all 0.25s cubic-bezier(0.22,1,0.36,1);
          will-change:transform; cursor:pointer; border:none;
          box-shadow:0 4px 20px rgba(255,255,255,0.08);
        }
        .magnet-cta:hover {
          transform:translateY(-2px) scale(1.03);
          box-shadow:0 12px 50px rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.5);
        }

        .bg-glow {
          position:absolute;
          width:500px;
          height:500px;
          background:radial-gradient(circle at center, rgba(59,111,212,0.18), transparent 70%);
          filter:blur(80px);
          z-index:0;
        }

        .grain {
          position:absolute;
          inset:0;
          background-image:url("https://www.transparenttextures.com/patterns/noise.png");
          opacity:0.04;
          pointer-events:none;
        }
      `}</style>

      <div className="relative min-h-screen w-full flex flex-col bg-[#050810] font-body overflow-hidden">
        <Navbar />

        {/* ambient glow */}
        <div className="bg-glow top-[20%] left-[50%] -translate-x-1/2" />
        <div className="grain" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 pb-20">
          
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#3b6fd4] mb-5 opacity-80">
            Error 404
          </p>

          <h1 className="font-heading font-bold text-white text-[clamp(2.8rem,6vw,4.8rem)] leading-[1.05] mb-6 tracking-tight">
            Lost in the <br/>
            <span className="text-white/30">Syllabus.</span>
          </h1>

          <p className="text-[0.95rem] text-white/50 max-w-[420px] leading-relaxed mb-12 mx-auto">
            The page you're looking for doesn’t exist or has been moved. 
            Let’s get you back to predicting questions with precision.
          </p>
          
          <Magnet padding={70} magnetStrength={3.5}>
            <Link to="/" className="magnet-cta">
              Return Home →
            </Link>
          </Magnet>
        </div>
        
        {/* bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-b from-transparent to-[#0a1226]/30 pointer-events-none" />
      </div>
    </>
  );
};

export default NotFound;