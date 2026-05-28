"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Municipality, Scenario, YearPlan, FinancingConfig } from "@/lib/types";
import { ANO_INICIO_OPS } from "@/lib/constants";

// ── State ──

interface PlannerState {
  municipality: Municipality | null;
  scenarios: Scenario[];
  activeScenarioId: string;
  activeStep: number;
  planHorizon: number;
}

const DEFAULT_FINANCING: FinancingConfig = {
  gapFinancingRate: 0.12,
  discountRate: 0.1,
  workingCapitalSource: "Investimento privado",
};

function makeDefaultYearPlans(horizon: number): YearPlan[] {
  return Array.from({ length: horizon }, (_, i) => ({
    year: ANO_INICIO_OPS + i,
    students: 200,
    costPerStudentMonth: 210,
    splitI10Pct: 0.7,
    inflationRate: 0.05,
  }));
}

function createDefaultScenario(horizon: number): Scenario {
  return {
    id: "base",
    name: "Base",
    yearPlans: makeDefaultYearPlans(horizon),
    financing: { ...DEFAULT_FINANCING },
  };
}

const INITIAL_STATE: PlannerState = {
  municipality: null,
  scenarios: [createDefaultScenario(4)],
  activeScenarioId: "base",
  activeStep: 1,
  planHorizon: 4,
};

// ── Actions ──

type Action =
  | { type: "SET_MUNICIPALITY"; payload: Municipality }
  | { type: "SET_STEP"; payload: number }
  | {
      type: "UPDATE_YEAR_PLAN";
      payload: { scenarioId: string; yearIndex: number; plan: Partial<YearPlan> };
    }
  | { type: "SET_FINANCING"; payload: { scenarioId: string; financing: Partial<FinancingConfig> } }
  | { type: "ADD_SCENARIO"; payload: Scenario }
  | { type: "REMOVE_SCENARIO"; payload: string }
  | { type: "SET_ACTIVE_SCENARIO"; payload: string }
  | { type: "SET_PLAN_HORIZON"; payload: number }
  | { type: "RESTORE"; payload: PlannerState };

function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "SET_MUNICIPALITY":
      return { ...state, municipality: action.payload };

    case "SET_STEP":
      return { ...state, activeStep: action.payload };

    case "UPDATE_YEAR_PLAN": {
      const { scenarioId, yearIndex, plan } = action.payload;
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === scenarioId
            ? {
                ...s,
                yearPlans: s.yearPlans.map((yp, i) =>
                  i === yearIndex ? { ...yp, ...plan } : yp
                ),
              }
            : s
        ),
      };
    }

    case "SET_FINANCING": {
      const { scenarioId, financing } = action.payload;
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === scenarioId
            ? { ...s, financing: { ...s.financing, ...financing } }
            : s
        ),
      };
    }

    case "ADD_SCENARIO":
      return {
        ...state,
        scenarios: [...state.scenarios, action.payload],
      };

    case "REMOVE_SCENARIO":
      return {
        ...state,
        scenarios: state.scenarios.filter((s) => s.id !== action.payload),
        activeScenarioId:
          state.activeScenarioId === action.payload
            ? state.scenarios[0]?.id ?? "base"
            : state.activeScenarioId,
      };

    case "SET_ACTIVE_SCENARIO":
      return { ...state, activeScenarioId: action.payload };

    case "SET_PLAN_HORIZON": {
      const horizon = action.payload;
      return {
        ...state,
        planHorizon: horizon,
        scenarios: state.scenarios.map((s) => {
          const newPlans = Array.from({ length: horizon }, (_, i) => {
            if (i < s.yearPlans.length) return s.yearPlans[i];
            const prev = s.yearPlans[s.yearPlans.length - 1];
            return {
              year: ANO_INICIO_OPS + i,
              students: prev?.students ?? 200,
              costPerStudentMonth: prev?.costPerStudentMonth ?? 210,
              splitI10Pct: prev?.splitI10Pct ?? 0.7,
              inflationRate: prev?.inflationRate ?? 0.05,
            };
          });
          return { ...s, yearPlans: newPlans };
        }),
      };
    }

    case "RESTORE":
      return action.payload;

    default:
      return state;
  }
}

// ── Context ──

interface PlannerContextValue {
  state: PlannerState;
  dispatch: React.Dispatch<Action>;
  activeScenario: Scenario | undefined;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

const STORAGE_KEY = "i10-planner-state";

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerState;
        dispatch({ type: "RESTORE", payload: parsed });
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const persistTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore errors
      }
    }, 400);
    return () => clearTimeout(persistTimer.current);
  }, [state]);

  const activeScenario = state.scenarios.find(
    (s) => s.id === state.activeScenarioId
  );

  return (
    <PlannerContext.Provider value={{ state, dispatch, activeScenario }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) {
    throw new Error("usePlanner must be used within PlannerProvider");
  }
  return ctx;
}
