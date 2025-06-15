"use server";

import { createClient } from "@/lib/utils/supabase/server";


export const criarEnquete = async (formData: FormData) => {
  const pergunta = formData.get("pergunta")?.toString();
  const opcoesJson = formData.get("opcoes")?.toString();

  if (!pergunta) return { error: "Pergunta da enquete é obrigatória" };
  if (!opcoesJson) return { error: "Opções da enquete são obrigatórias" };

  let opcoes;
  try {
    opcoes = JSON.parse(opcoesJson);
    if (!Array.isArray(opcoes) || opcoes.length < 2) {
      return { error: "É necessário ter pelo menos 2 opções para criar a enquete" };
    }
    for (const opcao of opcoes) {
      if (typeof opcao.texto !== "string" || !opcao.texto.trim()) {
        return { error: "Cada opção precisa ter um texto válido" };
      }
    }
  } catch {
    return { error: "Formato das opções inválido" };
  }

  const supabase = createClient();

  // Obter usuário autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  // Criar enquete vinculada ao usuário
  const { data: enqueteData, error: enqueteError } = await supabase
    .from("enquetes")
    .insert({ 
      pergunta, 
      user_id: user.id, // Vincula ao usuário criador
      ativa: true 
    })
    .select("id")
    .single();

  if (enqueteError) {
    console.error("Erro ao criar enquete:", enqueteError.message);
    return { error: enqueteError.message };
  }

  // Criar opções vinculadas
  const opcoesToInsert = opcoes.map((opcao: { texto: string }) => ({
    enquete_id: enqueteData.id,
    texto: opcao.texto.trim(),
  }));

  const { error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .insert(opcoesToInsert);

  if (opcoesError) {
    console.error("Erro ao criar opções:", opcoesError.message);
    return { error: opcoesError.message };
  }

  return { success: true, enqueteId: enqueteData.id };
};

// Buscar enquete por ID (corrigido para retornar pergunta)
export const buscarEnquete = async (id: string) => {
  const supabase = createClient();

  // Busca enquete ativa
  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("id, pergunta, ativa")
    .eq("id", id)
    .eq("ativa", true)
    .single();

  if (enqueteError) {
    console.error("Erro ao buscar enquete:", enqueteError.message);
    return { error: enqueteError.message };
  }
  
  if (!enquete) {
    return { error: "Enquete não encontrada ou inativa" };
  }

  // Busca opções da enquete com contagem de votos
  const { data: opcoes, error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .select("id, texto")
    .eq("enquete_id", id);

  if (opcoesError) {
    console.error("Erro ao buscar opções:", opcoesError.message);
    return { error: opcoesError.message };
  }

  // Contar votos para cada opção
  const opcoesComVotos = await Promise.all(
    opcoes.map(async (opcao) => {
      const { count } = await supabase
        .from("respostas_enquete")
        .select("*", { count: "exact", head: true })
        .eq("opcao_id", opcao.id);

      return {
        id: opcao.id,
        texto: opcao.texto,
        votos: count || 0,
      };
    })
  );

  return { 
    success: true,
    pergunta: enquete.pergunta, 
    opcoes: opcoesComVotos 
  };
};

export const registrarVoto = async (enqueteId: string, opcaoId: string) => {
  const supabase = createClient();

  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("ativa")
    .eq("id", enqueteId)
    .single();

  if (enqueteError) {
    console.error("Erro ao verificar enquete:", enqueteError.message);
    return { error: enqueteError.message };
  }
  
  if (!enquete || !enquete.ativa) {
    return { error: "Enquete não está ativa" };
  }

  const { data: opcao, error: opcaoError } = await supabase
    .from("opcoes_enquete")
    .select("id")
    .eq("id", opcaoId)
    .eq("enquete_id", enqueteId)
    .single();

  if (opcaoError) {
    console.error("Erro ao verificar opção:", opcaoError.message);
    return { error: opcaoError.message };
  }
  
  if (!opcao) {
    return { error: "Opção inválida para esta enquete" };
  }

  const { error: votoError } = await supabase
    .from("respostas_enquete")
    .insert({ enquete_id: enqueteId, opcao_id: opcaoId });

  if (votoError) {
    console.error("Erro ao registrar voto:", votoError.message);
    return { error: votoError.message };
  }

  return { success: true };
};

export const buscarResultados = async (enqueteId: string) => {
  const supabase = createClient();

  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("pergunta")
    .eq("id", enqueteId)
    .single();

  if (enqueteError) {
    console.error("Erro ao buscar enquete:", enqueteError.message);
    return { error: enqueteError.message };
  }

  const { data: opcoes, error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .select("id, texto")
    .eq("enquete_id", enqueteId);

  if (opcoesError) {
    console.error("Erro ao buscar opções:", opcoesError.message);
    return { error: opcoesError.message };
  }

  const resultados = await Promise.all(
    opcoes.map(async (opcao) => {
      const { count } = await supabase
        .from("respostas_enquete")
        .select("*", { count: "exact", head: true })
        .eq("opcao_id", opcao.id);

      return {
        id: opcao.id,
        texto: opcao.texto,
        votos: count || 0,
      };
    })
  );

  return { 
    success: true,
    pergunta: enquete.pergunta,
    resultados 
  };
};

export const listarEnquetesUsuario = async () => {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  const { data: enquetes, error } = await supabase
    .from("enquetes")
    .select("id, pergunta, ativa, criada_em")
    .eq("user_id", user.id)
    .order("criada_em", { ascending: false });

  if (error) {
    console.error("Erro ao listar enquetes:", error.message);
    return { error: error.message };
  }

  return { success: true, enquetes };
};

export const desativarEnquete = async (enqueteId: string) => {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  const { error } = await supabase
    .from("enquetes")
    .update({ ativa: false })
    .eq("id", enqueteId)
    .eq("user_id", user.id); 

  if (error) {
    console.error("Erro ao desativar enquete:", error.message);
    return { error: error.message };
  }

  return { success: true };
};

export const deletarEnquete = async (enqueteId: string) => {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    console.error("Usuário não autenticado:", authError?.message);
    return { error: "Usuário não autenticado." };
  }

  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("id, user_id")
    .eq("id", enqueteId)
    .eq("user_id", user.id)
    .single();

  if (enqueteError || !enquete) {
    console.error("Enquete não encontrada ou não pertence ao usuário:", enqueteError?.message);
    return { error: "Enquete não encontrada ou você não tem permissão para excluí-la." };
  }

  const { error: deleteError } = await supabase
    .from("enquetes")
    .delete()
    .eq("id", enqueteId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Erro ao deletar enquete:", deleteError.message);
    return { error: deleteError.message };
  }

  return { success: true };
};

export const exportarDadosEnquete = async (enqueteId: string) => {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("pergunta, user_id, ativa")
    .eq("id", enqueteId)
    .eq("user_id", user.id)
    .single();

  if (enqueteError || !enquete) {
    console.error("Erro ao buscar enquete:", enqueteError?.message);
    return { error: "Enquete não encontrada ou você não tem permissão para exportá-la" };
  }

  const { data: opcoes, error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .select("id, texto")
    .eq("enquete_id", enqueteId);

  if (opcoesError) {
    console.error("Erro ao buscar opções:", opcoesError.message);
    return { error: opcoesError.message };
  }

  const resultados = await Promise.all(
    opcoes.map(async (opcao) => {
      const { count } = await supabase
        .from("respostas_enquete")
        .select("*", { count: "exact", head: true })
        .eq("opcao_id", opcao.id);

      return {
        id: opcao.id,
        texto: opcao.texto,
        votos: count || 0,
      };
    })
  );

  if (!resultados || resultados.length === 0) {
    return { error: "Não foi possível obter os resultados da enquete." };
  }

  const totalVotos = resultados.reduce((total: number, opcao: any) => total + opcao.votos, 0);
  
  let conteudo = `DADOS DA ENQUETE\n`;
  conteudo += `================\n\n`;
  conteudo += `Pergunta: ${enquete.pergunta}\n`;
  conteudo += `Status: ${enquete.ativa ? 'Ativa' : 'Encerrada'}\n`;
  conteudo += `Total de votos: ${totalVotos}\n\n`;
  conteudo += `RESULTADOS:\n`;
  conteudo += `-----------\n`;
  
  resultados.forEach((opcao: any, index: number) => {
    const percentual = totalVotos > 0 ? Math.round((opcao.votos / totalVotos) * 100) : 0;
    conteudo += `${index + 1}. ${opcao.texto}: ${opcao.votos} votos (${percentual}%)\n`;
  });

  conteudo += `\nExportado em: ${new Date().toLocaleString('pt-BR')}\n`;

  return { success: true, conteudo };
};


