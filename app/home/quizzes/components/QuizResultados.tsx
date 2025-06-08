"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Users, Target, TrendingUp, Clock, Award, BarChart3, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RankingItem } from "../../../responder/_components/types"; // Importar RankingItem do types.ts

interface Resultado {
  resumo: {
    total_participantes: number;
    total_perguntas: number;
    taxa_acerto_geral: number;
  };
  ranking: RankingItem[]; // Usar o tipo RankingItem
  perguntas: {
    id: string;
    texto: string;
    totalRespostas: number;
    totalAcertos: number;
    percentualAcerto: number;
  }[];
  sessao?: {
    id: string;
    nome: string;
    data: string;
  } | null;
}

interface QuizResultadosProps {
  quizId: string;
  sessionId?: string;
  onBack?: () => void;
}

export default function QuizResultados({ quizId, sessionId, onBack }: QuizResultadosProps) {
  const [dados, setDados] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessoes, setSessoes] = useState<{id: string, nome: string}[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(sessionId);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const fetchSessoes = React.useCallback(async () => {
    if (!quizId) return;
    
    setIsLoadingSessions(true);
    try {
      // Usar a função listarSessoesQuiz do action.ts
      const response = await fetch(`/api/quizzes/sessoes?quizId=${quizId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar sessões");
      }
      const data = await response.json();
      setSessoes(data);
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [quizId]);

  const fetchResultados = React.useCallback(async () => {
    if (!quizId) {
      setError("ID do quiz não fornecido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Buscando resultados para quiz:", quizId, "sessão:", selectedSessionId);
      let url = `/api/quizzes/resultados?quizId=${quizId}`;
      if (selectedSessionId) {
        url += `&sessionId=${selectedSessionId}`;
      }
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Dados recebidos:", data);
      setDados(data);
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      setDados(null);
    } finally {
      setLoading(false);
    }
  }, [quizId, selectedSessionId]);

  useEffect(() => {
    fetchSessoes();
  }, [quizId, fetchSessoes]);

  useEffect(() => {
    fetchResultados();
  }, [quizId, selectedSessionId, fetchResultados]);

  const formatarTempo = (tempoMs: number) => {
    if (tempoMs === 0 || !tempoMs) return "N/A";
    
    const segundos = Math.floor(tempoMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    
    if (minutos > 0) {
      return `${minutos}m ${segundosRestantes}s`;
    }
    return `${segundosRestantes}s`;
  };

  const formatarTempoDetalhado = (tempoMs: number) => {
    if (tempoMs === 0 || !tempoMs) return "0s";
    
    const segundos = Math.floor(tempoMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    
    const minutosRestantes = minutos % 60;
    const segundosRestantes = segundos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutosRestantes}m ${segundosRestantes}s`;
    }
    if (minutos > 0) {
      return `${minutos}m ${segundosRestantes}s`;
    }
    return `${segundosRestantes}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {onBack && (
                    <Button 
                      variant="outline" 
                      onClick={onBack} 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>
                  )}
                  <div className="bg-white/20 p-3 rounded-xl">
                    <BarChart3 className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Resultados do Quiz</h1>
                    <p className="text-purple-100 text-lg mt-1">Carregando dados estatísticos...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Content */}
            <div className="p-8">
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <RefreshCw className="animate-spin h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Carregando Resultados</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">Processando dados dos participantes...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {onBack && (
                    <Button 
                      variant="outline" 
                      onClick={onBack} 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>
                  )}
                  <div className="bg-white/20 p-3 rounded-xl">
                    <BarChart3 className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Erro nos Resultados</h1>
                    <p className="text-red-100 text-lg mt-1">Problema ao carregar dados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="p-8">
              <div className="text-center py-16">
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erro ao Carregar</h3>
                <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error}</p>
                <Button 
                  onClick={fetchResultados} 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 mx-auto"
                >
                  <RefreshCw size={20} />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {onBack && (
                    <Button 
                      variant="outline" 
                      onClick={onBack} 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>
                  )}
                  <div className="bg-white/20 p-3 rounded-xl">
                    <BarChart3 className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Sem Dados</h1>
                    <p className="text-gray-100 text-lg mt-1">Nenhum resultado encontrado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* No Data Content */}
            <div className="p-8">
              <div className="text-center py-16">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nenhum Dado Encontrado</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">Este quiz ainda não possui resultados para exibir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onBack && (
                  <Button 
                    variant="outline" 
                    onClick={onBack} 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>
                )}
                <div className="bg-white/20 p-3 rounded-xl">
                  <BarChart3 className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Resultados do Quiz</h1>
                  <p className="text-purple-100 text-lg mt-1">Análise completa de desempenho e estatísticas</p>
                  {dados.sessao && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      <Tag className="w-3.5 h-3.5 mr-1" />
                      {dados.sessao.nome}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {sessoes.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-2 border border-white/20">
                    <Select
                      value={selectedSessionId || "all"}
                      onValueChange={(value) => setSelectedSessionId(value === "all" ? undefined : value)}
                    >
                      <SelectTrigger className="w-[200px] bg-transparent border-0 text-white focus:ring-0">
                        <SelectValue placeholder="Filtrar por sessão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as sessões</SelectItem>
                        {sessoes.map((sessao) => (
                          <SelectItem key={sessao.id} value={sessao.id}>
                            {sessao.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button 
                  onClick={fetchResultados}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                >
                  <RefreshCw size={16} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Resumo Geral */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                  <TrendingUp className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumo Geral</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-500 p-3 rounded-xl">
                      <Users className="text-white text-xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {dados.resumo.total_participantes}
                      </div>
                      <div className="text-sm text-blue-600/70 dark:text-blue-400/70 font-medium">Participantes</div>
                    </div>
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 text-sm">
                    Total de estudantes que responderam
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-2xl border border-green-200 dark:border-green-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500 p-3 rounded-xl">
                      <Target className="text-white text-xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {dados.resumo.total_perguntas}
                      </div>
                      <div className="text-sm text-green-600/70 dark:text-green-400/70 font-medium">Perguntas</div>
                    </div>
                  </div>
                  <div className="text-green-700 dark:text-green-300 text-sm">
                    Número total de perguntas no quiz
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-500 p-3 rounded-xl">
                      <Award className="text-white text-xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {dados.resumo.taxa_acerto_geral.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">Acerto Geral</div>
                    </div>
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 text-sm">
                    Média de acertos de todos os participantes
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking de Participantes */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                  <Award className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ranking de Participantes</h2>
              </div>
              
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Pos.</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>RA</TableHead>
                        <TableHead className="text-center">Acertos</TableHead>
                        <TableHead className="text-center">% Acerto</TableHead>
                        <TableHead className="text-center">Tempo Total</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.ranking.map((participante, index) => (
                        <TableRow key={participante.id} className={`${
                          index === 0 ? "bg-yellow-50 dark:bg-yellow-900/20" : 
                          index === 1 ? "bg-gray-100 dark:bg-gray-700/20" : 
                          index === 2 ? "bg-amber-50 dark:bg-amber-900/20" : ""
                        }`}>
                          <TableCell className="font-medium">
                            {index === 0 && <Award className="inline-block mr-1 text-yellow-500" size={16} />}
                            {index === 1 && <Award className="inline-block mr-1 text-gray-400" size={16} />}
                            {index === 2 && <Award className="inline-block mr-1 text-amber-700" size={16} />}
                            {index + 1}
                          </TableCell>
                          <TableCell>{participante.nome}</TableCell>
                          <TableCell>{participante.ra}</TableCell>
                          <TableCell className="text-center">{participante.totalAcertos}/{dados.resumo.total_perguntas}</TableCell>
                          <TableCell className="text-center">{participante.percentualAcerto.toFixed(1)}%</TableCell>
                          <TableCell className="text-center">{formatarTempo(participante.tempoTotal)}</TableCell>
                          <TableCell className="text-center font-bold text-lg">
                            {typeof participante.score === 'number' ? participante.score.toLocaleString("pt-BR") : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Análise por Pergunta */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-2 rounded-lg">
                  <BarChart3 className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Análise por Pergunta</h2>
              </div>
              
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Pergunta</TableHead>
                        <TableHead className="text-center">Total Respostas</TableHead>
                        <TableHead className="text-center">Acertos</TableHead>
                        <TableHead className="text-center">% Acerto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.perguntas.map((pergunta, index) => (
                        <TableRow key={pergunta.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{pergunta.texto}</TableCell>
                          <TableCell className="text-center">{pergunta.totalRespostas}</TableCell>
                          <TableCell className="text-center">{pergunta.totalAcertos}</TableCell>
                          <TableCell className="text-center">{pergunta.percentualAcerto.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

