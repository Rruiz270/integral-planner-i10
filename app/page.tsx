"use client";

import { PlannerProvider } from "@/components/planner/planner-provider";
import { PlannerShell } from "@/components/planner/planner-shell";

export default function HomePage() {
  return (
    <PlannerProvider>
      <PlannerShell />
    </PlannerProvider>
  );
}
