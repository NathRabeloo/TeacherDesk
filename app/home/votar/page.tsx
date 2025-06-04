"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaVoteYea, FaChartBar, FaUsers, FaTrophy, FaCheck, FaPoll } from "react-icons/fa";

type Opcao = {
  id: string;
  texto: string;
  votos: number;
};

function VotarPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [votado, setVotado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEnquete, setLoadingEnquete] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) {
      setErro("Enquete não encontrada.");
      setLoadingEnquete(false);
      return;
    }

    setLoadingEnquete(true);
    fetch(`/api/enquete?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar enquete");
        return res.json();
      })
      .then((data) => {
        setPergunta(data.pergunta);
        setOpcoes(data.opcoes);
        setErro("");
      })
      .catch(() => {
        setErro("Enquete não encontrada ou erro ao carregar");
        setPergunta("");
        setOpcoes([]);
      })
      .finally(() => setLoadingEnquete(false));
  }, [id]);

  const votar = async (opcaoId: string) => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await fetch("/api/enquete/votar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enqueteId: id, opcaoId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao registrar voto");

      setOpcoes((oldOpcoes) =>
        oldOpcoes.map((opcao) =>
          opcao.id === opcaoId ? { ...opcao, votos: opcao.votos + 1 } : opcao
        )
      );

      setVotado(true);
    } catch (error: any) {
      alert(error.message || "Falha ao registrar voto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const totalVotos = opcoes.reduce((total, opcao) => total + opcao.votos, 0);

  const getPercentual = (votos: number) => {
    if (totalVotos === 0) return 0;
    return Math.round((votos / totalVotos) * 100);
  };

  if (loadingEnquete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Carregando enquete...</p>
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-700 p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPoll className="text-red-600 dark:text-red-400 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erro</h2>
            <p className="text-red-600 dark:text-red-400">{erro}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <FaVoteYea className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sistema de Enquetes
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Participe e faça sua escolha
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                  <FaChartBar className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resultados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaUsers className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Participantes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-2">
                  <FaTrophy className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencedor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cabeçalho da Enquete */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <FaPoll className="text-white text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pergunta}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                  {votado ? "Obrigado pela sua participação!" : "Escolha uma das opções abaixo"}
                </p>
              </div>
              {totalVotos > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalVotos}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {totalVotos === 1 ? "voto" : "votos"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opções de Votação */}
          <div className="p-8">
            {opcoes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPoll className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Nenhuma opção disponível.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {opcoes.map((opcao, index) => {
                  const percentual = getPercentual(opcao.votos);
                  const gradients = [
                    "from-blue-500 to-blue-600",
                    "from-green-500 to-green-600", 
                    "from-purple-500 to-purple-600",
                    "from-orange-500 to-orange-600",
                    "from-pink-500 to-pink-600",
                    "from-indigo-500 to-indigo-600"
                  ];
                  const gradient = gradients[index % gradients.length];

                  return (
                    <Card 
                      key={opcao.id} 
                      className={`transition-all duration-300 transform hover:scale-[1.02] border-2 ${
                        votado 
                          ? "border-gray-200 dark:border-gray-600" 
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                      } bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {opcao.texto}
                              </span>
                              {votado && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span>{opcao.votos} {opcao.votos === 1 ? "voto" : "votos"}</span>
                                  <span>({percentual}%)</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Barra de Progresso */}
                            {votado && totalVotos > 0 && (
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                                <div 
                                  className={`bg-gradient-to-r ${gradient} h-3 rounded-full transition-all duration-700 ease-out`}
                                  style={{ width: `${percentual}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            {votado ? (
                              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full">
                                <FaCheck className="text-green-600 dark:text-green-400 text-lg" />
                              </div>
                            ) : (
                              <Button 
                                disabled={loading} 
                                onClick={() => votar(opcao.id)}
                                className={`bg-gradient-to-r ${gradient} hover:shadow-lg text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105`}
                              >
                                {loading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Votando...</span>
                                  </div>
                                ) : (
                                  "Votar"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {votado && (
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                      Voto registrado com sucesso!
                    </h3>
                    <p className="text-green-600 dark:text-green-300 mt-1">
                      Obrigado pela sua participação. Você pode ver os resultados atualizados acima.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Sistema de Enquetes Interativas</p>
            <p className="text-sm mt-2">Sua opinião é importante para nós</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VotarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Carregando enquete...</p>
          </div>
        </div>
      </div>
    }>
      <VotarPageInner />
    </Suspense>
  );
}