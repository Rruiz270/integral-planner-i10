import type { Scenario, SensitivityItem } from "../types";
import { generateCashFlows } from "./cash-flow";
import { calculateNPV } from "./financial-metrics";

interface SensitivityVariable {
  variable: string;
  label: string;
  mutate: (scenario: Scenario, factor: number) => Scenario;
}

function cloneScenario(scenario: Scenario): Scenario {
  return {
    ...scenario,
    yearPlans: scenario.yearPlans.map((yp) => ({ ...yp })),
    financing: { ...scenario.financing },
  };
}

const SENSITIVITY_VARIABLES: SensitivityVariable[] = [
  {
    variable: "students",
    label: "Alunos",
    mutate: (s, factor) => {
      const clone = cloneScenario(s);
      clone.yearPlans = clone.yearPlans.map((yp) => ({
        ...yp,
        students: Math.round(yp.students * factor),
      }));
      return clone;
    },
  },
  {
    variable: "costPerStudent",
    label: "Custo/Aluno/Mês",
    mutate: (s, factor) => {
      const clone = cloneScenario(s);
      clone.yearPlans = clone.yearPlans.map((yp) => ({
        ...yp,
        costPerStudentMonth: yp.costPerStudentMonth * factor,
      }));
      return clone;
    },
  },
  {
    variable: "splitPct",
    label: "% Split I10",
    mutate: (s, factor) => {
      const clone = cloneScenario(s);
      clone.yearPlans = clone.yearPlans.map((yp) => ({
        ...yp,
        splitI10Pct: Math.min(1, yp.splitI10Pct * factor),
      }));
      return clone;
    },
  },
  {
    variable: "discountRate",
    label: "Taxa de Desconto",
    mutate: (s, factor) => {
      const clone = cloneScenario(s);
      clone.financing = {
        ...clone.financing,
        discountRate: clone.financing.discountRate * factor,
      };
      return clone;
    },
  },
  {
    variable: "inflationRate",
    label: "Inflação",
    mutate: (s, factor) => {
      const clone = cloneScenario(s);
      clone.yearPlans = clone.yearPlans.map((yp) => ({
        ...yp,
        inflationRate: yp.inflationRate * factor,
      }));
      return clone;
    },
  },
  {
    variable: "gapRate",
    label: "Taxa Financiamento Gap",
    mutate: (s, factor) => {
      const clone = cloneScenario(s);
      clone.financing = {
        ...clone.financing,
        gapFinancingRate: clone.financing.gapFinancingRate * factor,
      };
      return clone;
    },
  },
];

/**
 * Run sensitivity analysis: for each key variable, compute NPV at
 * base value, -20%, and +20%.
 */
export function runSensitivity(
  baseScenario: Scenario,
  pctAI: number,
  pctAF: number,
): SensitivityItem[] {
  const discountRate = baseScenario.financing.discountRate;

  // Base NPV
  const baseCashFlows = generateCashFlows(
    baseScenario.yearPlans,
    pctAI,
    pctAF,
    baseScenario.financing,
  );
  const baseNpv = calculateNPV(baseCashFlows, discountRate);

  return SENSITIVITY_VARIABLES.map((sv) => {
    const lowFactor = 0.8; // -20%
    const highFactor = 1.2; // +20%

    const lowScenario = sv.mutate(baseScenario, lowFactor);
    const highScenario = sv.mutate(baseScenario, highFactor);

    const lowCashFlows = generateCashFlows(
      lowScenario.yearPlans,
      pctAI,
      pctAF,
      lowScenario.financing,
    );
    const highCashFlows = generateCashFlows(
      highScenario.yearPlans,
      pctAI,
      pctAF,
      highScenario.financing,
    );

    // Use the mutated discount rate for NPV calculation
    const lowNpv = calculateNPV(lowCashFlows, lowScenario.financing.discountRate);
    const highNpv = calculateNPV(highCashFlows, highScenario.financing.discountRate);

    // Determine the base value being varied for reference
    let baseValue = 0;
    if (sv.variable === "students" && baseScenario.yearPlans.length > 0) {
      baseValue = baseScenario.yearPlans[0].students;
    } else if (sv.variable === "costPerStudent" && baseScenario.yearPlans.length > 0) {
      baseValue = baseScenario.yearPlans[0].costPerStudentMonth;
    } else if (sv.variable === "splitPct" && baseScenario.yearPlans.length > 0) {
      baseValue = baseScenario.yearPlans[0].splitI10Pct;
    } else if (sv.variable === "discountRate") {
      baseValue = baseScenario.financing.discountRate;
    } else if (sv.variable === "inflationRate" && baseScenario.yearPlans.length > 0) {
      baseValue = baseScenario.yearPlans[0].inflationRate;
    } else if (sv.variable === "gapRate") {
      baseValue = baseScenario.financing.gapFinancingRate;
    }

    return {
      variable: sv.variable,
      label: sv.label,
      baseNpv,
      lowNpv,
      highNpv,
      lowValue: baseValue * lowFactor,
      highValue: baseValue * highFactor,
    };
  });
}
