import type {
  Scenario,
  Municipality,
  ScenarioResult,
  YearProjection,
} from "../types";
import { ANO_REFERENCIA } from "../constants";
import { calculateRevenue } from "./revenue";
import { calculateCosts } from "./costs";
import { generateCashFlows } from "./cash-flow";
import {
  calculateNPV,
  calculateIRR,
  calculatePayback,
  calculateBreakEven,
} from "./financial-metrics";
import { runSensitivity } from "./sensitivity";

/**
 * Orchestrator: compute the full ScenarioResult from a Scenario and Municipality.
 */
export function calculateScenario(
  scenario: Scenario,
  municipality: Municipality,
): ScenarioResult {
  // ── Municipality AI/AF proportions ──
  const totalParcial = municipality.efAiParcial + municipality.efAfParcial;
  const pctAI = totalParcial > 0 ? municipality.efAiParcial / totalParcial : 0.5;
  const pctAF = totalParcial > 0 ? municipality.efAfParcial / totalParcial : 0.5;

  // ── Revenue baseline ──
  const revenueBase = calculateRevenue(1, pctAI, pctAF);

  // ── Year projections ──
  const sortedPlans = [...scenario.yearPlans].sort((a, b) => a.year - b.year);
  const yearProjections: YearProjection[] = sortedPlans.map((plan) => {
    const rev = calculateRevenue(plan.students, pctAI, pctAF);
    const costResult = calculateCosts(
      plan.students,
      plan.costPerStudentMonth,
      plan.year,
      ANO_REFERENCIA,
      plan.inflationRate,
    );

    const grossRevenue = rev.grossRevenue;
    const i10Revenue = grossRevenue * plan.splitI10Pct;
    const muniRevenue = grossRevenue * (1 - plan.splitI10Pct);
    const costs = costResult.annualCost;
    const netIncome = i10Revenue - costs;
    const ebitdaMargin = i10Revenue > 0 ? netIncome / i10Revenue : 0;

    return {
      year: plan.year,
      students: plan.students,
      grossRevenue,
      i10Revenue,
      muniRevenue,
      costs,
      netIncome,
      ebitdaMargin,
    };
  });

  // ── Monthly cash flows ──
  const monthlyCashFlows = generateCashFlows(
    scenario.yearPlans,
    pctAI,
    pctAF,
    scenario.financing,
  );

  // ── Financial metrics ──
  const npv = calculateNPV(monthlyCashFlows, scenario.financing.discountRate);
  const irr = calculateIRR(monthlyCashFlows);
  const paybackMonths = calculatePayback(monthlyCashFlows);

  // Total investment = sum of all negative cumulative cash flow (max drawdown)
  const totalInvestmentRequired = Math.abs(
    Math.min(0, ...monthlyCashFlows.map((cf) => cf.cumulativeCashFlow)),
  );

  // Break-even students (using first year's cost and split)
  const firstPlan = sortedPlans[0];
  const breakEvenStudents = firstPlan
    ? calculateBreakEven(
        firstPlan.costPerStudentMonth,
        revenueBase.weightedGain,
        firstPlan.splitI10Pct,
      )
    : 0;

  // ── Sensitivity analysis ──
  const sensitivityData = runSensitivity(scenario, pctAI, pctAF);

  return {
    scenarioId: scenario.id,
    yearProjections,
    monthlyCashFlows,
    npv,
    irr,
    paybackMonths,
    totalInvestmentRequired,
    breakEvenStudents,
    sensitivityData,
  };
}

// Re-export engine modules for direct access
export { calculateRevenue } from "./revenue";
export { calculateCosts } from "./costs";
export { generateCashFlows } from "./cash-flow";
export {
  calculateNPV,
  calculateIRR,
  calculatePayback,
  calculateBreakEven,
  calculateEbitda,
} from "./financial-metrics";
export { runSensitivity } from "./sensitivity";
