import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Municipality, Scenario, ScenarioResult } from "./types";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  formatNumber,
} from "./utils";

const NAVY: [number, number, number] = [10, 25, 47];
const CYAN: [number, number, number] = [0, 180, 216];
const GREEN: [number, number, number] = [0, 180, 128];
const RED: [number, number, number] = [212, 85, 58];
const ORANGE: [number, number, number] = [232, 168, 56];
const GRAY: [number, number, number] = [107, 114, 128];
const LIGHT_GRAY: [number, number, number] = [248, 250, 252];
const CYAN_BG: [number, number, number] = [224, 247, 250];
const GREEN_BG: [number, number, number] = [230, 250, 242];
const RED_BG: [number, number, number] = [253, 237, 234];

export function generatePDF(
  municipality: Municipality,
  scenarios: Scenario[],
  results: ScenarioResult[],
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 0;

  // ── Header bar ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Planejador Financeiro i10", margin, 12);

  doc.setFontSize(10);
  doc.setTextColor(200, 220, 255);
  doc.text(
    `Simulação Financeira FUNDEB — ${municipality.nome}`,
    margin,
    19,
  );

  doc.setFontSize(8);
  doc.setTextColor(160, 180, 220);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    pageW - margin,
    19,
    { align: "right" },
  );

  y = 36;

  // ── Municipality overview ──
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Dados do Município", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: {
      fillColor: [...NAVY],
      fontSize: 9,
      fontStyle: "bold",
      textColor: [255, 255, 255],
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [...LIGHT_GRAY] },
    head: [["Indicador", "Valor"]],
    body: [
      ["Matrículas Integral (EF)", formatNumber(municipality.efIntegral)],
      ["AI Parcial", formatNumber(municipality.efAiParcial)],
      ["AF Parcial", formatNumber(municipality.efAfParcial)],
      ["Total Matrículas EF", formatNumber(municipality.totalMatriculas)],
      ["Receita FUNDEB Atual", formatCurrency(municipality.receitaTotal)],
      ["Potencial Incremental", formatCurrency(municipality.potencialTotal)],
      ["% Potencial", formatPercent(municipality.pctPotencial / 100)],
    ],
  });

  y =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // ── Scenarios ──
  scenarios.forEach((scenario, sIdx) => {
    const result = results[sIdx];
    if (!result) return;

    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    // Scenario header with colored accent
    doc.setFillColor(...CYAN);
    doc.rect(margin, y - 4, 3, 10, "F");

    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(`Cenário: ${scenario.name}`, margin + 6, y + 2);
    y += 12;

    // KPI boxes
    const kpiWidth = (pageW - margin * 2 - 16) / 5;
    const kpis = [
      {
        label: "NPV",
        value: formatCurrencyCompact(result.npv),
        color: CYAN,
        bg: CYAN_BG,
      },
      {
        label: "TIR",
        value: result.irr !== null ? formatPercent(result.irr) : "N/A",
        color: GREEN,
        bg: GREEN_BG,
      },
      {
        label: "Payback",
        value: `${result.paybackMonths} meses`,
        color: ORANGE,
        bg: [255, 248, 230] as [number, number, number],
      },
      {
        label: "Capital",
        value: formatCurrencyCompact(result.totalInvestmentRequired),
        color: RED,
        bg: RED_BG,
      },
      {
        label: "Break-even",
        value: `${formatNumber(result.breakEvenStudents)} alunos`,
        color: NAVY,
        bg: [232, 236, 244] as [number, number, number],
      },
    ];

    kpis.forEach((kpi, i) => {
      const x = margin + i * (kpiWidth + 4);
      doc.setFillColor(...kpi.bg);
      doc.roundedRect(x, y, kpiWidth, 18, 2, 2, "F");

      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(kpi.label, x + kpiWidth / 2, y + 5, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(...kpi.color);
      doc.text(kpi.value, x + kpiWidth / 2, y + 13, { align: "center" });
    });

    y += 24;

    // Year projections table
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: {
        fillColor: [...NAVY],
        fontSize: 9,
        fontStyle: "bold",
        textColor: [255, 255, 255],
      },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [...LIGHT_GRAY] },
      columnStyles: {
        3: { textColor: [...CYAN], fontStyle: "bold" },
        4: { textColor: [...RED] },
        6: { fontStyle: "bold" },
      },
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
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const raw = result.yearProjections[data.row.index];
          if (raw) {
            data.cell.styles.textColor =
              raw.netIncome >= 0 ? [...GREEN] : [...RED];
          }
        }
      },
    });

    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 8;

    // Monthly cash flow table
    if (y > 180) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...GREEN);
    doc.rect(margin, y - 2, 3, 8, "F");

    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text("Fluxo de Caixa Mensal", margin + 6, y + 3);
    y += 8;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: {
        fillColor: [...NAVY],
        fontSize: 8,
        fontStyle: "bold",
        textColor: [255, 255, 255],
      },
      bodyStyles: { fontSize: 7, cellPadding: 1.5 },
      alternateRowStyles: { fillColor: [...LIGHT_GRAY] },
      head: [["Mês", "Receita", "Custo", "Líquido", "Acumulado"]],
      body: result.monthlyCashFlows.map((cf) => [
        cf.label,
        formatCurrency(cf.revenue),
        formatCurrency(cf.cost),
        formatCurrency(cf.netCashFlow),
        formatCurrency(cf.cumulativeCashFlow),
      ]),
      didParseCell: (data) => {
        if (data.section === "body") {
          const cf = result.monthlyCashFlows[data.row.index];
          if (!cf) return;

          if (cf.isGapPeriod && data.column.index === 0) {
            data.cell.styles.fillColor = [...RED_BG];
            data.cell.styles.textColor = [...RED];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === 3) {
            data.cell.styles.textColor =
              cf.netCashFlow >= 0 ? [...GREEN] : [...RED];
          }
          if (data.column.index === 4) {
            data.cell.styles.textColor =
              cf.cumulativeCashFlow >= 0 ? [...GREEN] : [...RED];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 14;
  });

  // ── Footer on all pages ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, pageH - 12, pageW, 12, "F");

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      `Planejador Financeiro i10 — ${municipality.nome}`,
      margin,
      pageH - 5,
    );
    doc.text(
      `Página ${i}/${pageCount}`,
      pageW - margin,
      pageH - 5,
      { align: "right" },
    );
  }

  const slug = municipality.nome
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  doc.save(`simulacao-i10-${slug}.pdf`);
}
