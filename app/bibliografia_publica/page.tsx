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
import { FaBook, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import {
  listarBibliografias,
} from "@/app/actions";

interface BibliografiaItem {
  id: number;
  titulo: string;
  link: string;
}

const Bibliografia: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaItem[]>([]);
  const [modalConfirmarLinkAberto, setModalConfirmLink] = useState<BibliografiaItem | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [busca, setBusca] = useState("");

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

  const abrirLinkConfirmado = () => {
    if (modalConfirmarLinkAberto) {
      window.open(modalConfirmarLinkAberto.link, "_blank", "noopener,noreferrer");
      setModalConfirmLink(null);
    }
  };

  // Filtra a bibliografia conforme o texto da busca
  const livrosFiltrados = bibliografia.filter((item) =>
    item.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  // Itens da página atual
  const livrosVisiveis = livrosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const totalPaginas = Math.ceil(livrosFiltrados.length / itensPorPagina);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white flex justify-center items-start py-12 px-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-900">
          Bibliografia
        </h1>

        {/* Barra de pesquisa */}
        <div className="flex justify-between items-center mb-8 max-w-md mx-auto relative">
          <Input
            placeholder="Buscar título..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-blue-400 pointer-events-none" />
        </div>

        {/* Lista de livros */}
        {livrosVisiveis.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum livro encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {livrosVisiveis.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="flex items-center mb-4 gap-3">
                  <FaBook size={36} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {item.titulo}
                  </h2>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <Button
                    onClick={() => setModalConfirmLink(item)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2 hover:brightness-110 transition"
                  >
                    Abrir Livro
                    <FaExternalLinkAlt />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
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
                      : "bg-white text-blue-600 border-blue-300 hover:bg-blue-100"
                    }`}
                >
                  {pagina}
                </button>
              )
            )}
          </div>
        )}

        {/* Modal Confirmar Abrir Link */}
        <Dialog
          open={!!modalConfirmarLinkAberto}
          onOpenChange={() => setModalConfirmLink(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-800">
                Confirmar abertura do link
              </DialogTitle>
            </DialogHeader>

            {modalConfirmarLinkAberto && (
              <div className="mb-6">
                <p className="font-semibold text-gray-700 mb-2">
                  Título:
                </p>
                <p className="mb-4 text-blue-900 truncate">{modalConfirmarLinkAberto.titulo}</p>

                <p className="font-semibold text-gray-700 mb-2">
                  Link:
                </p>
                <a
                  href={modalConfirmarLinkAberto.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {modalConfirmarLinkAberto.link}
                </a>
              </div>
            )}

            <DialogFooter className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setModalConfirmLink(null)}>
                Cancelar
              </Button>
              <Button onClick={abrirLinkConfirmado}>Abrir Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bibliografia;
