// app/api/enquete/deletar/route.ts - Endpoint para deletar enquete
import { NextResponse } from "next/server";
import { deletarEnquete } from "@/app/actions";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enqueteId = searchParams.get("enqueteId");

    if (!enqueteId) {
      return NextResponse.json({ error: "ID da enquete é obrigatório" }, { status: 400 });
    }

    const result = await deletarEnquete(enqueteId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no endpoint DELETE /api/enquete/deletar:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

