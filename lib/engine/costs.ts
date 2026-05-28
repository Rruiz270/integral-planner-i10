import { MESES_OPERACIONAIS_ANO } from "../constants";

export interface CostResult {
  monthlyCost: number;
  annualCost: number;
  costPerStudentMonthAdjusted: number;
}

/**
 * Calculate operational costs for a given year, adjusted for inflation.
 *
 * @param students            - number of integral students
 * @param costPerStudentMonth - base monthly cost per student (in baseYear reais)
 * @param year                - target year
 * @param baseYear            - reference year for the cost figure
 * @param inflationRate       - annual inflation rate (e.g. 0.05 for 5%)
 */
export function calculateCosts(
  students: number,
  costPerStudentMonth: number,
  year: number,
  baseYear: number,
  inflationRate: number,
): CostResult {
  const yearsElapsed = year - baseYear;
  const costPerStudentMonthAdjusted =
    costPerStudentMonth * Math.pow(1 + inflationRate, yearsElapsed);

  const monthlyCost = students * costPerStudentMonthAdjusted;
  const annualCost = monthlyCost * MESES_OPERACIONAIS_ANO;

  return {
    monthlyCost,
    annualCost,
    costPerStudentMonthAdjusted,
  };
}
