import { NextResponse } from "next/server";
import { registrarVoto } from "@/app/actions";

export async function POST(request: Request) {
  const body = await request.json();
  const { enqueteId, opcaoId } = body;

  if (!enqueteId || !opcaoId) {
    return NextResponse.json({ error: "Parâmetros enqueteId e opcaoId são obrigatórios" }, { status: 400 });
  }

  const result = await registrarVoto(enqueteId, opcaoId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
