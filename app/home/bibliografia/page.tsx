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
  const [modalConfirmarExcluirAberto, setModalConfirmarExcluirAberto] =
    useState(false);
  const [modalConfirmarLinkAberto, setModalConfirmLink] =
    useState<BibliografiaItem | null>(null);

  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState("");
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [itemParaExcluir, setItemParaExcluir] =
    useState<BibliografiaItem | null>(null);

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
    <div className="min-h-screen bg-blue-100 dark:bg-zinc-900 flex justify-center items-start py-12 px-6">
      <div className="w-full max-w-7xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-900 dark:text-white">
          Bibliografia
        </h1>

        <div className="flex justify-between items-center mb-8 max-w-md mx-auto relative">
          <Input
            placeholder="Buscar título..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="pl-10 border border-white text-black dark:text-white"
          />

          <FaSearch className="absolute left-3 top-3 text-blue-400 pointer-events-none" />
        </div>

        <div className="flex justify-center mb-10">
          <Button
            onClick={() => {
              setModalAberto(true);
              setIdEditando(null);
              setTitulo("");
              setLink("");
            }}
            className="flex items-center gap-3 bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 px-6 py-3 rounded-full shadow-lg"
          >
            <FaPlus size={20} />
            Adicionar Livro
          </Button>
        </div>

        {livrosVisiveis.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Nenhum livro encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {livrosVisiveis.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-700 p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="flex items-center mb-4 gap-3">
                  <FaBook size={36} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {item.titulo}
                  </h2>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <Button
                    onClick={() => setModalConfirmLink(item)}
                    className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 font-semibold rounded-lg py-2 flex items-center justify-center gap-2"
                  >
                    Abrir Livro
                    <FaExternalLinkAlt />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => abrirModalEditar(item)}
                    className="w-20 flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 border-blue-700 dark:border-blue-300 hover:bg-blue-100 dark:hover:bg-zinc-600"
                  >
                    <FaEdit />
                    Editar
                  </Button>

                  <Button
                    onClick={() => abrirModalExcluir(item)}
                    className="w-20 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <FaTrash />
                    Excluir
                  </Button>

                </div>
              </div>
            ))}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex justify-center mt-14 space-x-3">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaAtual(pagina)}
                  className={`w-10 h-10 rounded-full border font-semibold text-lg flex items-center justify-center transition
                    ${pagina === paginaAtual
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white dark:bg-zinc-600 text-blue-600 dark:text-white border-blue-300 hover:bg-blue-100 dark:hover:bg-zinc-500"
                    }`}
                >
                  {pagina}
                </button>
              )
            )}
          </div>
        )}

        {/* Modais seguem inalterados visualmente, mas já estão dentro da hierarquia */}
      </div>
    </div>
  );
};

export default Bibliografia;
