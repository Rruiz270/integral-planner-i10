// ── Domain types for the Integral Planner financial engine ──

export interface Municipality {
  nome: string;
  efIntegral: number;
  efAiParcial: number;
  efAfParcial: number;
  totalMatriculas: number;
  receitaTotal: number;
  potencialTotal: number;
  pctPotencial: number;
}

/** Compact JSON representation used in data files */
export interface RawMunicipality {
  n: string;
  ei: number;
  ai: number;
  af: number;
  tm: number;
  tr: number;
  pt: number;
  pp: number;
}

export interface YearPlan {
  year: number;
  students: number;
  costPerStudentMonth: number;
  splitI10Pct: number;
  inflationRate: number;
}

export interface FinancingConfig {
  gapFinancingRate: number;
  discountRate: number;
  workingCapitalSource: string;
}

export interface Scenario {
  id: string;
  name: string;
  yearPlans: YearPlan[];
  financing: FinancingConfig;
}

export interface PlanState {
  municipality: Municipality;
  scenarios: Scenario[];
  activeScenarioId: string;
  planHorizon: number;
}

export interface MonthlyCashFlow {
  month: number;
  year: number;
  label: string;
  revenue: number;
  cost: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  isGapPeriod: boolean;
}

export interface YearProjection {
  year: number;
  students: number;
  grossRevenue: number;
  i10Revenue: number;
  muniRevenue: number;
  costs: number;
  netIncome: number;
  ebitdaMargin: number;
}

export interface ScenarioResult {
  scenarioId: string;
  yearProjections: YearProjection[];
  monthlyCashFlows: MonthlyCashFlow[];
  npv: number;
  irr: number | null;
  paybackMonths: number;
  totalInvestmentRequired: number;
  breakEvenStudents: number;
  sensitivityData: SensitivityItem[];
}

export interface SensitivityItem {
  variable: string;
  label: string;
  baseNpv: number;
  lowNpv: number;
  highNpv: number;
  lowValue: number;
  highValue: number;
}

// ── Helpers ──

export function parseMunicipality(raw: RawMunicipality): Municipality {
  return {
    nome: raw.n,
    efIntegral: raw.ei,
    efAiParcial: raw.ai,
    efAfParcial: raw.af,
    totalMatriculas: raw.tm,
    receitaTotal: raw.tr,
    potencialTotal: raw.pt,
    pctPotencial: raw.pp,
  };
}
