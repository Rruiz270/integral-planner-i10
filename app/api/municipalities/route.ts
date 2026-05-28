import { NextResponse } from "next/server";
import rawData from "@/data/municipios-sp.json";
import type { RawMunicipality, Municipality } from "@/lib/types";
import { parseMunicipality } from "@/lib/types";

const municipalities: Municipality[] = (rawData as RawMunicipality[]).map(
  parseMunicipality
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase().trim() ?? "";

  let filtered = municipalities;

  if (query.length > 0) {
    filtered = municipalities.filter((m) =>
      m.nome.toLowerCase().includes(query)
    );
  }

  return NextResponse.json(filtered.slice(0, 20));
}
