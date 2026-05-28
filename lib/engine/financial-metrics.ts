import type { MonthlyCashFlow, YearProjection } from "../types";

/**
 * Net Present Value using monthly discounting.
 * NPV = sum( cf_t / (1 + r/12)^t )  for t = 0, 1, 2, ...
 */
export function calculateNPV(
  cashFlows: MonthlyCashFlow[],
  discountRate: number,
): number {
  const monthlyRate = discountRate / 12;
  let npv = 0;

  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t].netCashFlow / Math.pow(1 + monthlyRate, t);
  }

  return npv;
}

/**
 * Internal Rate of Return via Newton-Raphson on monthly cash flows, annualized.
 * Returns null if no convergence after maxIterations.
 */
export function calculateIRR(
  cashFlows: MonthlyCashFlow[],
  maxIterations = 100,
  tolerance = 1e-7,
): number | null {
  const flows = cashFlows.map((cf) => cf.netCashFlow);

  // Check if all flows are zero
  if (flows.every((f) => f === 0)) return null;

  // Check if there's a sign change (necessary for IRR to exist)
  const hasPositive = flows.some((f) => f > 0);
  const hasNegative = flows.some((f) => f < 0);
  if (!hasPositive || !hasNegative) return null;

  // Newton-Raphson: find monthly rate r such that NPV(r) = 0
  let r = 0.01; // initial guess: 1% monthly

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0; // derivative of NPV with respect to r

    for (let t = 0; t < flows.length; t++) {
      const denom = Math.pow(1 + r, t);
      npv += flows[t] / denom;
      if (t > 0) {
        dnpv -= (t * flows[t]) / Math.pow(1 + r, t + 1);
      }
    }

    if (Math.abs(npv) < tolerance) {
      // Annualize: (1 + monthly)^12 - 1
      return Math.pow(1 + r, 12) - 1;
    }

    if (Math.abs(dnpv) < 1e-15) return null; // flat derivative, can't continue

    const rNew = r - npv / dnpv;

    // Guard against divergence
    if (rNew <= -1) {
      r = r / 2; // pull back toward zero
    } else {
      r = rNew;
    }
  }

  return null; // did not converge
}

/**
 * Payback period: first month index (1-based) where cumulative cash flow >= 0.
 * Returns the total number of months if payback is never reached.
 */
export function calculatePayback(cashFlows: MonthlyCashFlow[]): number {
  for (let i = 0; i < cashFlows.length; i++) {
    if (cashFlows[i].cumulativeCashFlow >= 0) {
      return i + 1; // 1-based month count
    }
  }
  return cashFlows.length;
}

/**
 * Break-even: minimum students where monthly revenue covers monthly cost.
 *
 * Monthly revenue per student = (weightedGain * splitPct) / 12
 * Monthly cost per student = costPerStudentMonth
 * Break-even = ceil(costPerStudentMonth / (weightedGain * splitPct / 12))
 *
 * Note: this is a simplified steady-state calculation (ignores gap period).
 */
export function calculateBreakEven(
  costPerStudentMonth: number,
  weightedGain: number,
  splitPct: number,
): number {
  const monthlyRevenuePerStudent = (weightedGain * splitPct) / 12;
  if (monthlyRevenuePerStudent <= 0) return Infinity;
  return Math.ceil(costPerStudentMonth / monthlyRevenuePerStudent);
}

/**
 * EBITDA calculation per year from year projections.
 * EBITDA = netIncome (since we have no D&A/interest/tax in this model).
 * Margin = EBITDA / grossRevenue.
 */
export function calculateEbitda(
  yearProjections: YearProjection[],
): { year: number; ebitda: number; margin: number }[] {
  return yearProjections.map((yp) => ({
    year: yp.year,
    ebitda: yp.netIncome,
    margin: yp.grossRevenue > 0 ? yp.netIncome / yp.grossRevenue : 0,
  }));
}
