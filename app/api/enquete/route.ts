// app/api/enquete/route.ts - Endpoint para criar enquete (POST) e buscar enquete (GET)
import { NextResponse } from "next/server";
import { criarEnquete, buscarEnquete } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await criarEnquete(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      enqueteId: result.enqueteId 
    });
  } catch (error) {
    console.error("Erro no endpoint POST /api/enquete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da enquete é obrigatório" }, { status: 400 });
    }

    const result = await buscarEnquete(id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pergunta: result.pergunta,
      opcoes: result.opcoes
    });
  } catch (error) {
    console.error("Erro no endpoint GET /api/enquete:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

