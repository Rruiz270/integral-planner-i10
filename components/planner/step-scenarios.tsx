"use client";

import { usePlanner } from "./planner-provider";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StepScenarios() {
  const { state, dispatch, activeScenario } = usePlanner();
  const scenarios = state.scenarios;
  const baseScenario = scenarios.find((s) => s.id === "base");

  const hasConservador = scenarios.some((s) => s.id === "conservador");
  const hasAgressivo = scenarios.some((s) => s.id === "agressivo");

  function addConservador() {
    if (!baseScenario || hasConservador) return;

    dispatch({
      type: "ADD_SCENARIO",
      payload: {
        id: "conservador",
        name: "Conservador",
        yearPlans: baseScenario.yearPlans.map((yp) => ({
          ...yp,
          students: Math.round(yp.students * 0.6),
          costPerStudentMonth: Math.round(yp.costPerStudentMonth * 1.15),
          splitI10Pct: 0.65,
        })),
        financing: { ...baseScenario.financing },
      },
    });
  }

  function addAgressivo() {
    if (!baseScenario || hasAgressivo) return;

    dispatch({
      type: "ADD_SCENARIO",
      payload: {
        id: "agressivo",
        name: "Agressivo",
        yearPlans: baseScenario.yearPlans.map((yp) => ({
          ...yp,
          students: Math.round(yp.students * 1.4),
          costPerStudentMonth: Math.round(yp.costPerStudentMonth * 0.95),
          splitI10Pct: 0.75,
        })),
        financing: { ...baseScenario.financing },
      },
    });
  }

  function removeScenario(id: string) {
    if (id === "base") return;
    dispatch({ type: "REMOVE_SCENARIO", payload: id });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan/10">
            <BarChart3 className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">
              Cenarios de Simulacao
            </h2>
            <p className="text-sm text-gray-500">
              Compare diferentes cenarios para a tomada de decisao
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={addConservador}
            disabled={hasConservador}
            className={cn(
              "btn-secondary flex items-center gap-2",
              hasConservador && "opacity-40 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            Cenario Conservador
          </button>
          <button
            onClick={addAgressivo}
            disabled={hasAgressivo}
            className={cn(
              "btn-secondary flex items-center gap-2",
              hasAgressivo && "opacity-40 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            Cenario Agressivo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => {
            const isActive = scenario.id === state.activeScenarioId;
            const firstPlan = scenario.yearPlans[0];
            const totalStudents = scenario.yearPlans.reduce(
              (sum, yp) => sum + yp.students,
              0
            );

            return (
              <div
                key={scenario.id}
                className={cn(
                  "card-interactive rounded-xl border-2 p-5",
                  isActive
                    ? "border-cyan bg-cyan/5 shadow-md shadow-cyan/10"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-navy">{scenario.name}</h4>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="flex items-center gap-1 text-xs font-medium text-cyan bg-cyan/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Ativo
                      </span>
                    )}
                    {scenario.id !== "base" && (
                      <button
                        onClick={() => removeScenario(scenario.id)}
                        className="text-gray-300 hover:text-red transition-colors cursor-pointer"
                        title="Remover cenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Alunos (ano 1)</span>
                    <span className="font-medium text-navy">
                      {firstPlan ? formatNumber(firstPlan.students) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Total ({state.planHorizon}a)
                    </span>
                    <span className="font-medium text-navy">
                      {formatNumber(totalStudents)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Custo/aluno</span>
                    <span className="font-medium text-navy">
                      R$ {firstPlan?.costPerStudentMonth ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Split i10</span>
                    <span className="font-medium text-navy">
                      {firstPlan
                        ? `${Math.round(firstPlan.splitI10Pct * 100)}%`
                        : "-"}
                    </span>
                  </div>
                </div>

                {!isActive && (
                  <button
                    onClick={() =>
                      dispatch({
                        type: "SET_ACTIVE_SCENARIO",
                        payload: scenario.id,
                      })
                    }
                    className="mt-4 w-full text-sm font-semibold text-cyan hover:text-navy transition-colors cursor-pointer py-2 rounded-lg hover:bg-cyan/5"
                  >
                    Ativar cenario
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 3 })}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 5 })}
          className="btn-primary flex items-center gap-2"
        >
          Proximo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
