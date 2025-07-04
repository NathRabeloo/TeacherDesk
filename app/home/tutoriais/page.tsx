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
  DialogDescription,
} from "@/components/ui/dialog";
import { EditorDescricao } from "../../_components/EditorDescricao";
import {
  criarTutorial,
  listarTutoriais,
  editarTutorial,
  deletarTutorial,
} from "../../actions";
import {
  FaBook,
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaCog,
  FaBuilding,
  FaDesktop,
  FaFileAlt,
  FaQuestionCircle
} from "react-icons/fa";

const tipoColors: Record<string, string> = {
  tecnico: "from-blue-500 to-blue-600",
  institucional: "from-pink-500 to-pink-600", 
  plataforma: "from-purple-500 to-purple-600",
  administrativos: "from-green-500 to-green-600",
  outro: "from-gray-500 to-gray-600",
};

const tipoIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tecnico: FaCog,
  institucional: FaBuilding,
  plataforma: FaDesktop,
  administrativos: FaFileAlt,
  outro: FaQuestionCircle,
};

const Tutoriais = () => {
  const [tutoriais, setTutoriais] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("all");
  const [modalCriar, setModalCriar] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [tutorialSelecionado, setTutorialSelecionado] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  useEffect(() => {
    carregarTutoriais();
  }, []);

  const carregarTutoriais = async () => {
    const data = await listarTutoriais();
    setTutoriais(data);
  };

  // Lógica de filtro e paginação
  const tutoriaisFiltrados = tutoriais.filter((t) => {
    const matchSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoFiltro === "all" ? true : t.tipo === tipoFiltro;
    return matchSearch && matchTipo;
  });

  const totalPaginas = Math.ceil(tutoriaisFiltrados.length / itensPorPagina);
  const tutoriaisPaginados = tutoriaisFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Resetar página quando os filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchQuery, tipoFiltro]);

  const handleCriar = async () => {
    try {
      const form = new FormData();
      form.append("titulo", titulo);
      form.append("tipo", tipo);
      form.append("descricao", descricao);
      
      const result = await criarTutorial(form);
      if (result.success) {
        setTitulo("");
        setTipo("");
        setDescricao("");
        await carregarTutoriais();
        setModalCriar(false);
        setPaginaAtual(1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao criar tutorial:", error);
      return false;
    }
  };

  const handleEditar = async () => {
    if (!tutorialSelecionado) return;
    
    try {
      const form = new FormData();
      form.append("id", tutorialSelecionado.id);
      form.append("titulo", titulo);
      form.append("tipo", tipo);
      form.append("descricao", descricao);
      
      const result = await editarTutorial(form);
      if (result.success) {
        setModalEditar(false);
        setTutorialSelecionado(null);
        await carregarTutoriais();
      }
    } catch (error) {
      console.error("Erro ao editar tutorial:", error);
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

    try {
      const result = await deletarTutorial(tutorial.id);
      if (result.success) {
        await carregarTutoriais();
        if (tutoriaisPaginados.length === 1 && paginaAtual > 1) {
          setPaginaAtual(paginaAtual - 1);
        }
      }
    } catch (error) {
      console.error("Erro ao excluir tutorial:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tutoriais
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Acesse  tutoriais de apoio
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => {
                setModalCriar(true);
                setTitulo("");
                setTipo("");
                setDescricao("");
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-lg font-semibold"
            >
              <FaPlus />
              Novo Tutorial
            </Button>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar tutoriais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <Select
              value={tipoFiltro}
              onValueChange={setTipoFiltro}
            >
              <SelectTrigger className="w-full md:w-48 h-12 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="institucional">Institucional</SelectItem>
                <SelectItem value="administrativos">Administrativos</SelectItem>
                <SelectItem value="plataforma">Plataforma</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-8">
          {tutoriaisPaginados.length === 0 ? (
            <div className="text-center py-12">
              {/* <FaBook className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400">Nenhum tutorial encontrado</p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">Tente ajustar seus filtros de busca</p> */}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutoriaisPaginados.map((tutorial) => {
                  const IconComponent = tipoIcons[tutorial.tipo] || FaQuestionCircle;
                  return (
                    <Card
                      key={tutorial.id}
                      className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-center">
                          <div className={`bg-gradient-to-r ${tipoColors[tutorial.tipo]} p-4 rounded-2xl shadow-lg`}>
                            <IconComponent className="text-3xl text-white" />
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                            {tutorial.titulo}
                          </h3>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${tipoColors[tutorial.tipo]}`}>
                            {tutorial.tipo.charAt(0).toUpperCase() + tutorial.tipo.slice(1)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-4">
                          <Button
                            onClick={() => {
                              setTutorialSelecionado(tutorial);
                              setModalVisualizar(true);
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                          >
                            <FaEye />
                            Visualizar
                          </Button>

                          {!tutorial.fixo && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setTutorialSelecionado(tutorial);
                                  setTitulo(tutorial.titulo);
                                  setTipo(tutorial.tipo);
                                  setDescricao(tutorial.descricao);
                                  setModalEditar(true);
                                }}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                              >
                                <FaEdit />
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleExcluir(tutorial)}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                              >
                                <FaTrash />
                                Excluir
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPaginas > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="rounded-xl"
                  >
                    Anterior
                  </Button>
                  
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <Button
                      key={i}
                      variant={paginaAtual === i + 1 ? "default" : "outline"}
                      onClick={() => setPaginaAtual(i + 1)}
                      className="rounded-xl"
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="rounded-xl"
                  >
                    Próximo
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Criar */}
      <Dialog open={modalCriar} onOpenChange={setModalCriar}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Criar Novo Tutorial
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Adicione um novo tutorial ao sistema
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="Digite o título do tutorial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="administrativos">Administrativos</SelectItem>
                  <SelectItem value="plataforma">Plataforma</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <EditorDescricao
                content={descricao}
                setContent={setDescricao}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="ghost"
              onClick={() => setModalCriar(false)}
              className="px-6 py-2 text-lg font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                const success = await handleCriar();
                if (success) {
                  setModalCriar(false);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Criar Tutorial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Visualizar */}
      <Dialog open={modalVisualizar} onOpenChange={setModalVisualizar}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            {tutorialSelecionado && (
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${tipoColors[tutorialSelecionado.tipo]}`}>
                  {React.createElement(tipoIcons[tutorialSelecionado.tipo] || FaQuestionCircle, {
                    className: "text-white text-xl"
                  })}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tutorialSelecionado.titulo}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                    {tutorialSelecionado.tipo.charAt(0).toUpperCase() + tutorialSelecionado.tipo.slice(1)}
                  </DialogDescription>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="p-8">
            {tutorialSelecionado && (
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: tutorialSelecionado.descricao }}
              />
            )}
          </div>

          <DialogFooter className="flex justify-end gap-3 px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="ghost"
              onClick={() => setModalVisualizar(false)}
              className="px-6 py-2 text-lg font-semibold"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                <FaEdit className="text-white text-xl" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Editar Tutorial
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Modifique as informações do tutorial
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="institucional">Institucional</SelectItem>
                  <SelectItem value="administrativos">Administrativos</SelectItem>
                  <SelectItem value="plataforma">Plataforma</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <EditorDescricao
                content={descricao}
                setContent={setDescricao}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="ghost"
              onClick={() => setModalEditar(false)}
              className="px-6 py-2 text-lg font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await handleEditar();
                setModalEditar(false);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tutoriais;