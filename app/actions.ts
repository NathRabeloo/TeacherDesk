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

// --- Plano de Aula CRUD ---

// Criar Plano de Aula
export const criarPlanoAula = async (formData: FormData) => {
  const titulo = formData.get("titulo")?.toString();
  const disciplina_id = formData.get("disciplina_id")?.toString();  
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
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

  return { success: true, data };
};

// Listar todos Planos de Aula
export async function listarPlanosAula() {
  const supabase = createClient();

  // Obtém usuário atual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from('PlanoAula')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error("Erro ao listar planos de aula:", error.message);
    throw error;
  }

  return data;
}

// Buscar Plano de Aula por ID
export const buscarPlanoAula = async (id: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('PlanoAula')
    .select('id, titulo, disciplina_id, disciplina!inner(nome)')
    .eq('id', id)
    .single();

  if (error) {
    return { error: error.message };
  }

  // Ajusta para facilitar uso
  const plano = data ? {
    ...data,
    disciplina_nome: Array.isArray(data.disciplina) && data.disciplina.length > 0 ? data.disciplina[0].nome : ''
  } : null;

  return { data: plano };
};

export async function buscarPlanoAulaPorId(id: string) {
  // Exemplo com fetch para sua API:
  const res = await fetch(`/api/plano-aulas/${id}`)
  if (!res.ok) return null
  const data = await res.json()
  return data
}

// Editar Plano de Aula
export const editarPlanoAula = async (formData: FormData) => {
  const planoId = formData.get("id")?.toString();
  const titulo = formData.get("titulo")?.toString();
  const disciplinaId = formData.get("disciplina_id")?.toString();

  if (!planoId || !titulo || !disciplinaId) {
    return { error: "Todos os campos são obrigatórios" };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("PlanoAula")
    .update({ titulo, disciplina_id: disciplinaId })
    .eq("id", planoId)
    .select('id, titulo, disciplina_id, disciplina(nome)')  // trago dados da disciplina relacionada
    .single();

  if (error) {
    console.error("Erro ao editar plano de aula:", error.message);
    return { error: error.message };
  }

  return { success: true, data };
};

// Deletar Plano de Aula
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

// --- Registro de Aula CRUD ---

// Criar Registro de Aula
export async function inserirRegistroAula(
  planoAulaId: string,
  dados: { data: string; conteudo: string, observacoes: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('RegistroAula')
    .insert([
      {
        plano_aula_id: planoAulaId, // corrigido aqui
        data: dados.data,
        conteudo: dados.conteudo,
        observacoes: dados.observacoes,
      },
    ])
    .single()

  if (error) {
    console.error('Erro ao inserir registro:', error)
    throw error
  }

  return data
}

// Editar Registro de Aula
export async function editarRegistroAula(
  id: string,
  dados: { data: string; conteudo: string; observacoes: string }
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('RegistroAula')
    .update({
      data: dados.data,
      conteudo: dados.conteudo,
      observacoes: dados.observacoes,
    })
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao editar registro:', error)
    throw error
  }

  return data
}


export async function deletarRegistroAula(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('RegistroAula').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar registro:', error)
    throw error
  }
}

export async function listarRegistrosPorPlanoId(planoId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('RegistroAula')
    .select('*')
    .eq('plano_aula_id', planoId) // corrigido aqui
    .order('data', { ascending: false })

  if (error) {
    console.error('Erro ao listar registros:', error)
    return { data: [] }
  }

  return { data }
}

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

// --- ENQUETES CRUD ---

// Criar uma nova enquete (corrigido para vincular ao usuário)
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

// Registrar voto em uma enquete
export const registrarVoto = async (enqueteId: string, opcaoId: string) => {
  const supabase = createClient();

  // Confirma se enquete está ativa
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

  // Verifica se opção pertence à enquete
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

  // Insere voto
  const { error: votoError } = await supabase
    .from("respostas_enquete")
    .insert({ enquete_id: enqueteId, opcao_id: opcaoId });

  if (votoError) {
    console.error("Erro ao registrar voto:", votoError.message);
    return { error: votoError.message };
  }

  return { success: true };
};

// Buscar resultados da enquete
export const buscarResultados = async (enqueteId: string) => {
  const supabase = createClient();

  // Buscar enquete para obter a pergunta
  const { data: enquete, error: enqueteError } = await supabase
    .from("enquetes")
    .select("pergunta")
    .eq("id", enqueteId)
    .single();

  if (enqueteError) {
    console.error("Erro ao buscar enquete:", enqueteError.message);
    return { error: enqueteError.message };
  }

  // Busca opções e conta votos
  const { data: opcoes, error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .select("id, texto")
    .eq("enquete_id", enqueteId);

  if (opcoesError) {
    console.error("Erro ao buscar opções:", opcoesError.message);
    return { error: opcoesError.message };
  }

  // Contar votos para cada opção
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

// Listar enquetes do usuário
export const listarEnquetesUsuario = async () => {
  const supabase = createClient();

  // Obter usuário autenticado
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

// Desativar enquete
export const desativarEnquete = async (enqueteId: string) => {
  const supabase = createClient();

  // Obter usuário autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  const { error } = await supabase
    .from("enquetes")
    .update({ ativa: false })
    .eq("id", enqueteId)
    .eq("user_id", user.id); // Só permite desativar se for o criador

  if (error) {
    console.error("Erro ao desativar enquete:", error.message);
    return { error: error.message };
  }

  return { success: true };
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
        .select("id, titulo, tipo, descricao, criado_em")
        .order("criado_em", { ascending: false });

    if (error) {
        console.error("Erro ao listar tutoriais:", error.message);
        return { error: error.message };
    }

    return { success: true, data };
};

export const buscarTutorial = async (id: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("tutoriais")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Erro ao buscar tutorial:", error.message);
        return { error: error.message };
    }

    return { success: true, data };
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

    const { data, error } = await supabase
        .from("tutoriais")
        .update({ titulo, tipo, descricao })
        .eq("id", id)
        .select();

    if (error) {
        console.error("Erro ao editar tutorial:", error.message);
        return { error: error.message };
    }

    return { success: true, data };
};

export const deletarTutorial = async (id: string) => {
    const supabase = createClient();

    const { error } = await supabase
        .from("tutoriais")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao deletar tutorial:", error.message);
        return { error: error.message };
    }

    return { success: true };
};

// Deletar Enquete
export const deletarEnquete = async (enqueteId: string) => {
  const supabase = createClient();

  // Verificar se o usuário está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    console.error("Usuário não autenticado:", authError?.message);
    return { error: "Usuário não autenticado." };
  }

  // Verificar se a enquete pertence ao usuário
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

  // Deletar a enquete (as respostas e opções serão deletadas automaticamente devido ao CASCADE)
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

// Exportar dados da enquete (versão corrigida) - substituir no actions.ts
export const exportarDadosEnquete = async (enqueteId: string) => {
  const supabase = createClient();

  // Obter usuário autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("Usuário não autenticado:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  // Verificar se a enquete pertence ao usuário (incluindo inativas)
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

  // Buscar opções da enquete
  const { data: opcoes, error: opcoesError } = await supabase
    .from("opcoes_enquete")
    .select("id, texto")
    .eq("enquete_id", enqueteId);

  if (opcoesError) {
    console.error("Erro ao buscar opções:", opcoesError.message);
    return { error: opcoesError.message };
  }

  // Contar votos para cada opção
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

  // Gerar conteúdo do arquivo
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

