"use server";

import { encodedRedirect } from "@/lib/utils/utils";
import { createClient } from "@/lib/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MENSAGENS } from "@/constants/messages";

// Função para criar um novo usuário
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password || !name) {
    return redirect(`/sign-up?message=${encodeURIComponent(MENSAGENS.cadastro.camposObrigatorios)}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) {
    console.error(error.code, error.message);
    return redirect(`/sign-up?message=${encodeURIComponent(error.message)}`);
  }

  return redirect(`/sign-up?message=${encodeURIComponent(MENSAGENS.cadastro.sucesso)}`);
};

// Função para fazer login
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-in", MENSAGENS.login.erro);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error.code, error.message);
    return encodedRedirect("error", "/sign-in", MENSAGENS.login.erro);
  }

  return redirect("/home");
};

// Função para redefinir senha
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", MENSAGENS.redefinicaoSenha.emailObrigatorio);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.code, error.message);
    return encodedRedirect("error", "/forgot-password", MENSAGENS.redefinicaoSenha.erroRedefinir);
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect("success", "/forgot-password", MENSAGENS.redefinicaoSenha.sucessoRedefinir);
};

// Função para resetar senha
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!password || !confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", MENSAGENS.redefinicaoSenha.camposObrigatorios);
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/protected/reset-password", MENSAGENS.redefinicaoSenha.senhasDiferentes);
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error(error.code, error.message);
    return encodedRedirect("error", "/protected/reset-password", MENSAGENS.redefinicaoSenha.erroAtualizar);
  }

  return encodedRedirect("success", "/protected/reset-password", MENSAGENS.redefinicaoSenha.sucessoAtualizar);
};

// Função para deslogar o usuário
export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// Função para listar disciplinas do usuário
export const listarDisciplinas = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    console.error("Erro ao obter usuário:", userError?.message);
    return [];
  }

  const { data, error } = await supabase
    .from("Disciplina")
    .select("id, nome")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) {
    console.error("Erro ao listar disciplinas:", error.message);
    return [];
  }

  return data;
};

// Função para criar disciplina
export const criarDisciplina = async (formData: FormData) => {
  const nome = formData.get("nome")?.toString();

  if (!nome) {
    return { error: "Nome da disciplina é obrigatório" };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    console.error("Erro ao obter usuário:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  const { data, error, status } = await supabase
    .from("Disciplina")
    .insert({
      nome: nome,
      user_id: user.id,
    })
    .select();

  if (error) {
    console.error("Erro ao criar disciplina:", error.message);
    return { error: error.message };
  }

  console.log("Disciplina criada:", data, "Status:", status);

  return { success: true, data };
};

//Função para deletar Disciplina
export const deletarDisciplina = async (disciplinaId: string) => {
  const supabase = createClient();

  // Verifica se o usuário está autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error("Usuário não autenticado:", authError?.message);
    return { error: "Usuário não autenticado." };
  }

  // Exclui somente se a disciplina pertencer ao usuário autenticado
  const { error } = await supabase
    .from("Disciplina")
    .delete()
    .eq("id", disciplinaId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao deletar disciplina:", error.message);
    return { error: error.message };
  }

  return { success: true };
};

// Função para criar plano de aula
export const criarPlanoAula = async (formData: FormData) => {
  const titulo = formData.get("titulo")?.toString();
  const disciplina_id = formData.get("disciplina_id")?.toString();  
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    console.error("Erro ao obter usuário:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  if (!titulo || !disciplina_id) {
    return { error: "Título e Disciplina são obrigatórios" };  
  }


  const { data, error } = await supabase
    .from("PlanoAula")
    .insert({
      titulo,
      disciplina_id,   
      user_id: user.id,  
    })
    .select();

  if (error) {
    console.error("Erro ao criar plano de aula:", error.message);
    return { error: error.message };
  }

  console.log("Plano de aula criado:", data);
  return { success: true, data };
};
export const listarPlanosAula = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    console.error("Erro ao obter usuário:", userError?.message);
    return [];
  }

  // Consulta para buscar planos de aula com o nome da disciplina associada
  const { data, error } = await supabase
    .from("PlanoAula")
    .select(`
      id,
      titulo,
      disciplina_id,
      Disciplina: Disciplina(nome)   // Relacionamento com a tabela Disciplina
    `)
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) {
    console.error("Erro ao listar planos de aula:", error.message);
    return [];
  }

  return data;
};

//Função para deletar Plano de Aula
export const deletarPlanoAula = async (planoId: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("PlanoAula")
    .delete()
    .eq("id", planoId);

  if (error) {
    console.error("Erro ao deletar plano de aula:", error.message);
    return { error: error.message };
  }

  return { success: true };
};

export const editarPlanoAula = async (formData: FormData) => {
  const planoId = formData.get("id")?.toString();
  const titulo = formData.get("titulo")?.toString();

  if (!planoId || !titulo ) {
    return { error: "Todos os campos são obrigatórios" };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("PlanoAula")
    .update({ titulo })
    .eq("id", planoId);

  if (error) {
    console.error("Erro ao editar plano de aula:", error.message);
    return { error: error.message };
  }

  return { success: true };
};

export const criarEnquete = async (formData: FormData) => {
  const pergunta = formData.get("pergunta")?.toString();
  const opcoesJson = formData.get("opcoes")?.toString();

  if (!pergunta) return { error: "Pergunta da enquete é obrigatória" };
  if (!opcoesJson) return { error: "Opções da enquete são obrigatórias" };

  let opcoes;
  try {
    opcoes = JSON.parse(opcoesJson);
    if (!Array.isArray(opcoes) || opcoes.length === 0) {
      return { error: "Opções devem ser um array não vazio" };
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

  // Criar enquete
  const { data: enqueteData, error: enqueteError } = await supabase
    .from("enquetes")
    .insert({ pergunta, ativa: true })
    .select("id")
    .single();

  if (enqueteError) return { error: enqueteError.message };

  // Criar opções vinculadas
  const opcoesToInsert = opcoes.map((opcao: { texto: string }) => ({
    enquete_id: enqueteData.id,
    texto: opcao.texto.trim(),
  }));

  const { error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .insert(opcoesToInsert);

  if (opcoesError) return { error: opcoesError.message };

  return { success: true, enqueteId: enqueteData.id };
};

export const buscarEnquete = async (id: string) => {
  const supabase = createClient();

  // Busca enquete ativa
  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("id, pergunta, ativa")
    .eq("id", id)
    .single();

  if (enqueteError) return { error: enqueteError.message };
  if (!enquete || !enquete.ativa) return { error: "Enquete não encontrada ou inativa" };

  // Busca opções da enquete
  const { data: opcoes, error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .select("id, texto")
    .eq("enquete_id", id);

  if (opcoesError) return { error: opcoesError.message };

  return { enquete, opcoes };
};

export const registrarVoto = async (enqueteId: string, opcaoId: string) => {
  const supabase = createClient();

  // Confirma se enquete está ativa
  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("ativa")
    .eq("id", enqueteId)
    .single();

  if (enqueteError) return { error: enqueteError.message };
  if (!enquete || !enquete.ativa) return { error: "Enquete não está ativa" };

  // Verifica se opção pertence à enquete
  const { data: opcao, error: opcaoError } = await supabase
    .from("opcoes_enquete")
    .select("id")
    .eq("id", opcaoId)
    .eq("enquete_id", enqueteId)
    .single();

  if (opcaoError) return { error: opcaoError.message };
  if (!opcao) return { error: "Opção inválida para esta enquete" };

  // Insere voto
  const { error: votoError } = await supabase
    .from("respostas_enquete")
    .insert({ enquete_id: enqueteId, opcao_id: opcaoId });

  if (votoError) return { error: votoError.message };

  return { success: true };
};

export const buscarResultados = async (enqueteId: string) => {
  const supabase = createClient();

  // Busca opções e conta votos usando join e agregação
  const { data, error } = await supabase
    .from("opcoes_enquete")
    .select(`
      id,
      texto,
      votos: respostas_enquete!inner (id)
    `)
    .eq("enquete_id", enqueteId);

  if (error) return { error: error.message };

  // Mapear para mostrar total de votos por opção
  const resultados = data.map((opcao: any) => ({
    id: opcao.id,
    texto: opcao.texto,
    votos: opcao.votos.length,
  }));

  return { resultados };
};

// Criar tutorial (sem autenticação)
export const criarTutorial = async (formData: FormData) => {
    const titulo = formData.get("titulo")?.toString();
    const tipo = formData.get("tipo")?.toString();
    const descricao = formData.get("descricao")?.toString();

    if (!titulo || !tipo || !descricao) {
        return { error: "Todos os campos são obrigatórios" };
    }

    const supabase = createClient();

    const { data, error } = await supabase
        .from("tutoriais")
        .insert({ titulo, tipo, descricao })
        .select();

    if (error) {
        console.error("Erro ao criar tutorial:", error.message);
        return { error: error.message };
    }

    return { success: true, data };
};

export const listarTutoriais = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("tutoriais")
        .select("id, titulo, tipo, descricao")
        .order("id", { ascending: false });

    if (error) {
        console.error("Erro ao listar tutoriais:", error.message);
        return [];
    }

    return data;
};

export const editarTutorial = async (formData: FormData) => {
    const id = formData.get("id")?.toString();
    const titulo = formData.get("titulo")?.toString();
    const tipo = formData.get("tipo")?.toString();
    const descricao = formData.get("descricao")?.toString();

    if (!id || !titulo || !tipo || !descricao) {
        return { error: "Todos os campos são obrigatórios" };
    }

    const supabase = createClient();

    const { error } = await supabase
        .from("tutoriais")
        .update({ titulo, tipo, descricao })
        .eq("id", id);

    if (error) {
        console.error("Erro ao editar tutorial:", error.message);
        return { error: error.message };
    }

    return { success: true };
};

export const deletarTutorial = async (tutorialId: string) => {
    const supabase = createClient();

    const { error } = await supabase
        .from("tutoriais")
        .delete()
        .eq("id", tutorialId);

    if (error) {
        console.error("Erro ao deletar tutorial:", error.message);
        return { error: error.message };
    }

    return { success: true };
};
