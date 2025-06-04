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
  FaBook,
  FaPlus,
  FaSearch,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaGraduationCap,
  FaBookOpen,
  FaUniversity, 
} from "react-icons/fa";

import {
  criarBibliografia,
  listarBibliografias,
  editarBibliografia,
  deletarBibliografia,
} from "@/app/actions";

interface BibliografiaItem {
  id: number;
  titulo: string;
  link: string;
}

const Bibliografia: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaItem[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfirmarExcluirAberto, setModalConfirmarExcluirAberto] = useState(false);
  const [modalConfirmarLinkAberto, setModalConfirmLink] = useState<BibliografiaItem | null>(null);

  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState("");
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [itemParaExcluir, setItemParaExcluir] = useState<BibliografiaItem | null>(null);

  const itensPorPagina = 12;

  useEffect(() => {
    carregarBibliografia();
  }, []);

  async function carregarBibliografia() {
    const { data, error } = await listarBibliografias();
    if (error) {
      console.error("Erro ao listar bibliografias:", error);
    } else {
      setBibliografia(data ?? []);
    }
  }

  const handleSalvar = async () => {
    if (!titulo.trim() || !link.trim()) {
      alert("Título e link são obrigatórios!");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("link", link);

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
      setTitulo("");
      setLink("");
      setIdEditando(null);
    } else {
      console.error("Erro ao salvar:", res?.error);
      alert("Erro ao salvar bibliografia: " + res?.error);
    }
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
    setModalAberto(true);
  };

  const abrirModalExcluir = (item: BibliografiaItem) => {
    setItemParaExcluir(item);
    setSenhaExcluir("");
    setModalConfirmarExcluirAberto(true);
  };

  const confirmarExcluir = async () => {
    if (senhaExcluir !== "admin123") {
      alert("Senha incorreta para exclusão!");
      return;
    }
    if (!itemParaExcluir) return;

    const res = await deletarBibliografia(itemParaExcluir.id.toString());
    if (res?.success) {
      await carregarBibliografia();
      setModalConfirmarExcluirAberto(false);
      setItemParaExcluir(null);
      setSenhaExcluir("");
    } else {
      alert("Erro ao excluir: " + res?.error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FaBook className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Biblioteca Digital
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Acesse e gerencie recursos bibliográficos
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                  <FaBookOpen className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{bibliografia.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                  <FaUniversity className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coleção</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Digital</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaGraduationCap className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acadêmico</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
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
                    Encontre recursos específicos na coleção
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setModalAberto(true);
                  setIdEditando(null);
                  setTitulo("");
                  setLink("");
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <FaPlus className="text-lg" />
                <span className="font-semibold">Adicionar Livro</span>
              </Button>
            </div>
          </div>

          {/* Campo de Busca */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-600">
            <div className="relative max-w-md mx-auto">
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
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {item.titulo}
                          </h3>
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
                            className="flex items-center justify-center space-x-1 border-2 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                          >
                            <FaEdit />
                            <span>Editar</span>
                          </Button>
                          
                          <Button
                            onClick={() => abrirModalExcluir(item)}
                            className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center space-x-1"
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
      </div>

      {/* Modais */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {idEditando ? "Editar Bibliografia" : "Adicionar Bibliografia"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título do livro"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Link</label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Digite o link do livro"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="bg-blue-600 hover:bg-blue-700">
              {idEditando ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={modalConfirmarExcluirAberto} onOpenChange={setModalConfirmarExcluirAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Para excluir este item, digite a senha de administrador:</p>
            <Input
              type="password"
              value={senhaExcluir}
              onChange={(e) => setSenhaExcluir(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalConfirmarExcluirAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarExcluir} className="bg-red-600 hover:bg-red-700">
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bibliografia;