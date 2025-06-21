"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FaBook,
  FaSearch,
  FaExternalLinkAlt,
  FaGlobe,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

import { listarTodasBibliografias, listarTodasDisciplinas } from "@/app/actions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BibliografiaPublicaItem {
  id: number;
  titulo: string;
  link: string;
  disciplina_id: string;
  disciplina_nome: string;
  nome_professor: string;
  created_at: string;
}

interface DisciplinaPublica {
  id: string;
  nome: string;
}

interface DisciplinaPorProfessor {
  id: string;
  nome: string;
  professor: string;
}

const BibliografiaPublica: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaPublicaItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaPublica[]>([]);
  const [modalConfirmarLinkAberto, setModalConfirmLink] = useState<BibliografiaPublicaItem | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [buscaTitulo, setBuscaTitulo] = useState("");
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroDisciplinaId, setFiltroDisciplinaId] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [professores, setProfessores] = useState<string[]>([]);
  const [disciplinasPorProfessor, setDisciplinasPorProfessor] = useState<DisciplinaPorProfessor[]>([]);

  const itensPorPagina = 16;
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const disciplinasData = await listarTodasDisciplinas();
      setDisciplinas(disciplinasData);
      await carregarBibliografiaPublica();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarBibliografiaPublica() {
    try {
      const data = await listarTodasBibliografias();

      const bibliografiasFormatadas = (data ?? []).map((item: any) => ({
        id: item.id,
        titulo: item.titulo,
        link: item.link,
        disciplina_id: item.disciplina_id,
        disciplina_nome:
          item.Disciplina && item.Disciplina.nome
            ? item.Disciplina.nome
            : "Não informada",
        nome_professor: item.nome_professor || "Anônimo",
        created_at: item.created_at,
      }));

      setBibliografia(bibliografiasFormatadas);

      const nomesUnicos = Array.from(
        new Set(bibliografiasFormatadas.map((b) => b.nome_professor))
      ).sort();

      setProfessores(nomesUnicos);

      const disciplinasUnicas = bibliografiasFormatadas.reduce((acc: DisciplinaPorProfessor[], item) => {
        const chaveUnica = `${item.disciplina_id}-${item.nome_professor}`;
        
        if (!acc.find(d => `${d.id}-${d.professor}` === chaveUnica)) {
          acc.push({
            id: item.disciplina_id,
            nome: item.disciplina_nome,
            professor: item.nome_professor
          });
        }
        
        return acc;
      }, []);

      setDisciplinasPorProfessor(disciplinasUnicas);
    } catch (error) {
      console.error("Erro ao carregar bibliografia pública:", error);
      alert("Erro ao carregar bibliografias");
    }
  }

  const disciplinasDisponiveis = filtroProfessor
    ? disciplinasPorProfessor
        .filter(d => d.professor === filtroProfessor)
        .reduce((acc: { id: string; nome: string }[], curr) => {
          if (!acc.find(d => d.nome === curr.nome)) {
            acc.push({ id: curr.id, nome: curr.nome });
          }
          return acc;
        }, [])
        .sort((a, b) => a.nome.localeCompare(b.nome))
    : [];

  const bibliografiasFiltradas = bibliografia.filter((item) => {
    const professorMatch =
      filtroProfessor === "" || item.nome_professor === filtroProfessor;
    
    const disciplinaMatch = filtroDisciplinaId === "" || 
      (item.disciplina_id === filtroDisciplinaId && item.nome_professor === filtroProfessor);
    
    const tituloMatch = item.titulo.toLowerCase().includes(buscaTitulo.toLowerCase());

    return professorMatch && disciplinaMatch && tituloMatch;
  });

  const livrosVisiveis = bibliografiasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const totalPaginas = Math.ceil(bibliografiasFiltradas.length / itensPorPagina);

  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaTitulo, filtroProfessor, filtroDisciplinaId]);

  const handleFiltroProfessorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroProfessor(e.target.value);
    setFiltroDisciplinaId("");
  };

  const handleFiltroDisciplinaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroDisciplinaId(e.target.value);
  };

  const abrirLinkConfirmado = () => {
    if (modalConfirmarLinkAberto) {
      window.open(modalConfirmarLinkAberto.link, "_blank", "noopener,noreferrer");
      setModalConfirmLink(null);
    }
  };

  const limparFiltros = () => {
    setBuscaTitulo("");
    setFiltroProfessor("");
    setFiltroDisciplinaId("");
  };

  const temFiltrosAtivos = buscaTitulo || filtroProfessor || filtroDisciplinaId;

  if (carregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Carregando bibliografias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 z-50 group flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/30 text-blue-700 hover:text-white hover:bg-blue-600 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-110"
        title="Voltar para página inicial"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <FaGlobe className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Bibliografia Pública
                </h1>
                <p className="text-white/90 text-lg mt-1">
                  Explore bibliografias compartilhadas por toda a comunidade
                </p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-2 text-white">
                <FaBook className="text-xl" />
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {bibliografiasFiltradas.length}
                  </div>
                  <div className="text-sm opacity-90">
                    {bibliografiasFiltradas.length === 1 ? "livro encontrado" : "livros encontrados"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-8 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3 mb-6">
            <FaFilter className="text-blue-500 text-lg" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filtros de Pesquisa
            </h3>
            {temFiltrosAtivos && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                Ativos
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Busca por título */}
            <div className="relative">
              <Input
                placeholder="Buscar por título..."
                value={buscaTitulo}
                onChange={(e) => setBuscaTitulo(e.target.value)}
                className="h-12 pl-12 pr-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Select Professor */}
            <div>
              <select
                value={filtroProfessor}
                onChange={handleFiltroProfessorChange}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 text-base"
              >
                <option value="">Todos os professores</option>
                {professores.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Disciplina */}
            <div>
              <select
                value={filtroDisciplinaId}
                onChange={handleFiltroDisciplinaChange}
                disabled={filtroProfessor === ""}
                className={`w-full h-12 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 text-base ${
                  filtroProfessor === "" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">
                  {filtroProfessor === "" 
                    ? "Selecione um professor primeiro" 
                    : "Todas as disciplinas"}
                </option>
                {disciplinasDisponiveis.map((disc) => (
                  <option key={`${disc.id}-${disc.nome}`} value={disc.id}>
                    {disc.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão limpar filtros */}
          {temFiltrosAtivos && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="h-12 px-6 text-base font-medium rounded-xl flex items-center space-x-2"
              >
                <FaTimes className="text-sm" />
                <span>Limpar filtros</span>
              </Button>
            </div>
          )}
        </div>

        {/* Grid de Bibliografias */}
        <div className="p-8">
          {livrosVisiveis.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaBook className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Tente ajustar os filtros de pesquisa
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {livrosVisiveis.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-grow mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {item.titulo}
                      </h3>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Disciplina:</span> {item.disciplina_nome}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Professor:</span> {item.nome_professor}
                        </p>
                      </div>
                    </div>

                    <button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                      onClick={() => setModalConfirmLink(item)}
                      aria-label={`Abrir link da bibliografia ${item.titulo}`}
                    >
                      <FaExternalLinkAlt className="text-sm" />
                      <span>Abrir Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center space-x-4 pb-8">
            <Button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
              className="h-12 px-6 text-base rounded-xl"
            >
              ← Anterior
            </Button>
            
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                Página {paginaAtual} de {totalPaginas}
              </span>
            </div>
            
            <Button
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
              className="h-12 px-6 text-base rounded-xl"
            >
              Próxima →
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={!!modalConfirmarLinkAberto} onOpenChange={() => setModalConfirmLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar abertura de link</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Você está prestes a abrir o seguinte link externo: <strong>{modalConfirmarLinkAberto?.titulo}</strong>
          </p>
          <DialogFooter className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setModalConfirmLink(null)}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button 
              onClick={abrirLinkConfirmado}
              className="h-11 px-6"
            >
              Abrir Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BibliografiaPublica;