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

import { listarTodasBibliografias } from "@/app/actions";

interface BibliografiaPublicaItem {
  id: number;
  titulo: string;
  link: string;
  disciplina_id: string;
  disciplina_nome: string;
  user_name: string;
  created_at: string;
}

interface DisciplinaPublica {
  id: string;
  nome: string;
  user_count: number;
}

const BibliografiaPublica: React.FC = () => {
  const [bibliografia, setBibliografia] = useState<BibliografiaPublicaItem[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaPublica[]>([]);
  const [modalConfirmarLinkAberto, setModalConfirmLink] = useState<BibliografiaPublicaItem | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [buscaTitulo, setBuscaTitulo] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState(""); // campo aberto agora
  const [carregando, setCarregando] = useState(true);

  const itensPorPagina = 16;

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      // Carregar disciplinas públicas (não está mais usando para filtro, mas mantido para info)
      const disciplinasData = await listarTodasBibliografias("");
      const disciplinaMap: { [id: string]: DisciplinaPublica } = {};
      (disciplinasData || []).forEach((item: any) => {
        if (item.Disciplina && Array.isArray(item.Disciplina)) {
          item.Disciplina.forEach((disc: any) => {
            if (!disciplinaMap[disc.id]) {
              disciplinaMap[disc.id] = {
                id: disc.id,
                nome: disc.nome,
                user_count: 1,
              };
            } else {
              disciplinaMap[disc.id].user_count += 1;
            }
          });
        }
      });
      setDisciplinas(Object.values(disciplinaMap));

      // Carregar bibliografias públicas
      await carregarBibliografiaPublica();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarBibliografiaPublica() {
    try {
      const data = await listarTodasBibliografias("");
      setBibliografia(
        (data ?? []).map((item: any) => ({
          id: item.id,
          titulo: item.titulo,
          link: item.link,
          disciplina_id: item.disciplina_id,
          disciplina_nome:
            item.Disciplina && Array.isArray(item.Disciplina) && item.Disciplina.length > 0
              ? item.Disciplina[0].nome
              : "",
          user_name: item.user_name ?? "",
          created_at: item.created_at,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar bibliografia pública:", error);
      alert("Erro ao carregar bibliografias");
    }
  }

  const abrirLinkConfirmado = () => {
    if (modalConfirmarLinkAberto) {
      window.open(modalConfirmarLinkAberto.link, "_blank", "noopener,noreferrer");
      setModalConfirmLink(null);
    }
  };

  const limparFiltros = () => {
    setBuscaTitulo("");
    setFiltroDisciplina("");
    setPaginaAtual(1);
  };

  // Filtrar bibliografias
  const bibliografiasFiltradas = bibliografia.filter((item) => {
    const matchTitulo = item.titulo.toLowerCase().includes(buscaTitulo.toLowerCase());
    // Aqui filtro por disciplina com contains no nome, ignorando maiúsculas/minúsculas
    const matchDisciplina =
      filtroDisciplina.trim() === "" ||
      item.disciplina_nome.toLowerCase().includes(filtroDisciplina.toLowerCase());

    return matchTitulo && matchDisciplina;
  });

  const livrosVisiveis = bibliografiasFiltradas.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const totalPaginas = Math.ceil(bibliografiasFiltradas.length / itensPorPagina);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [buscaTitulo, filtroDisciplina]);

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
            {/* Primeira linha de filtros */}
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

              {/* Campo aberto para disciplina */}
              <div className="relative">
                <Input
                  placeholder="Filtrar por disciplina (nome)"
                  value={filtroDisciplina}
                  onChange={(e) => setFiltroDisciplina(e.target.value)}
                  className="pl-4 pr-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                />
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate" title={item.titulo}>
                  {item.titulo}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Abrir link da bibliografia ${item.titulo}`}
                  onClick={() => setModalConfirmLink(item)}
                >
                  <FaExternalLinkAlt className="text-blue-600 dark:text-blue-400" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">
                Disciplina: {item.disciplina_nome || "Não informada"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto">
                Compartilhado por: {item.user_name || "Anônimo"}
              </p>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex justify-center space-x-3 py-6">
          <Button
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="flex items-center text-gray-700 dark:text-gray-300">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <Button
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Modal de confirmação para abrir link */}
      <Dialog open={modalConfirmarLinkAberto !== null} onOpenChange={() => setModalConfirmLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir link</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Você está prestes a abrir um link externo. Deseja continuar?
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setModalConfirmLink(null)}>
              Cancelar
            </Button>
            <Button onClick={abrirLinkConfirmado}>Abrir link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BibliografiaPublica;
