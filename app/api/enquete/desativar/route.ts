// app/api/enquete/desativar/route.ts - Endpoint para desativar enquete
import { NextResponse } from "next/server";
import { desativarEnquete } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enqueteId } = body;

    if (!enqueteId) {
      return NextResponse.json({ 
        error: "ID da enquete é obrigatório" 
      }, { status: 400 });
    }

    const result = await desativarEnquete(enqueteId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no endpoint POST /api/enquete/desativar:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

