"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaBook } from "react-icons/fa"; // Importe o FaBook aqui
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
  const [contadorId, setContadorId] = useState(1); // Para gerenciar os IDs únicos
  const router = useRouter();

  // Função para carregar os dados do LocalStorage
  useEffect(() => {
    const storedData = localStorage.getItem("bibliografia");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setBibliografia(parsedData);
      setContadorId(parsedData.length ? parsedData[parsedData.length - 1].id + 1 : 1);
    }
  }, []);

  // Função para salvar os dados no LocalStorage
  const salvarBibliografia = (dados: BibliografiaItem[]) => {
    localStorage.setItem("bibliografia", JSON.stringify(dados));
  };

  // Função para adicionar livro
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
      setContadorId(contadorId + 1); // Incrementa o contador de IDs
      setModalAberto(false);
      setTitulo("");
      setLink("");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Bibliografia</h1>

      {/* Botão para abrir o modal */}
      <Button onClick={() => setModalAberto(true)} className="mb-6">
        Adicionar Livro
      </Button>

      {/* Exibição dos livros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bibliografia.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-hover"
            onClick={() => router.push(item.link)}
          >
            <FaBook size={40} className="text-blue-500 mb-2" />
            <p className="font-semibold text-lg">{item.titulo}</p>
          </div>
        ))}
      </div>

      {/* Modal para adicionar livro */}
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
  );
};

export default Bibliografia;
