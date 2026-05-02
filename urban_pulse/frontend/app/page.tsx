import HeroSection from "@/components/landing/hero-section";
import CapabilitiesGrid from "@/components/landing/capabilities-grid";
import WorkflowStrip from "@/components/landing/workflow-strip";
import ExploreSection from "@/components/landing/explore-section";
import ValueSection from "@/components/landing/value-section";
import FinalCta from "@/components/landing/final-cta";

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Top nav — minimal, premium */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">UP</span>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              UrbanPulse
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#capabilities" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
              How it works
            </a>
            <a href="#explore" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Explore
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/step-1"
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Start Analysis
            </a>
          </div>
        </div>
      </header>

      {/* Page offset for fixed nav */}
      <div className="pt-14">
        <HeroSection />
        <div id="capabilities">
          <CapabilitiesGrid />
        </div>
        <div id="how-it-works">
          <WorkflowStrip />
        </div>
        <div id="explore">
          <ExploreSection />
        </div>
        <ValueSection />
        <FinalCta />
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">UP</span>
            </div>
            <span className="text-xs font-semibold text-slate-600">UrbanPulse</span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-xs text-slate-400">Multi-Agent Intelligence</span>
          </div>
          <span className="text-xs text-slate-400">v0.1 · beta</span>
        </div>
      </footer>
    </div>
  );
}
