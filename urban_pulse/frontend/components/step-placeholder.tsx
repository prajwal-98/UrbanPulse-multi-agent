import Link from "next/link";

interface StepInfo {
  num: number;
  agent: string;
  label: string;
  description: string;
  inputs: string[];
  outputs: string[];
  nextHref?: string;
  nextLabel?: string;
}

export default function StepPlaceholder({ step }: { step: StepInfo }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {step.num}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {step.agent} · Analysis Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step.label}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Status card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="h-[3px] bg-gradient-to-r from-slate-300 via-slate-200 to-slate-100" />
          <div className="p-10 flex flex-col items-center text-center gap-6">
            {/* Agent badge */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-500 tracking-tight">
                {step.agent}
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Awaiting Data
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                {step.label}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                {step.description}
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Upload Data to Begin
              <span className="text-slate-400">→</span>
            </Link>
          </div>
        </div>

        {/* I/O schema */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Agent Inputs
            </p>
            <div className="flex flex-col gap-2">
              {step.inputs.map((inp) => (
                <div
                  key={inp}
                  className="flex items-center gap-2.5 text-sm text-slate-600"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  {inp}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
              Agent Outputs
            </p>
            <div className="flex flex-col gap-2">
              {step.outputs.map((out) => (
                <div
                  key={out}
                  className="flex items-center gap-2.5 text-sm text-slate-600"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {out}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline position */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
            Pipeline Position
          </p>
          <div className="flex items-center gap-1 overflow-x-auto">
            {["A1", "A2", "A3", "A4", "A5", "A6", "A7", "★"].map((a, i) => {
              const agentNum = i + 1;
              const isCurrent = a === step.agent;
              const isPast = agentNum < step.num;
              const isFinal = a === "★";
              return (
                <div key={a} className="flex items-center gap-1 shrink-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold
                      ${
                        isCurrent
                          ? "bg-slate-900 text-white"
                          : isPast
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : isFinal
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-slate-100 text-slate-400"
                      }`}
                  >
                    {a}
                  </div>
                  {!isFinal && (
                    <div
                      className={`w-5 h-px ${
                        isPast || isCurrent ? "bg-slate-300" : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
