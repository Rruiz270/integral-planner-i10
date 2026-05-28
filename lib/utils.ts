import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Brazilian Real currency.
 * Example: 1234567.89 → "R$ 1.234.568"
 */
export function formatCurrency(value: number): string {
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
}

/**
 * Compact currency: "R$ 1,2M" or "R$ 234K".
 */
export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const formatted = millions
      .toFixed(1)
      .replace(".", ",")
      .replace(/,0$/, "");
    return `${sign}R$ ${formatted}M`;
  }

  if (abs >= 1_000) {
    const thousands = Math.round(abs / 1_000);
    return `${sign}R$ ${thousands}K`;
  }

  return `${sign}R$ ${Math.round(abs).toLocaleString("pt-BR")}`;
}

/**
 * Format a decimal as percentage.
 * Example: 0.125 → "12,5%"
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1).replace(".", ",")}%`;
}

/**
 * Format a number with Brazilian thousand separators.
 * Example: 1234 → "1.234"
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("pt-BR");
}
