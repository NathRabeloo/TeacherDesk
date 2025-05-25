import { NextResponse } from "next/server";
import { buscarResultados } from "@/app/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const enqueteId = searchParams.get("enqueteId");

  if (!enqueteId) {
    return NextResponse.json({ error: "Enquete ID é obrigatório" }, { status: 400 });
  }

  const result = await buscarResultados(enqueteId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ resultados: result.resultados });
}