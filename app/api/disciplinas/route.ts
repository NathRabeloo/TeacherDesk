import { NextResponse } from "next/server";
import { listarDisciplinas } from "../../actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const disciplinas = await listarDisciplinas();
    return NextResponse.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    return NextResponse.json({ error: "Erro ao listar disciplinas" }, { status: 500 });
  }
}
