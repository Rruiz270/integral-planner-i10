"use client";

import { usePlanner } from "./planner-provider";
import {
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Percent,
  Building2,
  Clock,
} from "lucide-react";
import { MESES_GAP, MES_INICIO_OPS, ANO_INICIO_OPS } from "@/lib/constants";

const CAPITAL_SOURCES = [
  "Investimento privado",
  "Emprestimo bancario",
  "Antecipacao municipal",
];

const GAP_MONTHS = [
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function StepFinancing() {
  const { state, dispatch, activeScenario } = usePlanner();

  if (!activeScenario) {
    return (
      <div className="card p-6 text-center text-gray-400">
        Nenhum cenario ativo.
      </div>
    );
  }

  const financing = activeScenario.financing;

  function updateFinancing(field: string, value: string | number) {
    dispatch({
      type: "SET_FINANCING",
      payload: {
        scenarioId: activeScenario!.id,
        financing: { [field]: value },
      },
    });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan/10">
            <DollarSign className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">
              Parametros de Financiamento
            </h2>
            <p className="text-sm text-gray-500">
              Configure as taxas e a fonte de capital para o gap operacional
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
              <Percent className="w-4 h-4" />
              Taxa de financiamento do gap (% a.a.)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={(financing.gapFinancingRate * 100).toFixed(1)}
              onChange={(e) =>
                updateFinancing(
                  "gapFinancingRate",
                  Number(e.target.value) / 100
                )
              }
              className="input-field"
            />
            <span className="text-xs text-gray-400 mt-1.5 block">
              Custo do capital durante o periodo de gap
            </span>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
              <Percent className="w-4 h-4" />
              Taxa de desconto - NPV (% a.a.)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={(financing.discountRate * 100).toFixed(1)}
              onChange={(e) =>
                updateFinancing("discountRate", Number(e.target.value) / 100)
              }
              className="input-field"
            />
            <span className="text-xs text-gray-400 mt-1.5 block">
              Para calculo do valor presente liquido
            </span>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
              <Building2 className="w-4 h-4" />
              Fonte de capital
            </label>
            <select
              value={financing.workingCapitalSource}
              onChange={(e) =>
                updateFinancing("workingCapitalSource", e.target.value)
              }
              className="input-field"
            >
              {CAPITAL_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gap timeline */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange/10">
            <Clock className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">
              Periodo de Gap Operacional
            </h2>
            <p className="text-sm text-gray-500">
              {MESES_GAP} meses entre o inicio das operacoes e o repasse FUNDEB
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium bg-red/10 text-red px-3 py-1 rounded-full text-xs">
              Inicio: Fev/{ANO_INICIO_OPS}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="font-medium bg-green/10 text-green px-3 py-1 rounded-full text-xs">
              Repasse: Jan/{ANO_INICIO_OPS + 1}
            </span>
          </div>

          <div className="flex gap-1">
            {GAP_MONTHS.map((month) => (
              <div
                key={month}
                className="flex-1 rounded-lg py-3 text-center bg-red/8 border border-red/15 transition-all hover:bg-red/12"
              >
                <div className="text-xs font-medium text-red">{month}</div>
                <div className="text-[10px] text-red/50 mt-0.5">Custo</div>
              </div>
            ))}
            <div className="flex-1 rounded-lg py-3 text-center bg-green/10 border border-green/20 transition-all hover:bg-green/15">
              <div className="text-xs font-medium text-green">Jan</div>
              <div className="text-[10px] text-green/50 mt-0.5">Repasse</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red/15 border border-red/25" />
              Periodo sem receita (gap)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green/15 border border-green/25" />
              Inicio dos repasses FUNDEB
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 2 })}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 4 })}
          className="btn-primary flex items-center gap-2"
        >
          Proximo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
