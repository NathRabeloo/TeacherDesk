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
  FaBook,
  FaPlus,
  FaSearch,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import {
  criarBibliografia,
  listarBibliografias,
  editarBibliografia,
  deletarBibliografia,
  listarDisciplinas,
} from "@/app/actions";

interface BibliografiaItem {
  id: number;
  titulo: string;
  link: string;
  disciplina_id: string;
  user_id: string;
  created_at?: string;
}

interface Disciplina {
  id: string;
  nome: string;
}

const Bibliografia: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
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
        setBibliografia(data ?? []);
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

  // Obter nome da disciplina
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

  if (carregando && bibliografia.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  Buscar Bibliografia
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Adicione e edite livros de bibliografia para suas disciplinas
                </p>
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
              <SelectTrigger className="py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400">
                <SelectValue placeholder="Filtrar por disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as disciplinas</SelectItem>
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Livros */}
        <div className="p-8">
          {livrosVisiveis.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <FaBook className="text-gray-400 text-3xl" />
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">Nenhum livro encontrado</p>
              <p className="text-gray-400 dark:text-gray-500">Tente ajustar sua busca ou adicione novos livros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {livrosVisiveis.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                        <FaBook className="text-white text-xl" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                          {item.titulo}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getNomeDisciplina(item.disciplina_id)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={() => setModalConfirmLink(item)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <FaExternalLinkAlt />
                        <span className="font-semibold">Abrir Livro</span>
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => abrirModalEditar(item)}
                          disabled={carregando}
                          className="flex items-center justify-center space-x-1 border-2 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 disabled:opacity-50"
                        >
                          <FaEdit />
                          <span>Editar</span>
                        </Button>
                        
                        <Button
                          onClick={() => abrirModalExcluir(item)}
                          disabled={carregando}
                          className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          <FaTrash />
                          <span>Excluir</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaAtual(pagina)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                    pagina === paginaAtual
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500"
                  }`}
                >
                  {pagina}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {idEditando ? "Editar Bibliografia" : "Adicionar Bibliografia"}
            </DialogTitle>
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
              <label className="block text-sm font-medium mb-2">Disciplina *</label>
              <Select value={disciplinaSelecionada} onValueChange={setDisciplinaSelecionada} disabled={carregando}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={carregando}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="bg-blue-600 hover:bg-blue-700" disabled={carregando}>
              {carregando ? "Salvando..." : (idEditando ? "Salvar Alterações" : "Adicionar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Link */}
      <Dialog open={!!modalConfirmarLinkAberto} onOpenChange={() => setModalConfirmLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Link Externo</DialogTitle>
          </DialogHeader>
          <p>Você será redirecionado para um site externo. Deseja continuar?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalConfirmLink(null)}>
              Cancelar
            </Button>
            <Button onClick={abrirLinkConfirmado} className="bg-blue-600 hover:bg-blue-700">
              Abrir Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={modalConfirmarExcluirAberto} onOpenChange={setModalConfirmarExcluirAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir esta bibliografia?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalConfirmarExcluirAberto(false)} disabled={carregando}>
              Cancelar
            </Button>
            <Button onClick={confirmarExcluir} className="bg-red-600 hover:bg-red-700" disabled={carregando}>
              {carregando ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bibliografia;
