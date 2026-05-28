"use client";

import { useState, useEffect, useCallback } from "react";
import { usePlanner } from "./planner-provider";
import type { Municipality } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import {
  MapPin,
  Search,
  ChevronRight,
  Users,
  BookOpen,
  Wallet,
  TrendingUp,
  Loader2,
} from "lucide-react";

export function StepMunicipality() {
  const { state, dispatch } = usePlanner();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
  const selected = state.municipality;

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/municipalities?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data as Municipality[]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 250);
    return () => clearTimeout(timeout);
  }, [query, search]);

  function handleSelect(m: Municipality) {
    dispatch({ type: "SET_MUNICIPALITY", payload: m });
    setQuery("");
    setResults([]);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan/10">
            <MapPin className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">
              Selecionar Município
            </h2>
            <p className="text-sm text-gray-500">
              Busque entre os 645 municípios do estado de São Paulo
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan animate-spin" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome do município..."
            className="input-field pl-10"
            autoFocus
          />
        </div>

        {results.length > 0 && (
          <ul className="mt-3 border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-72 overflow-y-auto shadow-sm">
            {results.map((m) => (
              <li key={m.nome}>
                <button
                  onClick={() => handleSelect(m)}
                  className="w-full text-left px-4 py-3.5 hover:bg-cyan/5 transition-all duration-150 flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <span className="font-medium text-navy group-hover:text-cyan transition-colors">
                      {m.nome}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatNumber(m.totalMatriculas)} matrículas
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-cyan group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="text-sm text-gray-400 mt-3">
            Nenhum município encontrado.
          </p>
        )}
      </div>

      {selected && (
        <div className="card p-6 space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy">{selected.nome}</h3>
            <span className="text-xs font-medium text-cyan bg-cyan/10 px-3 py-1.5 rounded-full">
              Selecionado
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KpiCard
              icon={Users}
              label="Total Matrículas"
              value={formatNumber(selected.totalMatriculas)}
            />
            <KpiCard
              icon={BookOpen}
              label="EF Integral Atual"
              value={formatNumber(selected.efIntegral)}
              sub={formatPercent(
                selected.totalMatriculas > 0
                  ? selected.efIntegral / selected.totalMatriculas
                  : 0
              )}
            />
            <KpiCard
              icon={Users}
              label="EF Parcial Conversível"
              value={formatNumber(selected.efAiParcial + selected.efAfParcial)}
              sub={`AI: ${formatNumber(selected.efAiParcial)} / AF: ${formatNumber(selected.efAfParcial)}`}
            />
            <KpiCard
              icon={Wallet}
              label="Receita FUNDEB Atual"
              value={formatCurrency(selected.receitaTotal)}
            />
            <KpiCard
              icon={TrendingUp}
              label="Potencial"
              value={formatCurrency(selected.potencialTotal)}
              sub={formatPercent(selected.pctPotencial / 100)}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => dispatch({ type: "SET_STEP", payload: 2 })}
              className="btn-primary flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="kpi-card">
      <Icon className="w-5 h-5 text-cyan mx-auto mb-2" />
      <div className="kpi-value text-lg">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
