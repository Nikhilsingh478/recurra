import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Index = lazy(() => import("./pages/Index.tsx"));
const Analyze = lazy(() => import("./pages/Analyze.tsx"));
const Results = lazy(() => import("./pages/Results.tsx"));
const Docs = lazy(() => import("./pages/Docs.tsx"));
const Features = lazy(() => import("./pages/Features.tsx"));
const ProcessPage = lazy(() => import("./pages/Process.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
// Toasts are only raised from the Analyze flow, so keep Radix Toast out of the entry bundle
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));

const App = () => (
  <>
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-[#050810]" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/results" element={<Results />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/features" element={<Features />} />
          <Route path="/process" element={<ProcessPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
