"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FaPlus,
  FaSearch,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaUser,
} from "react-icons/fa";

import {
  criarBibliografia,
  listarBibliografias,
  editarBibliografia,
  deletarBibliografia,
  listarDisciplinas,
  getUserCurrentInfo,
} from "@/app/actions";

interface BibliografiaItem {
  id: number;
  titulo: string;
  link: string;
  disciplina_id: string;
  user_id: string;
  nome_professor?: string;
  created_at?: string;
}

interface Disciplina {
  id: string;
  nome: string;
}

interface UserInfo {
  id: string;
  name: string;
}

const Bibliografia: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfirmarExcluirAberto, setModalConfirmarExcluirAberto] = useState(false);
  const [modalConfirmarLinkAberto, setModalConfirmLink] = useState<BibliografiaItem | null>(null);

  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("all");
  const [itemParaExcluir, setItemParaExcluir] = useState<BibliografiaItem | null>(null);
  const [carregando, setCarregando] = useState(false);

  const itensPorPagina = 12;

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      // Carregar informações do usuário
      const userResponse = await getUserCurrentInfo();
      if (userResponse.success && userResponse.data) {
        setUserInfo(userResponse.data);
      }

      // Carregar disciplinas
      const disciplinasData = await listarDisciplinas();
      setDisciplinas(disciplinasData || []);

      // Carregar bibliografias
      await carregarBibliografia();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarBibliografia() {
    try {
      const filtro = filtroDisciplina === "all" ? "" : filtroDisciplina;
      const { data, error } = await listarBibliografias(filtro);
      if (error) {
        console.error("Erro ao listar bibliografias:", error);
        alert("Erro ao carregar bibliografias: " + error);
      } else {
        setBibliografia(
          (data ?? []).map((item: any) => ({
            id: item.id,
            titulo: item.titulo,
            link: item.link,
            disciplina_id: item.disciplina_id,
            user_id: item.user_id ?? "",
            nome_professor: item.nome_professor,
            created_at: item.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar bibliografia:", error);
      alert("Erro ao carregar bibliografias");
    }
  }

  // Recarregar quando filtro de disciplina mudar
  useEffect(() => {
    if (disciplinas.length > 0) {
      carregarBibliografia();
    }
  }, [filtroDisciplina]);

  const handleSalvar = async () => {
    if (!titulo.trim() || !link.trim() || !disciplinaSelecionada) {
      alert("Título, link e disciplina são obrigatórios!");
      return;
    }

    setCarregando(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("link", link);
      formData.append("disciplina_id", disciplinaSelecionada);

      let res;
      if (idEditando) {
        formData.append("id", idEditando.toString());
        res = await editarBibliografia(formData);
      } else {
        res = await criarBibliografia(formData);
      }

      if (res?.success) {
        await carregarBibliografia();
        setModalAberto(false);
        limparFormulario();
        alert(idEditando ? "Bibliografia editada com sucesso!" : "Bibliografia criada com sucesso!");
      } else {
        console.error("Erro ao salvar:", res?.error);
        alert("Erro ao salvar bibliografia: " + (res?.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar bibliografia");
    } finally {
      setCarregando(false);
    }
  };

  const limparFormulario = () => {
    setTitulo("");
    setLink("");
    setDisciplinaSelecionada("");
    setIdEditando(null);
  };

  const abrirLinkConfirmado = () => {
    if (modalConfirmarLinkAberto) {
      window.open(modalConfirmarLinkAberto.link, "_blank", "noopener,noreferrer");
      setModalConfirmLink(null);
    }
  };

  const abrirModalEditar = (item: BibliografiaItem) => {
    setIdEditando(item.id);
    setTitulo(item.titulo);
    setLink(item.link);
    setDisciplinaSelecionada(item.disciplina_id);
    setModalAberto(true);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalExcluir = (item: BibliografiaItem) => {
    setItemParaExcluir(item);
    setModalConfirmarExcluirAberto(true);
  };

  const confirmarExcluir = async () => {
    if (!itemParaExcluir) return;

    setCarregando(true);
    try {
      const res = await deletarBibliografia(itemParaExcluir.id.toString());
      if (res?.success) {
        await carregarBibliografia();
        setModalConfirmarExcluirAberto(false);
        setItemParaExcluir(null);
        alert("Bibliografia excluída com sucesso!");
      } else {
        alert("Erro ao excluir: " + (res?.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir bibliografia");
    } finally {
      setCarregando(false);
    }
  };

  const getNomeDisciplina = (disciplinaId: string) => {
    const disciplina = disciplinas.find(d => d.id === disciplinaId);
    return disciplina?.nome || "Disciplina não encontrada";
  };

  const livrosFiltrados = bibliografia.filter((item) =>
    item.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  const livrosVisiveis = livrosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const totalPaginas = Math.ceil(livrosFiltrados.length / itensPorPagina);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cabeçalho do Conteúdo */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <FaSearch className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bibliografias
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Adicione links de bibliografias e conteúdos para suas disciplinas
                </p>
                {userInfo && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <FaUser className="text-xs" />
                    <span>Logado como: <strong>{userInfo.name}</strong></span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              onClick={abrirModalNovo}
              disabled={carregando}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <FaPlus className="text-lg" />
              <span className="font-semibold">Adicionar Livro</span>
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Campo de Busca */}
            <div className="relative">
              <Input
                placeholder="Buscar por título..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>

            {/* Filtro por Disciplina */}
            <Select value={filtroDisciplina} onValueChange={setFiltroDisciplina}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Disciplinas</SelectItem>
                {disciplinas.map((disc) => (
                  <SelectItem key={disc.id} value={disc.id}>
                    {disc.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Bibliografia */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {livrosVisiveis.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col justify-between shadow hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate max-w-[70%]">
                    {item.titulo}
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      title="Editar"
                      className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                      onClick={() => abrirModalEditar(item)}
                      disabled={carregando}
                    >
                      <FaEdit />
                    </button>
                    <button
                      title="Excluir"
                      className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                      onClick={() => abrirModalExcluir(item)}
                      disabled={carregando}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Disciplina: </strong>
                  {getNomeDisciplina(item.disciplina_id)}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Adicionado por: </strong>
                  {item.nome_professor || "-"}
                </p>

                <button
                  className="text-blue-600 dark:text-blue-400 flex items-center space-x-1 hover:underline"
                  onClick={() => setModalConfirmLink(item)}
                  disabled={carregando}
                >
                  <FaExternalLinkAlt />
                  <span>Abrir link</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Button
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 1 || carregando}
            >
              Anterior
            </Button>
            <span className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas || carregando}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Adicionar / Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{idEditando ? "Editar Bibliografia" : "Adicionar Bibliografia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título do livro"
                className="w-full"
                disabled={carregando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link *</label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Digite o link do livro"
                className="w-full"
                disabled={carregando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Disciplina *</label>
              <Select
                value={disciplinaSelecionada}
                onValueChange={setDisciplinaSelecionada}
                disabled={carregando}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((disc) => (
                    <SelectItem key={disc.id} value={disc.id}>
                      {disc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Informação do usuário (apenas exibição) */}
            {userInfo && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Será adicionado por:
                </label>
                <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                  <FaUser className="text-blue-500" />
                  <span className="font-medium">{userInfo.name}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              onClick={handleSalvar}
              disabled={carregando}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {carregando ? "Salvando..." : idEditando ? "Salvar alterações" : "Adicionar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setModalAberto(false);
                limparFormulario();
              }}
              disabled={carregando}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar exclusão */}
      <Dialog
        open={modalConfirmarExcluirAberto}
        onOpenChange={setModalConfirmarExcluirAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir a bibliografia <strong>{itemParaExcluir?.titulo}</strong>?</p>
          <DialogFooter className="mt-6">
            <Button
              variant="destructive"
              onClick={confirmarExcluir}
              disabled={carregando}
            >
              {carregando ? "Excluindo..." : "Excluir"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalConfirmarExcluirAberto(false)}
              disabled={carregando}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar abrir link */}
      <Dialog
        open={!!modalConfirmarLinkAberto}
        onOpenChange={() => setModalConfirmLink(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Link</DialogTitle>
          </DialogHeader>
          <p>Você será redirecionado para o link externo: <br /><strong>{modalConfirmarLinkAberto?.link}</strong></p>
          <DialogFooter className="mt-6">
            <Button
              onClick={abrirLinkConfirmado}
            >
              Continuar
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalConfirmLink(null)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bibliografia;