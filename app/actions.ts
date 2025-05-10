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

// Função para criar plano de aula
export const criarPlanoAula = async (formData: FormData) => {
  const titulo = formData.get("titulo")?.toString();
  const descricao = formData.get("descricao")?.toString();
  const disciplina_id = formData.get("disciplina_id")?.toString(); // Agora você vai associar o plano de aula à disciplina
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    console.error("Erro ao obter usuário:", userError?.message);
    return { error: "Usuário não autenticado" };
  }

  const { data, error } = await supabase
    .from("PlanoAula") // Inserir plano de aula na tabela 'PlanoAula'
    .insert({
      titulo,
      descricao,
      disciplina_id: disciplina_id ? disciplina_id : null, // Valor do ID da disciplina
      user_id: user.id, // Associar o plano ao usuário
    })
    .select();

  if (error) {
    console.error("Erro ao criar plano de aula:", error.message);
    return { error: error.message };
  }

  console.log("Plano de aula criado:", data);
  return { success: true, data };
};

