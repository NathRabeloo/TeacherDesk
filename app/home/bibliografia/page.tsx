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
import { FaBook, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface BibliografiaItem {
  id: number;
  titulo: string;
  link: string;
}

const Bibliografia = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaItem[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [contadorId, setContadorId] = useState(1);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 12;

  useEffect(() => {
    const storedData = localStorage.getItem("bibliografia");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setBibliografia(parsedData);
      setContadorId(parsedData.length ? parsedData[parsedData.length - 1].id + 1 : 1);
    }
  }, []);

  const salvarBibliografia = (dados: BibliografiaItem[]) => {
    localStorage.setItem("bibliografia", JSON.stringify(dados));
  };

  const adicionarBibliografia = () => {
    if (titulo && link) {
      const novoItem = {
        id: contadorId,
        titulo,
        link,
      };
      const novosDados = [...bibliografia, novoItem];
      setBibliografia(novosDados);
      salvarBibliografia(novosDados);
      setContadorId(contadorId + 1);
      setModalAberto(false);
      setTitulo("");
      setLink("");
    }
  };

  const livrosVisiveis = bibliografia.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const totalPaginas = Math.ceil(bibliografia.length / itensPorPagina);

  return (
    <div className="min-h-screen bg-blue-100 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Bibliografia</h1>

        <div className="flex justify-end mb-6">
          <Button onClick={() => setModalAberto(true)} className="flex items-center gap-2">
            <FaPlus className="w-4 h-4" />
            Adicionar Livro
          </Button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {livrosVisiveis.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow flex flex-col items-center"
            >
              <FaBook size={40} className="text-blue-500 mb-2" />
              <p className="font-semibold text-lg mb-2 truncate w-full">{item.titulo}</p>
              <Button
                asChild
                className="w-full mt-auto bg-blue-400 text-white hover:bg-blue-500"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Livro
                </a>
              </Button>

            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <button
                key={pagina}
                onClick={() => setPaginaAtual(pagina)}
                className={`px-4 py-2 rounded-lg border font-medium ${pagina === paginaAtual
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 border-blue-300"
                  }`}
              >
                {pagina}
              </button>
            ))}
          </div>
        )}

        {/* Modal */}
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Livro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título do livro"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
              <Input
                placeholder="Link do livro"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={adicionarBibliografia}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Bibliografia;


