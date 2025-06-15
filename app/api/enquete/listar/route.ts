// app/api/enquete/listar/route.ts - Endpoint para listar enquetes do usuário
import { NextResponse } from "next/server";
import { listarEnquetesUsuario } from "@/app/actions";

export async function GET(request: Request) {
  try {
    const result = await listarEnquetesUsuario();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      enquetes: result.enquetes 
    });
  } catch (error) {
    console.error("Erro no endpoint GET /api/enquete/listar:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

