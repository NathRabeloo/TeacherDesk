"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaPoll, FaChartBar, FaHistory, FaPlus, FaQrcode, FaLink, FaDownload, FaTrash, FaPlay, FaStop } from "react-icons/fa";
import QRCode from "react-qr-code";

type Opcao = { texto: string; votos: number };
type EnqueteSalva = {
  enqueteId: string;
  pergunta: string;
  opcoes: Opcao[];
  resultados?: Opcao[];
  urlVotacao: string;
};

const STORAGE_KEY = "enqueteCriada";
const STORAGE_HISTORICO = "historicoEnquetes";

export default function EnquetePage() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([{ texto: "", votos: 0 }]);
  const [enqueteAtiva, setEnqueteAtiva] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [urlVotacao, setUrlVotacao] = useState("");
  const [enqueteId, setEnqueteId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Opcao[]>([]);
  const [historicoEnquetes, setHistoricoEnquetes] = useState<EnqueteSalva[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setPergunta(data.pergunta);
      setOpcoes(data.opcoes);
      setEnqueteId(data.enqueteId);
      setUrlVotacao(data.urlVotacao);
      setEnqueteAtiva(true);
    }

    const historico = localStorage.getItem(STORAGE_HISTORICO);
    if (historico) {
      setHistoricoEnquetes(JSON.parse(historico));
    }
  }, []);

  useEffect(() => {
    if (enqueteAtiva && enqueteId) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pergunta, opcoes, enqueteId, urlVotacao })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [enqueteAtiva, enqueteId, pergunta, opcoes, urlVotacao]);

  const atualizarHistorico = (enquete: EnqueteSalva) => {
    const novoHistorico = [enquete, ...historicoEnquetes.filter(e => e.enqueteId !== enquete.enqueteId)];
    setHistoricoEnquetes(novoHistorico);
    localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(novoHistorico));
  };

  const adicionarOpcao = () => {
    setOpcoes([...opcoes, { texto: "", votos: 0 }]);
  };

  const removerOpcao = (index: number) => {
    if (opcoes.length > 2) {
      const novasOpcoes = opcoes.filter((_, i) => i !== index);
      setOpcoes(novasOpcoes);
    }
  };

  const limparHistorico = () => {
    localStorage.removeItem(STORAGE_HISTORICO);
    setHistoricoEnquetes([]);
    alert("Histórico limpo com sucesso!");
  };

  const atualizarTextoOpcao = (index: number, novoTexto: string) => {
    const novasOpcoes = [...opcoes];
    novasOpcoes[index].texto = novoTexto;
    setOpcoes(novasOpcoes);
  };

  const gerarEnquete = async () => {
    if (!pergunta.trim()) {
      alert("Digite a pergunta da enquete");
      return;
    }
    if (opcoes.some((opcao) => !opcao.texto.trim())) {
      alert("Preencha todas as opções");
      return;
    }

    const formData = new FormData();
    formData.append("pergunta", pergunta);
    formData.append(
      "opcoes",
      JSON.stringify(opcoes.map(({ texto }) => ({ texto })))
    );

    const response = await fetch("/api/enquete", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.error) {
      alert("Erro ao criar enquete: " + data.error);
      return;
    }

    setEnqueteId(data.enqueteId);
    const url = `${window.location.origin}/home/votar?id=${encodeURIComponent(
      data.enqueteId
    )}`;
    setUrlVotacao(url);
    setEnqueteAtiva(true);
  };

  const encerrarEnquete = async () => {
    if (!enqueteId) return;

    const response = await fetch(`/api/enquete/resultados?enqueteId=${enqueteId}`);
    const data = await response.json();

    if (data.error) {
      alert("Erro ao buscar resultados: " + data.error);
      return;
    }

    setResultados(data.resultados);
    setMostrarResultado(true);

    atualizarHistorico({
      enqueteId,
      pergunta,
      opcoes,
      resultados: data.resultados,
      urlVotacao,
    });

    setEnqueteAtiva(false);
    setPergunta("");
    setOpcoes([{ texto: "", votos: 0 }]);
    setEnqueteId(null);
    setUrlVotacao("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const criarOutraEnquete = () => {
    setPergunta("");
    setOpcoes([{ texto: "", votos: 0 }]);
    setEnqueteAtiva(false);
    setMostrarResultado(false);
    setUrlVotacao("");
    setEnqueteId(null);
    setResultados([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportarResultadosTxt = () => {
    if (!resultados.length) {
      alert("Nenhum resultado para exportar.");
      return;
    }
    const linhas = resultados.map(
      (opcao) => `${opcao.texto}: ${opcao.votos} votos`
    );
    const conteudo = `Resultados da enquete:\n${pergunta}\n\n${linhas.join(
      "\n"
    )}`;

    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados-enquete-${enqueteId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarHistoricoTxt = () => {
    if (!historicoEnquetes.length) {
      alert("Nenhum histórico para exportar.");
      return;
    }

    let conteudo = "Histórico de Enquetes e Resultados:\n\n";

    historicoEnquetes.forEach((enquete, idx) => {
      conteudo += `Enquete ${idx + 1}:\nPergunta: ${enquete.pergunta}\n`;
      conteudo += "Resultados:\n";
      enquete.resultados?.forEach((opcao) => {
        conteudo += `  - ${opcao.texto}: ${opcao.votos} votos\n`;
      });
      conteudo += "\n";
    });

    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico-enquetes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FaPoll className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sistema de Enquetes
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Crie enquetes interativas com QR Code para votação em tempo real
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-2">
                  <FaPoll className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enquetes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                  <FaChartBar className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resultados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-2">
                  <FaHistory className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Histórico</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Área de Criação/Gestão da Enquete */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                    <FaPoll className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {enqueteAtiva ? "Enquete Ativa" : "Criar Nova Enquete"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {enqueteAtiva ? "Gerencie sua enquete em andamento" : "Configure sua enquete e gere o QR Code para votação"}
                    </p>
                  </div>
                </div>

                {!enqueteAtiva ? (
                  <div className="space-y-6">
                    {/* Pergunta da Enquete */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Pergunta da Enquete
                      </label>
                      <Input
                        placeholder="Digite a pergunta que deseja fazer..."
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        className="text-lg p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:bg-gray-700"
                      />
                    </div>

                    {/* Opções da Enquete */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Opções de Resposta
                      </label>
                      <div className="space-y-3">
                        {opcoes.map((opcao, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <Input
                                placeholder={`Opção ${index + 1}`}
                                value={opcao.texto}
                                onChange={(e) => atualizarTextoOpcao(index, e.target.value)}
                                className="text-lg p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:bg-gray-700"
                              />
                            </div>
                            {opcoes.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerOpcao(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={adicionarOpcao}
                        className="flex-1 py-3 text-lg font-semibold border-2 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <FaPlus className="mr-2" />
                        Adicionar Opção
                      </Button>
                      <Button
                        onClick={gerarEnquete}
                        className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                      >
                        <FaPlay className="mr-2" />
                        Gerar Enquete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Status da Enquete Ativa */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Enquete Ativa
                        </h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                        {pergunta}
                      </p>
                      <div className="flex items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 mb-4">
                        <QRCode value={urlVotacao} size={200} />
                      </div>
                      <div className="space-y-3">
                        <Input
                          readOnly
                          value={urlVotacao}
                          className="text-center font-mono text-sm bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                        />
                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(urlVotacao);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <FaLink className="mr-2" />
                            {copied ? "Link Copiado!" : "Copiar Link"}
                          </Button>
                          <Button
                            onClick={encerrarEnquete}
                            variant="destructive"
                            className="flex-1"
                          >
                            <FaStop className="mr-2" />
                            Encerrar Enquete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Área de Instruções */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                    <FaQrcode className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Como Funciona
                  </h3>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                    <p>Digite a pergunta da enquete no campo indicado</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                    <p>Adicione pelo menos duas opções de resposta</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                    <p>Clique em "Gerar Enquete" para criar o QR Code</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">4</div>
                    <p>Compartilhe o QR Code ou link para votação</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">5</div>
                    <p>Encerre a enquete para ver os resultados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Histórico */}
        {historicoEnquetes.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700 mt-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
                    <FaHistory className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Histórico de Enquetes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Visualize e gerencie suas enquetes anteriores
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={exportarHistoricoTxt}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <FaDownload className="mr-2" />
                    Exportar Histórico
                  </Button>
                  <Button
                    onClick={limparHistorico}
                    variant="destructive"
                  >
                    <FaTrash className="mr-2" />
                    Limpar Histórico
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {historicoEnquetes.map((enquete, idx) => (
                  <Card
                    key={enquete.enqueteId}
                    className="border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {enquete.pergunta}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {enquete.resultados?.map((opcao, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">{opcao.texto}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{opcao.votos} votos</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Resultados */}
      <Dialog open={mostrarResultado} onOpenChange={setMostrarResultado}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 -m-6 mb-6 p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
                <FaChartBar className="text-white text-xl" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Resultados da Enquete
                </DialogTitle>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {pergunta}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {resultados.length > 0 ? (
              resultados.map((opcao, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">{opcao.texto}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{opcao.votos}</span>
                    <span className="text-gray-600 dark:text-gray-400">votos</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">Nenhum resultado disponível.</p>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 -mx-6 -mb-6 p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Button onClick={exportarResultadosTxt} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
              <FaDownload className="mr-2" />
              Exportar Resultados
            </Button>
            <Button variant="outline" onClick={criarOutraEnquete} className="flex-1">
              <FaPlus className="mr-2" />
              Criar Outra Enquete
            </Button>
            <Button variant="secondary" onClick={() => setMostrarResultado(false)} className="flex-1">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rodapé */}
      <div className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg">Sistema de Enquetes Interativas</p>
            <p className="text-sm mt-2">Colete opiniões e feedback de forma moderna e eficiente</p>
          </div>
        </div>
      </div>
    </div>
  );
}