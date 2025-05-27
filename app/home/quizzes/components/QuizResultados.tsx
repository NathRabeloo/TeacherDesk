"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface Resultado {
  resumo: {
    total_participantes: number;
    total_respostas: number;
    taxa_acerto_geral: number;
  };
  ranking: {
    id: string;
    nome: string;
    ra: string;
    totalRespostas: number;
    totalAcertos: number;
    percentualAcerto: number;
    tempoTotal: number;
  }[];
  perguntas: {
    id: string;
    texto: string;
    totalRespostas: number;
    totalAcertos: number;
    percentualAcerto: number;
  }[];
}

interface QuizResultadosProps {
  quizId: string;
  onBack?: () => void;
}

export default function QuizResultados({ quizId, onBack }: QuizResultadosProps) {
  const [dados, setDados] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResultados = async () => {
    if (!quizId) {
      setError("ID do quiz não fornecido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Buscando resultados para quiz:", quizId);
      const res = await fetch(`/api//quizzes/resultados?quizId=${quizId}`);
      
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
  };

  useEffect(() => {
    fetchResultados();
  }, [quizId]);

  const formatarTempo = (tempoMs: number) => {
    if (tempoMs === 0) return "0s";
    const segundos = Math.floor(tempoMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    
    if (minutos > 0) {
      return `${minutos}m ${segundosRestantes}s`;
    }
    return `${segundosRestantes}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Button>
          )}
          <h1 className="text-2xl font-bold">Resultados do Quiz</h1>
        </div>
        <div className="text-center py-8">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Button>
          )}
          <h1 className="text-2xl font-bold">Resultados do Quiz</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar resultados: {error}</p>
            <Button onClick={fetchResultados} className="flex items-center gap-2 mx-auto">
              <RefreshCw size={16} />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Button>
          )}
          <h1 className="text-2xl font-bold">Resultados do Quiz</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhum dado encontrado para este quiz.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        )}
        <h1 className="text-2xl font-bold">Resultados do Quiz</h1>
        <Button 
          variant="outline" 
          onClick={fetchResultados}
          className="flex items-center gap-2 ml-auto"
        >
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </div>

      {/* Resumo */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Resumo Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dados.resumo.total_participantes}
              </div>
              <div className="text-sm text-gray-600">Participantes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dados.resumo.total_respostas}
              </div>
              <div className="text-sm text-gray-600">Respostas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {dados.resumo.taxa_acerto_geral.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Acerto</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Ranking de Participantes</h2>
          {dados.ranking.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum participante encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>RA</TableHead>
                    <TableHead className="text-center">Acertos</TableHead>
                    <TableHead className="text-center">% Acerto</TableHead>
                    <TableHead className="text-center">Tempo Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.ranking.map((participante, index) => (
                    <TableRow key={participante.id}>
                      <TableCell className="font-medium">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>{participante.nome}</TableCell>
                      <TableCell>{participante.ra}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {participante.totalAcertos}/{participante.totalRespostas}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded ${
                          participante.percentualAcerto >= 70 ? 'bg-green-100 text-green-800' :
                          participante.percentualAcerto >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {participante.percentualAcerto.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {formatarTempo(participante.tempoTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas por Pergunta */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Estatísticas por Pergunta</h2>
          {dados.perguntas.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma pergunta encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead className="text-center">Respostas</TableHead>
                    <TableHead className="text-center">Acertos</TableHead>
                    <TableHead className="text-center">% Acerto</TableHead>
                    <TableHead className="text-center">Dificuldade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados.perguntas.map((pergunta, index) => (
                    <TableRow key={pergunta.id}>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={pergunta.texto}>
                          <span className="font-semibold text-sm text-gray-600">
                            {index + 1}.
                          </span>{" "}
                          {pergunta.texto}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{pergunta.totalRespostas}</TableCell>
                      <TableCell className="text-center">{pergunta.totalAcertos}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded text-sm ${
                          pergunta.percentualAcerto >= 70 ? 'bg-green-100 text-green-800' :
                          pergunta.percentualAcerto >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {pergunta.percentualAcerto.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          pergunta.percentualAcerto >= 70 ? 'bg-green-100 text-green-700' :
                          pergunta.percentualAcerto >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pergunta.percentualAcerto >= 70 ? 'Fácil' :
                           pergunta.percentualAcerto >= 50 ? 'Média' : 'Difícil'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}