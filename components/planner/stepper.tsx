"use client";

import { usePlanner } from "./planner-provider";
import {
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Município", icon: MapPin },
  { num: 2, label: "Plano Anual", icon: Calendar },
  { num: 3, label: "Financiamento", icon: DollarSign },
  { num: 4, label: "Cenários", icon: BarChart3 },
  { num: 5, label: "Resultados", icon: FileText },
] as const;

export function Stepper() {
  const { state, dispatch } = usePlanner();
  const current = state.activeStep;

  function canNavigate(step: number): boolean {
    if (step <= current) return true;
    if (step === 2 && !state.municipality) return false;
    if (step > current + 1) return false;
    return true;
  }

  return (
    <nav>
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isActive = step.num === current;
          const isCompleted = step.num < current;
          const isFuture = step.num > current;
          const navigable = canNavigate(step.num);
          const Icon = step.icon;

          return (
            <div
              key={step.num}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                onClick={() =>
                  navigable &&
                  dispatch({ type: "SET_STEP", payload: step.num })
                }
                disabled={!navigable}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200",
                  isActive && "bg-cyan/10 shadow-sm",
                  navigable && !isActive && "hover:bg-gray-50 cursor-pointer",
                  !navigable && "cursor-default opacity-40"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all duration-300",
                    isActive && "bg-cyan text-white shadow-md shadow-cyan/30",
                    isCompleted && "bg-green text-white",
                    isFuture && "bg-gray-100 text-gray-400 border border-gray-200"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isActive && "text-navy",
                      isCompleted && "text-green",
                      isFuture && "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      step.num < current
                        ? "w-full bg-green"
                        : step.num === current
                          ? "w-1/2 bg-cyan/40"
                          : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
