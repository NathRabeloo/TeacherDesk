"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EditorDescricao } from "../../_components/EditorDescricao";
import {
  criarTutorial,
  listarTutoriais,
  editarTutorial,
  deletarTutorial,
} from "../../actions";

const tipoColors: Record<string, string> = {
  tecnico: "bg-blue-500",
  institucional: "bg-pink-400",
  plataforma: "bg-violet-500",
  administrativos: "bg-green-600",
  outro: "bg-green-500",
};

const ITENS_POR_PAGINA = 6;

const Tutoriais = () => {
  const [tutoriais, setTutoriais] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [modalCriar, setModalCriar] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [tutorialSelecionado, setTutorialSelecionado] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    carregarTutoriais();
  }, []);

  const carregarTutoriais = async () => {
    const data = await listarTutoriais();
    setTutoriais(data);
  };

  const handleCriar = async () => {
    const form = new FormData();
    form.append("titulo", titulo);
    form.append("tipo", tipo);
    form.append("descricao", descricao);
    const result = await criarTutorial(form);
    if (result.success) {
      setModalCriar(false);
      setTitulo("");
      setTipo("");
      setDescricao("");
      carregarTutoriais();
    }
  };

  const handleEditar = async () => {
    if (!tutorialSelecionado) return;
    const form = new FormData();
    form.append("id", tutorialSelecionado.id);
    form.append("titulo", titulo);
    form.append("tipo", tipo);
    form.append("descricao", descricao);
    const result = await editarTutorial(form);
    if (result.success) {
      setModalEditar(false);
      setTutorialSelecionado(null);
      carregarTutoriais();
    }
  };

  const handleExcluir = async (tutorial: any) => {
    const confirma = confirm(`Deseja realmente excluir o tutorial "${tutorial.titulo}"?`);
    if (!confirma) return;

    const senha = prompt("Digite a senha de admin para confirmar a exclusão:");
    if (senha !== "admin123") {
      alert("Senha incorreta! Exclusão cancelada.");
      return;
    }

    const result = await deletarTutorial(tutorial.id);
    if (result.success) {
      carregarTutoriais();
    } else {
      alert("Erro ao excluir o tutorial.");
    }
  };

  const tutoriaisFiltrados = tutoriais.filter((t) => {
    const matchSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoFiltro ? t.tipo === tipoFiltro : true;
    return matchSearch && matchTipo;
  });

  const totalPaginas = Math.ceil(tutoriaisFiltrados.length / ITENS_POR_PAGINA);
  const tutoriaisPagina = tutoriaisFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [searchQuery, tipoFiltro]);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)] flex justify-center py-10 px-4">
      <div className="bg-white dark:bg-[var(--card)] rounded-lg shadow-lg p-6 w-full max-w-7xl border dark:border-white">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Tutoriais</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <Input
            placeholder="Buscar tutoriais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-1/2 text-black dark:text-white border dark:border-white rounded-xl"
          />
          <Select
            value={tipoFiltro}
            onValueChange={(valor) => {
              if (valor === tipoFiltro) {
                setTipoFiltro("");
              } else {
                setTipoFiltro(valor);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-1/4 text-black dark:text-white border dark:border-white rounded-xl">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnico">Técnico</SelectItem>
              <SelectItem value="institucional">Institucional</SelectItem>
              <SelectItem value="administrativos">Administrativos</SelectItem>
              <SelectItem value="plataforma">Plataforma</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setModalCriar(true)}
            className="bg-blue-200 text-black hover:bg-blue-300 dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500 rounded-xl"
          >
            Adicionar Tutorial
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tutoriaisPagina.map((tutorial) => (
            <Card key={tutorial.id} className="relative rounded-xl border dark:border-white">
              <CardContent className="p-4 bg-white dark:bg-[var(--card)] text-black dark:text-white space-y-2 rounded-xl">
                <h2 className="text-md font-semibold">{tutorial.titulo}</h2>
                <div className={`rounded text-white text-sm font-semibold px-2 py-1 text-center ${tipoColors[tutorial.tipo]}`}>
                  {tutorial.tipo.charAt(0).toUpperCase() + tutorial.tipo.slice(1)}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    className="bg-blue-200 text-black hover:bg-blue-300 dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500 rounded-xl"
                    onClick={() => {
                      setTutorialSelecionado(tutorial);
                      setModalVisualizar(true);
                    }}
                  >
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-200 text-black hover:bg-green-300 dark:bg-green-400 dark:text-white dark:hover:bg-green-500 rounded-xl"
                    onClick={() => {
                      setTutorialSelecionado(tutorial);
                      setTitulo(tutorial.titulo);
                      setTipo(tutorial.tipo);
                      setDescricao(tutorial.descricao);
                      setModalEditar(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-200 text-black hover:bg-red-300 dark:bg-red-500 dark:text-white dark:hover:bg-red-600 rounded-xl"
                    onClick={() => handleExcluir(tutorial)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="rounded-xl text-black dark:text-white border dark:border-white"
            >
              Anterior
            </Button>
            {[...Array(totalPaginas)].map((_, i) => (
              <Button
                key={i}
                variant={i + 1 === paginaAtual ? "default" : "outline"}
                onClick={() => mudarPagina(i + 1)}
                className="rounded-xl text-black dark:text-white border dark:border-white"
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="rounded-xl text-black dark:text-white border dark:border-white"
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Diálogos permanecem os mesmos, se desejar aplicar também bordas e cores neles posso complementar */}
      </div>
    </div>
  );
};

export default Tutoriais;


