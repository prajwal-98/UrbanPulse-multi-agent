interface Props {
  evidence: string[];
}

export default function CustomerEvidence({ evidence }: Props) {
  return (
    <div className="flex-1">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
        Customer Evidence
      </p>
      <div className="flex flex-col gap-3.5">
        {evidence.slice(0, 4).map((text, i) => (
          <div
            key={i}
            className="group bg-white rounded-xl border border-slate-200 p-6 relative overflow-hidden hover:border-slate-300 transition-colors duration-150"
          >
            {/* Decorative quote — bigger, more visible */}
            <span
              className="absolute top-2 right-4 text-7xl text-slate-100 font-serif leading-none select-none pointer-events-none"
              aria-hidden
            >
              &ldquo;
            </span>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                R{i + 1}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Customer Review
              </span>
              {/* Negative signal dot */}
              <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Negative signal
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed italic relative z-10">
              &ldquo;{text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
