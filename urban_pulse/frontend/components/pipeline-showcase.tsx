"use client";

/**
 * Pipeline Progress Component - Design Showcase
 * 
 * This file demonstrates all visual states and responsive behavior
 * of the modern pipeline progress component.
 * 
 * Features:
 * - 8 Sequential Steps with visual state management
 * - Sticky navigation with real-time progress
 * - Responsive design (mobile, tablet, desktop)
 * - Smooth animations and transitions
 * - Accessibility-first implementation
 */

import React, { useState } from "react";

export function PipelineShowcase() {
  const [currentStep, setCurrentStep] = useState(3);
  const [completedSteps, setCompletedSteps] = useState([1, 2, 3]);

  const STEPS = Array.from({ length: 8 }, (_, i) => ({
    num: i + 1,
    label: [
      "Gatekeeper",
      "Context",
      "Semantic",
      "Patterns",
      "Escalation",
      "Platform",
      "Language",
      "Reporting"
    ][i],
    status: i < completedSteps[completedSteps.length - 1] ? "complete" : i === currentStep - 1 ? "running" : "pending"
  }));

  const completion = Math.round((completedSteps.length / 8) * 100);

  return (
    <div className="space-y-12 p-8 bg-slate-50">
      {/* ─── Section: Sticky Header Demo ─── */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Sticky Progress Header</h2>
        <p className="text-slate-600 mb-6">This header remains fixed at the top while scrolling through content.</p>
        
        <div className="relative h-96 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white">
          <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 px-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Pipeline Progress
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{completion}%</span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step.num}>
                    <button className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.status === "complete"
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
                        : step.status === "running"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300"
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {step.status === "complete" ? "✓" : step.num}
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 w-2 ${step.status === "complete" ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-600">Scroll down to see the sticky header remain fixed...</p>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 bg-slate-100 rounded-lg text-slate-600 text-sm">
                Content block {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section: Step States ─── */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Step States</h2>
        <p className="text-slate-600 mb-6">Each step has three distinct visual states.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Completed */}
          <div className="p-6 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-bold uppercase mb-4 text-slate-500">Completed Step</p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-emerald-600">Step Complete</p>
            </div>
          </div>

          {/* Running */}
          <div className="p-6 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-bold uppercase mb-4 text-slate-500">Running Step</p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 ring-2 ring-blue-300">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-blue-600">Currently Running</p>
            </div>
          </div>

          {/* Pending */}
          <div className="p-6 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-bold uppercase mb-4 text-slate-500">Pending Step</p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xl font-bold">
                5
              </div>
              <p className="text-sm font-semibold text-slate-500">Waiting</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section: Step Grid ─── */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Full Step Grid</h2>
        <p className="text-slate-600 mb-6">All 8 steps in a responsive grid layout.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {STEPS.map((step) => (
              <button key={step.num} className="flex flex-col items-center gap-2 p-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step.status === "complete"
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
                      : step.status === "running"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step.status === "complete" ? "✓" : step.num}
                </div>
                <span className={`text-xs font-semibold text-center leading-tight ${
                  step.status === "complete"
                    ? "text-emerald-600"
                    : step.status === "running"
                    ? "text-blue-700"
                    : "text-slate-500"
                }`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section: Progress Bar Variations ─── */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Progress Indicators</h2>
        <p className="text-slate-600 mb-6">Different progress states and completion levels.</p>

        <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-8">
          {[25, 50, 75, 100].map((percent) => (
            <div key={percent}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">{percent}% Complete</span>
                <span className="text-sm font-bold text-slate-600">{percent}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent === 100
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Section: Interactive Demo ─── */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Interactive Demo</h2>
        <p className="text-slate-600 mb-6">Simulate pipeline progression.</p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step) => (
              <button
                key={step.num}
                onClick={() => {
                  setCurrentStep(step.num);
                  setCompletedSteps(Array.from({ length: step.num }, (_, i) => i + 1));
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === step.num
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Step {step.num}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="grid grid-cols-8 gap-2">
              {STEPS.map((step) => (
                <button
                  key={step.num}
                  onClick={() => {
                    setCurrentStep(step.num);
                    setCompletedSteps(Array.from({ length: step.num }, (_, i) => i + 1));
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.status === "complete"
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"
                        : step.status === "running"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200"
                        : "bg-slate-200 text-slate-500 cursor-pointer hover:bg-slate-300"
                    }`}
                  >
                    {step.status === "complete" ? "✓" : step.num}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Design Principles ─── */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Design Principles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Clarity",
              description: "Clear visual hierarchy shows step status at a glance"
            },
            {
              title: "Responsiveness",
              description: "Adapts seamlessly from mobile to desktop screens"
            },
            {
              title: "Feedback",
              description: "Smooth animations provide immediate user feedback"
            },
            {
              title: "Accessibility",
              description: "High contrast, keyboard navigable, screen reader friendly"
            }
          ].map((principle) => (
            <div key={principle.title} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">{principle.title}</h4>
              <p className="text-sm text-blue-700">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PipelineShowcase;
