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
import { FaPoll, FaChartBar, FaHistory, FaPlus, FaQrcode, FaLink, FaDownload, FaTrash, FaPlay, FaStop, FaSync } from "react-icons/fa";
import QRCode from "react-qr-code";
import { 
  criarEnquete, 
  listarEnquetesUsuario, 
  desativarEnquete, 
  buscarResultados,
  exportarDadosEnquete,
  deletarEnquete
} from "@/app/home/enquete/actions";

type Opcao = { texto: string; votos: number };
type EnqueteSalva = {
  id: string;
  pergunta: string;
  ativa: boolean;
  criada_em: string;
  opcoes?: Opcao[];
  resultados?: Opcao[];
  urlVotacao?: string;
};

export default function EnquetePage() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([{ texto: "", votos: 0 }, { texto: "", votos: 0 }]);
  const [enqueteAtiva, setEnqueteAtiva] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [urlVotacao, setUrlVotacao] = useState("");
  const [enqueteId, setEnqueteId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Opcao[]>([]);
  const [historicoEnquetes, setHistoricoEnquetes] = useState<EnqueteSalva[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState("");

  // Carregar enquetes do usuário ao inicializar
  useEffect(() => {
    carregarEnquetesUsuario();
  }, []);

  const carregarEnquetesUsuario = async () => {
    try {
      const result = await listarEnquetesUsuario();
      if (result.success && result.enquetes) {
        setHistoricoEnquetes(result.enquetes);
        
        // Verificar se há uma enquete ativa
        const enqueteAtivaEncontrada = result.enquetes.find((e: EnqueteSalva) => e.ativa);
        if (enqueteAtivaEncontrada) {
          setEnqueteId(enqueteAtivaEncontrada.id);
          setPergunta(enqueteAtivaEncontrada.pergunta);
          setPerguntaAtual(enqueteAtivaEncontrada.pergunta);
          setUrlVotacao(`${window.location.origin}/votar?id=${encodeURIComponent(enqueteAtivaEncontrada.id)}`);
          setEnqueteAtiva(true);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar enquetes:", error);
    }
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

  const atualizarLista = async () => {
    setLoading(true);
    try {
      await carregarEnquetesUsuario();
      alert("Lista de enquetes atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      alert("Erro ao atualizar lista de enquetes");
    } finally {
      setLoading(false);
    }
  };

  const excluirEnquete = async (enqueteIdParaExcluir: string, perguntaEnquete: string) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a enquete "${perguntaEnquete}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmacao) {
      return;
    }

    setLoading(true);
    try {
      const result = await deletarEnquete(enqueteIdParaExcluir);
      
      if (result.error) {
        alert("Erro ao excluir enquete: " + result.error);
        return;
      }

      if (result.success) {
        alert("Enquete excluída com sucesso!");
        // Recarregar lista de enquetes
        await carregarEnquetesUsuario();
      }
    } catch (error) {
      console.error("Erro ao excluir enquete:", error);
      alert("Erro inesperado ao excluir enquete");
    } finally {
      setLoading(false);
    }
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pergunta", pergunta);
      formData.append(
        "opcoes",
        JSON.stringify(opcoes.map(({ texto }) => ({ texto })))
      );

      const result = await criarEnquete(formData);

      if (result.error) {
        alert("Erro ao criar enquete: " + result.error);
        return;
      }

      if (result.success && result.enqueteId) {
        setEnqueteId(result.enqueteId);
        setPerguntaAtual(pergunta);
        const url = `${window.location.origin}/home/votar?id=${encodeURIComponent(result.enqueteId)}`;
        setUrlVotacao(url);
        setEnqueteAtiva(true);
        
        // Recarregar lista de enquetes
        await carregarEnquetesUsuario();
      }
    } catch (error) {
      console.error("Erro ao criar enquete:", error);
      alert("Erro inesperado ao criar enquete");
    } finally {
      setLoading(false);
    }
  };

  const encerrarEnquete = async () => {
    if (!enqueteId) return;

    setLoading(true);
    try {
      // Desativar enquete
      const desativarResult = await desativarEnquete(enqueteId);
      if (desativarResult.error) {
        alert("Erro ao encerrar enquete: " + desativarResult.error);
        return;
      }

      // Buscar resultados
      const resultadosData = await buscarResultados(enqueteId);
      if (resultadosData.error) {
        alert("Erro ao buscar resultados: " + resultadosData.error);
        return;
      }

      if (resultadosData.success) {
        setResultados(resultadosData.resultados);
        setMostrarResultado(true);
        setEnqueteAtiva(false);
        
        // Limpar formulário
        setPergunta("");
        setOpcoes([{ texto: "", votos: 0 }, { texto: "", votos: 0 }]);
        setEnqueteId(null);
        setUrlVotacao("");
        setPerguntaAtual("");
        
        // Recarregar lista de enquetes
        await carregarEnquetesUsuario();
      }
    } catch (error) {
      console.error("Erro ao encerrar enquete:", error);
      alert("Erro inesperado ao encerrar enquete");
    } finally {
      setLoading(false);
    }
  };

  const criarOutraEnquete = () => {
    setPergunta("");
    setOpcoes([{ texto: "", votos: 0 }, { texto: "", votos: 0 }]);
    setEnqueteAtiva(false);
    setMostrarResultado(false);
    setUrlVotacao("");
    setEnqueteId(null);
    setResultados([]);
    setPerguntaAtual("");
  };

  const exportarResultadosTxt = async (enqueteIdParaExportar?: string) => {
    const idParaUsar = enqueteIdParaExportar || enqueteId;
    
    if (!idParaUsar) {
      alert("Nenhuma enquete selecionada para exportar.");
      return;
    }

    setLoading(true);
    try {
      const result = await exportarDadosEnquete(idParaUsar);
      if (result.error) {
        alert("Erro ao exportar dados: " + result.error);
        return;
      }

      if (result.success && result.conteudo) {
        const blob = new Blob([result.conteudo], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `enquete-${idParaUsar}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro inesperado ao exportar dados");
    } finally {
      setLoading(false);
    }
  };

  const exportarHistoricoTxt = async () => {
    if (!historicoEnquetes.length) {
      alert("Nenhum histórico para exportar.");
      return;
    }

    setLoading(true);
    try {
      let conteudo = "HISTÓRICO DE ENQUETES\n";
      conteudo += "====================\n\n";

      for (let i = 0; i < historicoEnquetes.length; i++) {
        const enquete = historicoEnquetes[i];
        conteudo += `ENQUETE ${i + 1}\n`;
        conteudo += `---------\n`;
        conteudo += `Pergunta: ${enquete.pergunta}\n`;
        conteudo += `Status: ${enquete.ativa ? 'Ativa' : 'Encerrada'}\n`;
        conteudo += `Criada em: ${new Date(enquete.criada_em).toLocaleString('pt-BR')}\n`;
        
        // Buscar resultados se a enquete estiver encerrada
        if (!enquete.ativa) {
          try {
            const resultadosData = await buscarResultados(enquete.id);
            if (resultadosData.success) {
              const totalVotos = resultadosData.resultados.reduce((total: number, opcao: any) => total + opcao.votos, 0);
              conteudo += `Total de votos: ${totalVotos}\n`;
              conteudo += `Resultados:\n`;
              resultadosData.resultados.forEach((opcao: any, index: number) => {
                const percentual = totalVotos > 0 ? Math.round((opcao.votos / totalVotos) * 100) : 0;
                conteudo += `  ${index + 1}. ${opcao.texto}: ${opcao.votos} votos (${percentual}%)\n`;
              });
            }
          } catch (error) {
            conteudo += `Erro ao carregar resultados desta enquete\n`;
          }
        }
        
        conteudo += "\n";
      }

      conteudo += `\nExportado em: ${new Date().toLocaleString('pt-BR')}\n`;

      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historico-enquetes-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar histórico:", error);
      alert("Erro inesperado ao exportar histórico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
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
                        disabled={loading}
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
                                disabled={loading}
                              />
                            </div>
                            {opcoes.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerOpcao(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                                disabled={loading}
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
                        disabled={loading}
                      >
                        <FaPlus className="mr-2" />
                        Adicionar Opção
                      </Button>
                      <Button
                        onClick={gerarEnquete}
                        className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                        disabled={loading}
                      >
                        <FaPlay className="mr-2" />
                        {loading ? "Gerando..." : "Gerar Enquete"}
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
                        {perguntaAtual}
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
                            disabled={loading}
                          >
                            <FaLink className="mr-2" />
                            {copied ? "Link Copiado!" : "Copiar Link"}
                          </Button>
                          <Button
                            onClick={encerrarEnquete}
                            variant="destructive"
                            className="flex-1"
                            disabled={loading}
                          >
                            <FaStop className="mr-2" />
                            {loading ? "Encerrando..." : "Encerrar Enquete"}
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
          <div>
            <Card className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
                    <FaQrcode className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Como Usar
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Siga os passos abaixo
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                    <p>Digite a pergunta da sua enquete</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                    <p>Adicione pelo menos 2 opções de resposta</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                    <p>Clique em "Gerar Enquete"</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">4</div>
                    <p>Compartilhe o QR Code ou link com os participantes</p>
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
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                    <FaHistory className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Histórico de Enquetes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Suas enquetes criadas e resultados
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={exportarHistoricoTxt}
                    variant="outline"
                    className="border-2 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                    disabled={loading}
                  >
                    <FaDownload className="mr-2" />
                    {loading ? "Exportando..." : "Exportar Histórico"}
                  </Button>
                  <Button
                    onClick={atualizarLista}
                    variant="outline"
                    className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    disabled={loading}
                  >
                    <FaSync className="mr-2" />
                    {loading ? "Atualizando..." : "Atualizar Lista"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historicoEnquetes.map((enquete, index) => (
                  <Card key={enquete.id} className="border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Enquete #{index + 1}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          enquete.ativa 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {enquete.ativa ? 'Ativa' : 'Encerrada'}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {enquete.pergunta}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Criada em: {new Date(enquete.criada_em).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <div className="space-y-2">
                        {!enquete.ativa && (
                          <Button
                            onClick={() => exportarResultadosTxt(enquete.id)}
                            variant="outline"
                            size="sm"
                            className="w-full border-2 border-green-300 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                            disabled={loading}
                          >
                            <FaDownload className="mr-2" />
                            {loading ? "Exportando..." : "Exportar Resultados"}
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => excluirEnquete(enquete.id, enquete.pergunta)}
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          disabled={loading}
                        >
                          <FaTrash className="mr-2" />
                          {loading ? "Excluindo..." : "Excluir Enquete"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de Resultados */}
        <Dialog open={mostrarResultado} onOpenChange={setMostrarResultado}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaChartBar className="mr-3 text-blue-500" />
                Resultados da Enquete
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pergunta: {perguntaAtual}
                </h3>
                <div className="space-y-4">
                  {resultados.map((opcao, index) => {
                    const totalVotos = resultados.reduce((total, o) => total + o.votos, 0);
                    const percentual = totalVotos > 0 ? Math.round((opcao.votos / totalVotos) * 100) : 0;
                    
                    return (
                      <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {opcao.texto}
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {opcao.votos} votos ({percentual}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Total de votos: {resultados.reduce((total, opcao) => total + opcao.votos, 0)}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3">

              <Button
                onClick={criarOutraEnquete}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                <FaPlus className="mr-2" />
                Criar Nova Enquete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

