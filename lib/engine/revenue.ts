import { GANHO_AI, GANHO_AF } from "../constants";

export interface RevenueResult {
  grossRevenue: number;
  revenuePerStudentYear: number;
  gainAI: number;
  gainAF: number;
  weightedGain: number;
}

/**
 * Calculate annual FUNDEB revenue from converting students to integral.
 *
 * @param students  - number of students converting to integral
 * @param pctAI     - proportion of AI (Anos Iniciais) students in the municipality (0-1)
 * @param pctAF     - proportion of AF (Anos Finais) students in the municipality (0-1)
 */
export function calculateRevenue(
  students: number,
  pctAI: number,
  pctAF: number,
): RevenueResult {
  const weightedGain = GANHO_AI * pctAI + GANHO_AF * pctAF;
  const grossRevenue = students * weightedGain;
  const revenuePerStudentYear = weightedGain;

  return {
    grossRevenue,
    revenuePerStudentYear,
    gainAI: GANHO_AI,
    gainAF: GANHO_AF,
    weightedGain,
  };
}
