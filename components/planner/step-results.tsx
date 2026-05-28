"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "./planner-provider";
import { calculateScenario } from "@/lib/engine";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  formatNumber,
} from "@/lib/utils";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import {
  FileText,
  ChevronLeft,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Users,
  Download,
} from "lucide-react";

export function StepResults() {
  const { state, dispatch } = usePlanner();
  const municipality = state.municipality;
  const [pdfLoading, setPdfLoading] = useState(false);

  const results = useMemo(() => {
    if (!municipality) return [];
    return state.scenarios.map((scenario) =>
      calculateScenario(scenario, municipality)
    );
  }, [state.scenarios, municipality]);

  if (!municipality || results.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-400">
        Configure o município e os cenários primeiro.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan/10">
              <FileText className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">
                Resultados da Simulação
              </h2>
              <p className="text-sm text-gray-500">
                {municipality.nome} — {state.scenarios.length} cenário(s)
                analisado(s)
              </p>
            </div>
          </div>
          <button
            disabled={pdfLoading}
            onClick={async () => {
              setPdfLoading(true);
              try {
                const { generatePDF } = await import("@/lib/pdf");
                generatePDF(municipality, state.scenarios, results);
              } finally {
                setPdfLoading(false);
              }
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? "Gerando..." : "Baixar PDF"}
          </button>
        </div>
      </div>

      {/* KPI cards per scenario */}
      {state.scenarios.map((scenario, sIdx) => {
        const result = results[sIdx];
        if (!result) return null;

        return (
          <div key={scenario.id} className="space-y-4 animate-fade-in-up">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wide px-1">
              Cenário: {scenario.name}
            </h3>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="kpi-card border-t-2 border-t-cyan">
                <TrendingUp className="w-5 h-5 text-cyan mx-auto mb-2" />
                <div className="kpi-value text-lg">
                  {formatCurrencyCompact(result.npv)}
                </div>
                <div className="kpi-label">NPV</div>
              </div>

              <div className="kpi-card border-t-2 border-t-green">
                <DollarSign className="w-5 h-5 text-green mx-auto mb-2" />
                <div className="kpi-value text-lg">
                  {result.irr !== null ? formatPercent(result.irr) : "N/A"}
                </div>
                <div className="kpi-label">TIR</div>
              </div>

              <div className="kpi-card border-t-2 border-t-orange">
                <Clock className="w-5 h-5 text-orange mx-auto mb-2" />
                <div className="kpi-value text-lg">
                  {result.paybackMonths} meses
                </div>
                <div className="kpi-label">Payback</div>
              </div>

              <div className="kpi-card border-t-2 border-t-red">
                <Target className="w-5 h-5 text-red mx-auto mb-2" />
                <div className="kpi-value text-lg">
                  {formatCurrencyCompact(result.totalInvestmentRequired)}
                </div>
                <div className="kpi-label">Capital Necessário</div>
              </div>

              <div className="kpi-card border-t-2 border-t-navy">
                <Users className="w-5 h-5 text-navy mx-auto mb-2" />
                <div className="kpi-value text-lg">
                  {formatNumber(result.breakEvenStudents)}
                </div>
                <div className="kpi-label">Break-even (alunos)</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h4 className="text-sm font-bold text-navy mb-4">
                  Fluxo de Caixa Mensal
                </h4>
                <CashFlowChart data={result.monthlyCashFlows} />
              </div>
              <div className="card p-5">
                <h4 className="text-sm font-bold text-navy mb-4">
                  Projeção de Receita Anual
                </h4>
                <RevenueChart data={result.yearProjections} />
              </div>
            </div>

            {/* Year projections table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">
                        Ano
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Alunos
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Receita Bruta
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Parcela i10
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Custos
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Resultado
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Margem
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.yearProjections.map((yp) => (
                      <tr
                        key={yp.year}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-navy">
                          {yp.year}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatNumber(yp.students)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(yp.grossRevenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-cyan font-medium tabular-nums">
                          {formatCurrency(yp.i10Revenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-red tabular-nums">
                          {formatCurrency(yp.costs)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium tabular-nums ${
                            yp.netIncome >= 0 ? "text-green" : "text-red"
                          }`}
                        >
                          {formatCurrency(yp.netIncome)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatPercent(yp.ebitdaMargin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: 4 })}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <div />
      </div>
    </div>
  );
}
