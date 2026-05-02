"use client";

interface Step {
  readonly num: number;
  readonly label: string;
}

interface StepDotProps {
  s: Step;
  isLast: boolean;
  isIdle: boolean;
  viewingStep: number;
  visitedSteps: Set<number>;
  onClickStep: (n: number) => void;
}

function StepDot({ s, isLast, isIdle, viewingStep, visitedSteps, onClickStep }: StepDotProps) {
  const visited = visitedSteps.has(s.num);
  const viewing = s.num === viewingStep;
  const clickable = !isIdle;

  const dotCls = visited  ? "bg-emerald-500 text-white"
               : viewing  ? "bg-amber-500 text-white ring-4 ring-amber-100"
               : "bg-amber-400 text-white";

  const labelCls = visited ? "text-emerald-600"
                 : viewing ? "text-amber-700 font-semibold"
                 : "text-amber-600";

  const dotEl = (
    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${dotCls}`}>
      {visited ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span>{s.num}</span>
      )}
    </div>
  );

  const labelEl = (
    <span className={`text-[10px] font-medium mt-2 text-center leading-tight max-w-[80px] block ${labelCls}`}>
      {s.label}
    </span>
  );

  const inner = (
    <div className="flex flex-col items-center">
      {dotEl}
      {labelEl}
    </div>
  );

  return (
    <div className="flex items-start shrink-0">
      {clickable ? (
        <button type="button" onClick={() => onClickStep(s.num)} className="flex flex-col items-center hover:opacity-80 transition-opacity">
          {inner}
        </button>
      ) : inner}
      {!isLast && (
        <div className={`h-px w-8 mt-[22px] mx-1 shrink-0 transition-colors ${visited ? "bg-emerald-300" : "bg-amber-200"}`} />
      )}
    </div>
  );
}

interface PipelineStatusBarProps {
  steps: readonly Step[];
  isIdle: boolean;
  isComplete: boolean;
  localProgress: number;
  visitedSteps: Set<number>;
  viewingStep: number;
  onClickStep: (n: number) => void;
}

export default function PipelineStatusBar({
  steps,
  isIdle,
  isComplete,
  localProgress,
  visitedSteps,
  viewingStep,
  onClickStep,
}: PipelineStatusBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-6 pt-6 pb-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5">
        Pipeline Progress
      </p>
      <div className="flex items-start overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <StepDot
            key={s.num}
            s={s}
            isLast={i === steps.length - 1}
            isIdle={isIdle}
            viewingStep={viewingStep}
            visitedSteps={visitedSteps}
            onClickStep={onClickStep}
          />
        ))}
      </div>

      {!isIdle && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Overall Progress
            </span>
            <span className="text-[10px] font-bold tabular-nums text-slate-600">{localProgress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${localProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
