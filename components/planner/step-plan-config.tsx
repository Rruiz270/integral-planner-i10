"use client";

import { useState } from "react";
import { usePlanner } from "./planner-provider";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { calculateRevenue } from "@/lib/engine";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  Percent,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StepPlanConfig() {
  const { state, dispatch, activeScenario } = usePlanner();
  const municipality = state.municipality;
  const [activeYear, setActiveYear] = useState(0);

  if (!municipality || !activeScenario) {
    return (
      <div className="card p-6 text-center text-gray-400">
        Selecione um município primeiro.
      </div>
    );
  }

  const totalParcial = municipality.efAiParcial + municipality.efAfParcial;
  const pctAI =
    totalParcial > 0 ? municipality.efAiParcial / totalParcial : 0.5;
  const pctAF =
    totalParcial > 0 ? municipality.efAfParcial / totalParcial : 0.5;
  const plans = activeScenario.yearPlans;

  function updatePlan(idx: number, field: string, value: number) {
    dispatch({
      type: "UPDATE_YEAR_PLAN",
      payload: {
        scenarioId: activeScenario!.id,
        yearIndex: idx,
        plan: { [field]: value },
      },
    });
  }

  const plan = plans[activeYear];
  if (!plan) return null;

  const rev = calculateRevenue(plan.students, pctAI, pctAF);
  const i10Share = rev.grossRevenue * plan.splitI10Pct;
  const muniShare = rev.grossRevenue * (1 - plan.splitI10Pct);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Horizon selector */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-cyan" />
          <span className="text-sm font-medium text-navy">
            Horizonte do plano
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {[2, 3, 4, 5, 6].map((h) => (
            <button
              key={h}
              onClick={() => {
                dispatch({ type: "SET_PLAN_HORIZON", payload: h });
                if (activeYear >= h) setActiveYear(h - 1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                state.planHorizon === h
                  ? "bg-cyan text-white shadow-md shadow-cyan/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {h}a
            </button>
          ))}
        </div>
      </div>

      {/* Year tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {plans.map((p, idx) => (
            <button
              key={p.year}
              onClick={() => setActiveYear(idx)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center transition-all duration-200 cursor-pointer relative",
                idx === activeYear
                  ? "text-cyan bg-white"
                  : "text-gray-500 hover:text-navy hover:bg-white/50"
              )}
            >
              {p.year}
              {idx === activeYear && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 animate-fade-in-up" key={activeYear}>
          <h4 className="text-sm font-bold text-navy mb-5">
            Ano {plan.year} — Parâmetros
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <Users className="w-3.5 h-3.5" />
                Alunos para converter
              </label>
              <input
                type="number"
                min={0}
                max={totalParcial}
                value={plan.students}
                onChange={(e) =>
                  updatePlan(activeYear, "students", Number(e.target.value))
                }
                className="input-field"
              />
              <span className="text-xs text-gray-400 mt-1.5 block">
                Máx: {totalParcial.toLocaleString("pt-BR")}
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <DollarSign className="w-3.5 h-3.5" />
                Custo por aluno/mês (R$)
              </label>
              <input
                type="number"
                min={0}
                value={plan.costPerStudentMonth}
                onChange={(e) =>
                  updatePlan(
                    activeYear,
                    "costPerStudentMonth",
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <Percent className="w-3.5 h-3.5" />
                Split i10 / Município
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={80}
                  value={Math.round(plan.splitI10Pct * 100)}
                  onChange={(e) =>
                    updatePlan(
                      activeYear,
                      "splitI10Pct",
                      Number(e.target.value) / 100
                    )
                  }
                  className="flex-1"
                />
                <span className="text-sm font-semibold text-navy w-16 text-right tabular-nums">
                  {Math.round(plan.splitI10Pct * 100)}/
                  {100 - Math.round(plan.splitI10Pct * 100)}
                </span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Inflação anual (%)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={(plan.inflationRate * 100).toFixed(1)}
                onChange={(e) =>
                  updatePlan(
                    activeYear,
                    "inflationRate",
                    Number(e.target.value) / 100
                  )
                }
                className="input-field"
              />
            </div>
          </div>

          {/* Revenue preview */}
          <div className="bg-gray-50 rounded-xl p-5 grid grid-cols-3 gap-4 border border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1.5">Receita bruta</div>
              <div className="text-sm font-bold text-navy">
                {formatCurrency(rev.grossRevenue)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1.5">
                Parcela i10 ({Math.round(plan.splitI10Pct * 100)}%)
              </div>
              <div className="text-sm font-bold text-cyan">
                {formatCurrency(i10Share)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1.5">
                Parcela município (
                {100 - Math.round(plan.splitI10Pct * 100)}%)
              </div>
              <div className="text-sm font-bold text-green">
                {formatCurrency(muniShare)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 1 })}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 3 })}
          className="btn-primary flex items-center gap-2"
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
