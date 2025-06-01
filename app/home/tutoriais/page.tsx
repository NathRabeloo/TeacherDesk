
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

const ITENS_POR_PAGINA = 6; // Ajuste conforme desejar

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

  // Paginação
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

  // Paginação: calcular total páginas
  const totalPaginas = Math.ceil(tutoriaisFiltrados.length / ITENS_POR_PAGINA);

  // Itens a exibir na página atual
  const tutoriaisPagina = tutoriaisFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPaginaAtual(novaPagina);
  };

  // Resetar página ao mudar filtro ou busca
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchQuery, tipoFiltro]);

  return (
    <div className="min-h-screen bg-blue-200 flex justify-center py-10 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-7xl">
        <h1 className="text-2xl font-bold mb-4">Tutoriais</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <Input
            placeholder="Buscar tutoriais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-1/2"
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
            <SelectTrigger className="w-full md:w-1/4">
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
          <Button onClick={() => setModalCriar(true)}>Adicionar Tutorial</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tutoriaisPagina.map((tutorial) => (
            <Card key={tutorial.id} className="relative">
              <CardContent className="p-4 bg-white rounded-lg shadow-md space-y-2 dark:bg-dark-card">
                <h2 className="text-md font-semibold">{tutorial.titulo}</h2>
                <div
                  className={`rounded text-white text-sm font-semibold px-2 py-1 text-center ${
                    tipoColors[tutorial.tipo]
                  }`}
                >
                  {tutorial.tipo.charAt(0).toUpperCase() + tutorial.tipo.slice(1)}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTutorialSelecionado(tutorial);
                      setModalVisualizar(true);
                    }}
                  >
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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
                    variant="destructive"
                    onClick={() => handleExcluir(tutorial)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              Anterior
            </Button>
            {[...Array(totalPaginas)].map((_, i) => (
              <Button
                key={i}
                variant={i + 1 === paginaAtual ? "default" : "outline"}
                onClick={() => mudarPagina(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Modal Criar */}
        <Dialog open={modalCriar} onOpenChange={setModalCriar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Tutorial</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mb-4"
            />
            <EditorDescricao content={descricao} setContent={setDescricao} />
            <Select value={tipo} onValueChange={(valor) => setTipo(valor)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="institucional">Institucional</SelectItem>
                <SelectItem value="administrativos">Administrativos</SelectItem>
                <SelectItem value="plataforma">Plataforma</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button onClick={handleCriar}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Visualizar */}
        <Dialog open={modalVisualizar} onOpenChange={setModalVisualizar}>
          <DialogContent className="max-w-3xl w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
                {tutorialSelecionado?.titulo}
              </DialogTitle>
            </DialogHeader>

            <div
              className="prose prose-lg prose-indigo max-w-none text-gray-800 dark:prose-invert dark:text-gray-200 leading-relaxed"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: tutorialSelecionado?.descricao || "Sem descrição." }}
            />

            <DialogFooter className="mt-6 flex justify-end">
              <Button
                variant="outline"
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setModalVisualizar(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Editar */}
        <Dialog open={modalEditar} onOpenChange={setModalEditar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tutorial</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mb-4"
            />
            <EditorDescricao content={descricao} setContent={setDescricao} />

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="institucional">Institucional</SelectItem>
                <SelectItem value="administrativos">Administrativos</SelectItem>
                <SelectItem value="plataforma">Plataforma</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button onClick={handleEditar}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tutoriais;

