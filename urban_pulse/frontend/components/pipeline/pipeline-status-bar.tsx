"use client";

import React, { useEffect, useRef, useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
interface Step {
  readonly num: number;
  readonly label: string;
  readonly agent?: string;  // e.g. "A1" – shown in the pill
  readonly href?: string;   // optional – used by Link variant
  readonly short?: string;  // short label shown below pill
}

type StepStatus = "complete" | "running" | "error" | "pending";

export interface PipelineStatusBarProps {
  steps: readonly Step[];
  /** 1-based index of the step currently executing (0 = none/idle) */
  currentStepNum: number;
  /** which step's content panel is visible */
  viewingStep: number;
  /** set of step numbers already visited */
  visitedSteps: Set<number>;
  isIdle: boolean;
  isComplete: boolean;
  isError?: boolean;
  /** 0–100 */
  localProgress: number;
  onClickStep: (n: number) => void;
}

/* ─── Helpers ───────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

/* ─── StepPill ───────────────────────────────────────────── */
interface StepPillProps {
  step: Step;
  status: StepStatus;
  isViewing: boolean;
  isClickable: boolean;
  onClickStep: (n: number) => void;
}

function StepPill({ step, status, isViewing, isClickable, onClickStep }: StepPillProps) {
  const done    = status === "complete";
  const running = status === "running";
  const error   = status === "error";
  const pending = status === "pending";

  const color = {
    complete: { bg: "#059669", border: "#059669", text: "#fff", glow: "#05966930" },
    running:  { bg: "#d97706", border: "#d97706", text: "#fff", glow: "#d9770630" },
    error:    { bg: "#dc2626", border: "#dc2626", text: "#fff", glow: "#dc262630" },
    pending:  { bg: "#f1f5f9", border: "#e2e8f0", text: "#94a3b8", glow: "transparent" },
  }[status];

  const labelColor = done ? "#059669" : running ? "#d97706" : error ? "#dc2626" : "#94a3b8";

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => isClickable && onClickStep(step.num)}
      title={step.label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: isClickable ? "pointer" : "default",
        opacity: pending && !isViewing ? 0.55 : 1,
        transition: "opacity 0.2s",
        background: "none",
        border: "none",
        padding: 0,
      }}
    >
      {/* Circle node */}
      <div
        style={{
          position: "relative",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: color.bg,
          border: `2px solid ${color.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isViewing ? `0 0 0 4px ${color.glow}` : "none",
          transition: "all 0.25s",
          flexShrink: 0,
        }}
      >
        {/* Pulse ring */}
        {running && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: `2px solid ${color.border}`,
              animation: "up-pulse-ring 1.5s ease-out infinite",
            }}
          />
        )}

        {/* Inner content */}
        {running ? (
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2.5px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              display: "block",
              animation: "up-spin 0.75s linear infinite",
            }}
          />
        ) : done ? (
          <CheckIcon />
        ) : error ? (
          <WarningIcon />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: 11,
              fontWeight: 700,
              color: color.text,
              letterSpacing: "-0.02em",
            }}
          >
            {step.agent ?? `A${step.num}`}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 9,
          fontWeight: isViewing ? 700 : 500,
          color: labelColor,
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: 72,
          display: "block",
          letterSpacing: "0.01em",
          transition: "color 0.2s",
        }}
      >
        {step.short ?? step.label}
      </span>
    </button>
  );
}

/* ─── Connector ──────────────────────────────────────────── */
function Connector({ filled }: { filled: boolean }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 20,
        height: 2,
        borderRadius: 99,
        background: filled ? "#059669" : "#e2e8f0",
        marginBottom: 20,
        transition: "background 0.4s ease",
      }}
    />
  );
}

/* ─── PipelineStatusBar ──────────────────────────────────── */
export default function PipelineStatusBar({
  steps,
  currentStepNum,
  viewingStep,
  visitedSteps,
  isIdle,
  isComplete,
  isError = false,
  localProgress,
  onClickStep,
}: PipelineStatusBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getStatus = (s: Step): StepStatus => {
    if (isIdle) return "pending";
    if (isComplete) return "complete";
    const done = visitedSteps.has(s.num) || s.num < currentStepNum;
    if (done) return "complete";
    if (s.num === currentStepNum) return isError ? "error" : "running";
    return "pending";
  };

  const completedCount = steps.filter(s => getStatus(s) === "complete").length;
  const activeStep = steps.find(s => s.num === currentStepNum);
  const progressColor = isComplete ? "#059669" : isError ? "#dc2626" : "#d97706";
  const progressGradient = isComplete
    ? "linear-gradient(90deg,#059669,#34d399)"
    : isError
    ? "linear-gradient(90deg,#dc2626,#f87171)"
    : "linear-gradient(90deg,#d97706,#fbbf24)";

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes up-spin { to { transform: rotate(360deg); } }
        @keyframes up-pulse-ring {
          0%,100% { opacity:.6; transform:scale(1); }
          50%      { opacity:0; transform:scale(1.65); }
        }
        @keyframes up-slide-down {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: scrolled ? "rgba(255,255,255,0.95)" : "#ffffff",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
          transition: "box-shadow 0.25s ease, backdrop-filter 0.25s ease",
        }}
      >
        {/* ── Progress rail ── */}
        <div
          style={{
            height: 3,
            background: "#f1f5f9",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: isIdle ? "0%" : `${localProgress}%`,
              background: progressGradient,
              transition: "width 0.6s ease",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>

        {/* ── Main content ── */}
        <div style={{ padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 0 10px",
            }}
          >
            {/* Left: brand mark + status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div style={{ lineHeight: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                  }}
                >
                  UrbanPulse
                </div>
                {!isIdle && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isComplete ? "#059669" : isError ? "#dc2626" : "#475569",
                      marginTop: 2,
                    }}
                  >
                    {isComplete
                      ? "All agents complete"
                      : isError
                      ? `Error on A${currentStepNum}`
                      : `Running A${currentStepNum}…`}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 32,
                background: "#e2e8f0",
                flexShrink: 0,
                marginLeft: 4,
              }}
            />

            {/* Step pills — horizontally scrollable */}
            <div
              style={{
                flex: 1,
                overflowX: "auto",
                paddingBottom: 2,
                // hide scrollbar visually
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "max-content",
                  gap: 0,
                }}
              >
                {steps.map((s, i) => {
                  const status = getStatus(s);
                  const clickable = !isIdle && (status === "complete" || isComplete);
                  return (
                    <React.Fragment key={s.num}>
                      <StepPill
                        step={s}
                        status={status}
                        isViewing={s.num === viewingStep}
                        isClickable={clickable}
                        onClickStep={onClickStep}
                      />
                      {i < steps.length - 1 && (
                        <Connector filled={status === "complete"} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Right: progress badge */}
            {!isIdle && (
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginLeft: 4,
                }}
              >
                <div
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    background: isComplete ? "#d1fae5" : isError ? "#fee2e2" : "#fef3c7",
                    border: `1px solid ${isComplete ? "#6ee7b7" : isError ? "#fca5a5" : "#fcd34d"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {!isComplete && !isError && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#d97706",
                        display: "block",
                        animation: "up-pulse-ring 1.5s ease-out infinite",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isComplete ? "#065f46" : isError ? "#991b1b" : "#92400e",
                    }}
                  >
                    {localProgress}%
                  </span>
                </div>

                {isComplete && (
                  <div
                    style={{
                      padding: "5px 10px",
                      borderRadius: 99,
                      background: "#d1fae5",
                      border: "1px solid #6ee7b7",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <CheckIcon />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#065f46",
                        letterSpacing: "0.05em",
                      }}
                    >
                      DONE
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Paginator strip (shown in all non-idle states) ── */}
          {!isIdle && (
            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                padding: "10px 0 11px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                animation: "up-slide-down 0.3s ease",
              }}
            >
              {/* Prev button */}
              <button
                type="button"
                onClick={() => viewingStep > 1 && onClickStep(viewingStep - 1)}
                disabled={viewingStep <= 1}
                title="Previous agent"
                style={{
                  flexShrink: 0,
                  height: 30,
                  padding: "0 10px 0 8px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: viewingStep <= 1 ? 0.4 : 1,
                  cursor: viewingStep <= 1 ? "not-allowed" : "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#475569" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#475569", letterSpacing: "0.02em" }}>
                  {viewingStep > 1 ? (steps[viewingStep - 2].agent ?? `A${viewingStep - 1}`) : "Prev"}
                </span>
              </button>

              {/* Center: Current step context */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                {(() => {
                  const isViewingActive = viewingStep === currentStepNum && !isComplete && !isError;
                  const isViewingDone   = viewingStep < currentStepNum || isComplete;
                  const isViewingError  = isError && viewingStep === currentStepNum;
                  const bg = isViewingActive ? "#fef3c7" : isViewingDone ? "#d1fae5" : isViewingError ? "#fee2e2" : "#f1f5f9";
                  const bd = isViewingActive ? "#fcd34d" : isViewingDone ? "#6ee7b7" : isViewingError ? "#fca5a5" : "#e2e8f0";
                  const tc = isViewingActive ? "#92400e" : isViewingDone ? "#065f46" : isViewingError ? "#991b1b" : "#475569";
                  const cur = steps[viewingStep - 1];
                  return (
                    <>
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "3px 10px", borderRadius: 99,
                          background: bg, border: `1px solid ${bd}`, flexShrink: 0,
                        }}
                      >
                        {isViewingActive && (
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d97706", display: "block", animation: "up-pulse-ring 1.2s ease infinite" }}/>
                        )}
                        <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 10, fontWeight: 700, color: tc }}>
                          {cur?.agent ?? `A${cur?.num}`}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cur?.label}
                      </span>
                      <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>
                        · {viewingStep} of {steps.length}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Mini clickable step track */}
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                {steps.map(s => {
                  const st = getStatus(s);
                  const isViewing = s.num === viewingStep;
                  const clickable = st === "complete" || isComplete;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => clickable && onClickStep(s.num)}
                      disabled={!clickable}
                      title={`${s.agent ?? `A${s.num}`} · ${s.label}`}
                      style={{
                        width: isViewing ? 22 : 16,
                        height: 4,
                        borderRadius: 99,
                        border: "none",
                        padding: 0,
                        background:
                          st === "complete" ? "#059669"
                          : st === "running"  ? "#d97706"
                          : st === "error"    ? "#dc2626"
                          : "#e2e8f0",
                        cursor: clickable ? "pointer" : "default",
                        transition: "all 0.25s",
                        opacity: isViewing ? 1 : 0.85,
                      }}
                    />
                  );
                })}
              </div>

              {/* Next button (primary green) */}
              <button
                type="button"
                onClick={() => viewingStep < steps.length && onClickStep(viewingStep + 1)}
                disabled={viewingStep >= steps.length}
                title="Next agent"
                style={{
                  flexShrink: 0,
                  height: 30,
                  padding: "0 8px 0 10px",
                  borderRadius: 8,
                  border: "1px solid #059669",
                  background: "#059669",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: viewingStep >= steps.length ? 0.4 : 1,
                  cursor: viewingStep >= steps.length ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  boxShadow: "0 1px 2px rgba(5,150,105,0.2)",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: "#ffffff", letterSpacing: "0.02em" }}>
                  {viewingStep < steps.length ? (steps[viewingStep].agent ?? `A${viewingStep + 1}`) : "End"}
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#ffffff" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
