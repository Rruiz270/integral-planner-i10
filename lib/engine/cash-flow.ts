import {
  ANO_INICIO_OPS,
  MES_INICIO_OPS,
  ANO_REFERENCIA,
} from "../constants";
import { calculateRevenue } from "./revenue";
import { calculateCosts } from "./costs";
import type { YearPlan, FinancingConfig, MonthlyCashFlow } from "../types";

const MONTH_NAMES = [
  "Jan",
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

/**
 * Generate month-by-month cash flows for the entire plan horizon.
 *
 * Timeline logic:
 * - Year 1 operations start in February (month 2) of ANO_INICIO_OPS.
 *   Months Feb-Dec are the "gap" period: costs run but no FUNDEB revenue yet.
 * - FUNDEB revenue for year N students starts flowing in January of year N+1
 *   (census captured in May, FUNDEB adjusts next calendar year).
 * - Year 2+: revenue flows every month based on PREVIOUS year's enrolled students.
 */
export function generateCashFlows(
  yearPlans: YearPlan[],
  pctAI: number,
  pctAF: number,
  financing: FinancingConfig,
): MonthlyCashFlow[] {
  const cashFlows: MonthlyCashFlow[] = [];
  let cumulativeCashFlow = 0;

  // Sort year plans by year
  const sortedPlans = [...yearPlans].sort((a, b) => a.year - b.year);
  if (sortedPlans.length === 0) return cashFlows;

  const firstYear = sortedPlans[0].year;
  const lastYear = sortedPlans[sortedPlans.length - 1].year;

  // We need to generate cash flows from Feb of firstYear through Dec of lastYear+1
  // (to capture the revenue that flows from the last year's students)
  const endYear = lastYear + 1;

  // Build a lookup: year → YearPlan
  const planByYear = new Map<number, YearPlan>();
  for (const plan of sortedPlans) {
    planByYear.set(plan.year, plan);
  }

  for (let year = firstYear; year <= endYear; year++) {
    // Determine start month: Feb for the first operational year, Jan for others
    const startMonth = year === firstYear ? MES_INICIO_OPS : 1;

    for (let month = startMonth; month <= 12; month++) {
      const label = `${MONTH_NAMES[month - 1]}/${year}`;

      // ── Determine if this is a gap period ──
      // Gap = first operational year (Feb-Dec), before any FUNDEB revenue arrives
      const isGapPeriod = year === firstYear && month >= MES_INICIO_OPS;

      // ── Costs ──
      // Costs are incurred only during operational months (Feb-Nov) of each year
      // that has a year plan
      let cost = 0;
      const currentPlan = planByYear.get(year);
      if (currentPlan && month >= 2 && month <= 11) {
        const costResult = calculateCosts(
          currentPlan.students,
          currentPlan.costPerStudentMonth,
          year,
          ANO_REFERENCIA,
          currentPlan.inflationRate,
        );
        cost = costResult.monthlyCost;
      }

      // ── Revenue ──
      // FUNDEB revenue for year N students starts in January of year N+1.
      // Monthly revenue = annual gain / 12.
      let revenue = 0;
      const previousYear = year - 1;
      const prevPlan = planByYear.get(previousYear);
      if (prevPlan && year > firstYear) {
        const revenueResult = calculateRevenue(
          prevPlan.students,
          pctAI,
          pctAF,
        );
        // Split: I10 receives splitI10Pct of the gross revenue
        revenue =
          (revenueResult.grossRevenue * prevPlan.splitI10Pct) / 12;
      }

      // Apply gap financing cost if in gap period
      let financingCost = 0;
      if (isGapPeriod && cost > 0) {
        financingCost = cost * (financing.gapFinancingRate / 12);
      }

      const totalCost = cost + financingCost;
      const netCashFlow = revenue - totalCost;
      cumulativeCashFlow += netCashFlow;

      cashFlows.push({
        month,
        year,
        label,
        revenue,
        cost: totalCost,
        netCashFlow,
        cumulativeCashFlow,
        isGapPeriod,
      });
    }
  }

  return cashFlows;
}
