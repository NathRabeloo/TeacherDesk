import { NextResponse } from "next/server";
import { criarEnquete, buscarEnquete } from "@/app/actions";

// POST: criar enquete
export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await criarEnquete(formData);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ enqueteId: result.enqueteId });
}

// GET: obter dados da enquete por ID
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID da enquete não informado" }, { status: 400 });
  }

  const result = await buscarEnquete(id); // você precisa garantir que essa função existe

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    pergunta: result.enquete?.pergunta,
    opcoes: result.opcoes,
  });
}
