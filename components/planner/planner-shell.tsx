"use client";

import { usePlanner } from "./planner-provider";
import { Stepper } from "./stepper";
import { StepMunicipality } from "./step-municipality";
import { StepPlanConfig } from "./step-plan-config";
import { StepFinancing } from "./step-financing";
import { StepScenarios } from "./step-scenarios";
import { StepResults } from "./step-results";
import { MapPin } from "lucide-react";

function StepRouter() {
  const { state } = usePlanner();

  switch (state.activeStep) {
    case 1:
      return <StepMunicipality />;
    case 2:
      return <StepPlanConfig />;
    case 3:
      return <StepFinancing />;
    case 4:
      return <StepScenarios />;
    case 5:
      return <StepResults />;
    default:
      return <StepMunicipality />;
  }
}

export function PlannerShell() {
  const { state } = usePlanner();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-navy-gradient text-white px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm">
            <span className="text-sm font-bold tracking-tight">i10</span>
          </div>
          <div>
            <span className="text-sm font-semibold">Instituto i10</span>
            <span className="text-white/25 mx-2.5">|</span>
            <span className="text-sm text-white/70">
              Planejador Financeiro FUNDEB
            </span>
          </div>
        </div>
        {state.municipality && (
          <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-3.5 h-3.5" />
            <span>{state.municipality.nome}</span>
          </div>
        )}
      </header>

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Stepper />
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
          <StepRouter />
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Instituto i10 — Planejador de Educação Integral — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
