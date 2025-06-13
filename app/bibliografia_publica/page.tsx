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
} from "react-icons/fa";

import { listarTodasBibliografias, listarTodasDisciplinas } from "@/app/actions";

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

const BibliografiaPublica: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaPublicaItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaPublica[]>([]);
  const [modalConfirmarLinkAberto, setModalConfirmLink] = useState<BibliografiaPublicaItem | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [buscaTitulo, setBuscaTitulo] = useState("");
  const [filtroDisciplinaId, setFiltroDisciplinaId] = useState(""); // filtro agora pelo id da disciplina
  const [carregando, setCarregando] = useState(true);

  const itensPorPagina = 16;

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      // Buscar disciplinas
      const disciplinasData = await listarTodasDisciplinas();
      setDisciplinas(disciplinasData);

      // Carregar bibliografias públicas sem filtro inicial
      await carregarBibliografiaPublica();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarBibliografiaPublica(filtroDisciplinaId?: string) {
    try {
      // Passa filtroDisciplinaId para backend
      const data = await listarTodasBibliografias(filtroDisciplinaId || "");

      setBibliografia(
        (data ?? []).map((item: any) => ({
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
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar bibliografia pública:", error);
      alert("Erro ao carregar bibliografias");
    }
  }

  // Atualiza filtro e recarrega bibliografias
  const handleFiltroDisciplinaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFiltroDisciplinaId(id);
    setPaginaAtual(1);
    setCarregando(true);
    await carregarBibliografiaPublica(id === "all" ? "" : id);
    setCarregando(false);
  };

  const abrirLinkConfirmado = () => {
    if (modalConfirmarLinkAberto) {
      window.open(modalConfirmarLinkAberto.link, "_blank", "noopener,noreferrer");
      setModalConfirmLink(null);
    }
  };

  const limparFiltros = async () => {
    setBuscaTitulo("");
    setFiltroDisciplinaId("");
    setPaginaAtual(1);
    setCarregando(true);
    await carregarBibliografiaPublica();
    setCarregando(false);
  };

  // Filtrar bibliografias só por título (pois o filtro da disciplina já foi aplicado no backend)
  const bibliografiasFiltradas = bibliografia.filter((item) =>
    item.titulo.toLowerCase().includes(buscaTitulo.toLowerCase())
  );

  const livrosVisiveis = bibliografiasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const totalPaginas = Math.ceil(bibliografiasFiltradas.length / itensPorPagina);

  // Resetar página quando o filtro de título mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaTitulo]);

  if (carregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-500 dark:text-gray-400">Carregando bibliografias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cabeçalho do Conteúdo */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-100 dark:from-emerald-900 dark:to-blue-800 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600">
                <FaGlobe className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bibliografia Pública
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  Explore bibliografias compartilhadas por toda a comunidade
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2 text-sm">
                <FaBook className="text-blue-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {bibliografiasFiltradas.length} {bibliografiasFiltradas.length === 1 ? "livro encontrado" : "livros encontrados"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo de Busca por Título */}
              <div className="relative">
                <Input
                  placeholder="Buscar por título..."
                  value={buscaTitulo}
                  onChange={(e) => setBuscaTitulo(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              </div>

              {/* Select para filtro por disciplina */}
              <div>
                <select
                  value={filtroDisciplinaId}
                  onChange={handleFiltroDisciplinaChange}
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                >
                  <option value="">Todas as disciplinas</option>
                  {disciplinas.map((disc) => (
                    <option key={disc.id} value={disc.id}>
                      {disc.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Bibliografias */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {livrosVisiveis.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
              Nenhum resultado encontrado para os filtros aplicados.
            </p>
          )}
          {livrosVisiveis.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.titulo}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Disciplina: <strong>{item.disciplina_nome}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Professor: <strong>{item.nome_professor}</strong>
                </p>
              </div>

              <button
                className="mt-4 inline-flex items-center space-x-2 text-blue-600 hover:underline"
                onClick={() => setModalConfirmLink(item)}
                aria-label={`Abrir link da bibliografia ${item.titulo}`}
              >
                <FaExternalLinkAlt />
                <span>Abrir Link</span>
              </button>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
            >
              Anterior
            </Button>
            <span className="inline-flex items-center px-3 text-gray-700 dark:text-gray-300">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Modal para confirmar abertura do link */}
      <Dialog open={!!modalConfirmarLinkAberto} onOpenChange={() => setModalConfirmLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir link</DialogTitle>
          </DialogHeader>
          <p className="mb-6">
            Você está prestes a abrir o seguinte link externo:{" "}
            <strong>{modalConfirmarLinkAberto?.titulo}</strong>
          </p>
          <DialogFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setModalConfirmLink(null)}>
              Cancelar
            </Button>
            <Button onClick={abrirLinkConfirmado}>Abrir Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BibliografiaPublica;
