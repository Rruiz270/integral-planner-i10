import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Municipality, Scenario, ScenarioResult } from "./types";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  formatNumber,
} from "./utils";

const NAVY = [10, 25, 47] as const;
const CYAN = [0, 162, 199] as const;
const GRAY = [107, 114, 128] as const;

export function generatePDF(
  municipality: Municipality,
  scenarios: Scenario[],
  results: ScenarioResult[],
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 20;

  // ── Header ──
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text("Integral Planner i10", margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text(
    `Simulacao Financeira — ${municipality.nome}`,
    margin,
    y,
  );
  y += 5;
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
  y += 10;

  // ── Municipality overview ──
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Dados do Municipio", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [...NAVY], fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    head: [["Indicador", "Valor"]],
    body: [
      ["Matriculas Integral (EF)", formatNumber(municipality.efIntegral)],
      ["AI Parcial", formatNumber(municipality.efAiParcial)],
      ["AF Parcial", formatNumber(municipality.efAfParcial)],
      ["Total Matriculas EF", formatNumber(municipality.totalMatriculas)],
      ["Receita FUNDEB Atual", formatCurrency(municipality.receitaTotal)],
      ["Potencial Incremental", formatCurrency(municipality.potencialTotal)],
      ["% Potencial", formatPercent(municipality.pctPotencial / 100)],
    ],
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Scenarios ──
  scenarios.forEach((scenario, sIdx) => {
    const result = results[sIdx];
    if (!result) return;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(`Cenario: ${scenario.name}`, margin, y);
    y += 8;

    // KPIs inline
    doc.setFontSize(10);
    doc.setTextColor(...CYAN);
    const kpis = [
      `NPV: ${formatCurrencyCompact(result.npv)}`,
      `TIR: ${result.irr !== null ? formatPercent(result.irr) : "N/A"}`,
      `Payback: ${result.paybackMonths} meses`,
      `Capital: ${formatCurrencyCompact(result.totalInvestmentRequired)}`,
      `Break-even: ${formatNumber(result.breakEvenStudents)} alunos`,
    ];
    doc.text(kpis.join("   |   "), margin, y);
    y += 8;

    // Year projections table
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "striped",
      headStyles: { fillColor: [...NAVY], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      head: [
        [
          "Ano",
          "Alunos",
          "Receita Bruta",
          "Parcela i10",
          "Custos",
          "Resultado",
          "Margem",
        ],
      ],
      body: result.yearProjections.map((yp) => [
        String(yp.year),
        formatNumber(yp.students),
        formatCurrency(yp.grossRevenue),
        formatCurrency(yp.i10Revenue),
        formatCurrency(yp.costs),
        formatCurrency(yp.netIncome),
        formatPercent(yp.ebitdaMargin),
      ]),
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Monthly cash flow table (compact)
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text("Fluxo de Caixa Mensal", margin, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "striped",
      headStyles: { fillColor: [...NAVY], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 7 },
      head: [["Mes", "Receita", "Custo", "Liquido", "Acumulado"]],
      body: result.monthlyCashFlows.map((cf) => [
        cf.label,
        formatCurrency(cf.revenue),
        formatCurrency(cf.cost),
        formatCurrency(cf.netCashFlow),
        formatCurrency(cf.cumulativeCashFlow),
      ]),
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  });

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `Integral Planner i10 — Pagina ${i}/${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  const slug = municipality.nome
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  doc.save(`simulacao-i10-${slug}.pdf`);
}
