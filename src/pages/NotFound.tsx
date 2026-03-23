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
          height:54px; padding:0 36px; border-radius:999px;
          font-size:0.95rem; font-weight:600;
          color:#050810;
          background:#fff;
          text-decoration:none;
          transition:transform 0.22s ease, box-shadow 0.22s ease;
          will-change:transform; cursor:pointer; border:none;
        }
        .magnet-cta:hover {
          box-shadow:0 8px 40px rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.4);
        }
      `}</style>

      <div className="relative min-h-screen w-full flex flex-col bg-[#050810] font-body overflow-hidden">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 pb-20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#3b6fd4] mb-4">
            Error 404
          </p>
          <h1 className="font-heading font-bold text-white text-[clamp(2.5rem,6vw,4.5rem)] leading-none mb-6 tracking-tight">
            Lost in the <br/>
            <span className="text-white/40">Syllabus.</span>
          </h1>
          <p className="text-[0.95rem] text-white/50 max-w-[380px] leading-relaxed mb-10 mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back to predicting questions.
          </p>
          
          <Magnet padding={60} magnetStrength={3}>
            <Link to="/" className="magnet-cta">
              Return Home →
            </Link>
          </Magnet>
        </div>
        
        {/* Subtle gradient background identical to other pages */}
        <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-b from-transparent to-[#0a1226]/20 pointer-events-none" />
      </div>
    </>
  );
};

export default NotFound;
