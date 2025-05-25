import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const disciplinaId = searchParams.get("disciplinaId");

  try {
    const query = supabase.from("Quiz").select("id, titulo, disciplina_id");

    if (disciplinaId) {
      query.eq("disciplina_id", disciplinaId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar quizzes:", error);
    return NextResponse.json({ error: "Erro ao buscar quizzes." }, { status: 500 });
  }
}
