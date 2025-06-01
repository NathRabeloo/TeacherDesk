import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const disciplinaId = searchParams.get("disciplinaId");

  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    // Construir query base filtrando por usuário
    const query = supabase
      .from("Quiz")
      .select("id, titulo, disciplina_id")
      .eq("user_id", user.id); // Filtrar apenas quizzes do usuário

    // Adicionar filtro por disciplina se fornecido
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

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get("id");

  if (!quizId) {
    return NextResponse.json({ error: "ID do quiz é obrigatório." }, { status: 400 });
  }

  try {
    const supabase = createClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    // Excluir quiz verificando se pertence ao usuário
    const { error } = await supabase
      .from("Quiz")
      .delete()
      .eq("id", quizId)
      .eq("user_id", user.id); // Verificar se é do usuário

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Quiz excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir quiz:", error);
    return NextResponse.json({ error: "Erro ao excluir quiz." }, { status: 500 });
  }
}