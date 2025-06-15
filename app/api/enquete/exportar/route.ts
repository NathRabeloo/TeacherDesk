// app/api/enquete/exportar/route.ts - Endpoint para exportar dados da enquete
import { NextResponse } from "next/server";
import { exportarDadosEnquete } from "@/app/actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enqueteId = searchParams.get("enqueteId");

    if (!enqueteId) {
      return NextResponse.json({ error: "ID da enquete é obrigatório" }, { status: 400 });
    }

    const result = await exportarDadosEnquete(enqueteId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      conteudo: result.conteudo 
    });
  } catch (error) {
    console.error("Erro no endpoint GET /api/enquete/exportar:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

