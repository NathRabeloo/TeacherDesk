"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaPoll, FaCheckCircle, FaChartBar } from "react-icons/fa";
import { buscarEnquete, registrarVoto } from "@/app/home/enquete/actions";

type Opcao = {
  id: string;
  texto: string;
  votos: number;
};

export default function VotarPage() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null);
  const [jaVotou, setJaVotou] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingVoto, setLoadingVoto] = useState(false);
  const [erro, setErro] = useState("");
  const [enqueteId, setEnqueteId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    
    if (!id) {
      setErro("ID da enquete não fornecido");
      setLoading(false);
      return;
    }

    setEnqueteId(id);
    carregarEnquete(id);
  }, []);

  const carregarEnquete = async (id: string) => {
    try {
      setLoading(true);
      const result = await buscarEnquete(id);
      
      if (result.error) {
        setErro(result.error);
        return;
      }

      if (result.success) {
        setPergunta(result.pergunta);
        setOpcoes(result.opcoes);
        
        // Verificar se já votou (usando localStorage para controle local)
        const jaVotouKey = `votou_enquete_${id}`;
        const jaVotouLocal = localStorage.getItem(jaVotouKey);
        if (jaVotouLocal) {
          setJaVotou(true);
          setOpcaoSelecionada(jaVotouLocal);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar enquete:", error);
      setErro("Erro inesperado ao carregar enquete");
    } finally {
      setLoading(false);
    }
  };

  const handleVotar = async () => {
    if (!opcaoSelecionada || !enqueteId) return;

    setLoadingVoto(true);
    try {
      const result = await registrarVoto(enqueteId, opcaoSelecionada);
      
      if (result.error) {
        alert("Erro ao registrar voto: " + result.error);
        return;
      }

      if (result.success) {
        // Marcar como votado no localStorage
        const jaVotouKey = `votou_enquete_${enqueteId}`;
        localStorage.setItem(jaVotouKey, opcaoSelecionada);
        
        setJaVotou(true);
        
        // Recarregar dados para mostrar resultados atualizados
        await carregarEnquete(enqueteId);
      }
    } catch (error) {
      console.error("Erro ao votar:", error);
      alert("Erro inesperado ao registrar voto");
    } finally {
      setLoadingVoto(false);
    }
  };

  const calcularPercentual = (votos: number) => {
    const totalVotos = opcoes.reduce((total, opcao) => total + opcao.votos, 0);
    return totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando enquete...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FaPoll className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Erro
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {erro}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            {!jaVotou ? (
              // Interface de Votação
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FaPoll className="text-white text-2xl" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Enquete
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Selecione uma opção e vote
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                    {pergunta}
                  </h2>
                </div>

                <div className="space-y-3">
                  {opcoes.map((opcao) => (
                    <button
                      key={opcao.id}
                      onClick={() => setOpcaoSelecionada(opcao.id)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                        opcaoSelecionada === opcao.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      disabled={loadingVoto}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          opcaoSelecionada === opcao.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-400 dark:border-gray-500'
                        }`}>
                          {opcaoSelecionada === opcao.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <span className="text-lg font-medium">{opcao.texto}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleVotar}
                  disabled={!opcaoSelecionada || loadingVoto}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingVoto ? "Registrando voto..." : "Confirmar Voto"}
                </Button>
              </div>
            ) : (
              // Interface de Resultados
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="p-4 rounded-full bg-gradient-to-r from-green-500 to-blue-600 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FaCheckCircle className="text-white text-2xl" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Voto Registrado!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Obrigado por participar da enquete
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">
                    {pergunta}
                  </h2>
                  <div className="flex items-center justify-center">
                    <FaChartBar className="text-blue-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Resultados em tempo real
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {opcoes.map((opcao) => {
                    const percentual = calcularPercentual(opcao.votos);
                    const foiEscolhida = opcaoSelecionada === opcao.id;
                    
                    return (
                      <div 
                        key={opcao.id} 
                        className={`p-4 rounded-xl border-2 ${
                          foiEscolhida 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${
                              foiEscolhida 
                                ? 'text-green-700 dark:text-green-300' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {opcao.texto}
                            </span>
                            {foiEscolhida && (
                              <FaCheckCircle className="text-green-500 text-sm" />
                            )}
                          </div>
                          <span className={`text-lg font-bold ${
                            foiEscolhida 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {opcao.votos} ({percentual}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              foiEscolhida 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-4">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Total de votos: {opcoes.reduce((total, opcao) => total + opcao.votos, 0)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

