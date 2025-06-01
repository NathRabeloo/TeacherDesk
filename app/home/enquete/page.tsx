"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
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
    <div className="min-h-screen bg-blue-200 flex justify-center py-6 px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-3xl p-6 dark:bg-gray-900 dark:text-gray-100 flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-center">Criar Enquete</h1>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-2">Como criar uma enquete:</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>Digite a pergunta da enquete no campo indicado.</li>
            <li>Adicione pelo menos duas opções de resposta, preenchendo os campos abaixo.</li>
            <li>Você pode adicionar mais opções clicando em <b>Adicionar Opção</b>.</li>
            <li>Após preencher, clique em <b>Gerar Enquete</b> para criar a enquete e obter o QR Code para votação.</li>
            <li>Compartilhe o QR Code ou o link para que as pessoas possam votar.</li>
            <li>Quando quiser, encerre a enquete para ver e exportar os resultados.</li>
          </ul>
        </div>

        {!enqueteAtiva && (
          <>
            <Input
              placeholder="Digite a pergunta da enquete"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              className="mb-4 dark:bg-gray-800 dark:border-gray-700"
            />
            {opcoes.map((opcao, index) => (
              <Input
                key={index}
                placeholder={`Opção ${index + 1}`}
                value={opcao.texto}
                onChange={(e) => atualizarTextoOpcao(index, e.target.value)}
                className="mb-2 dark:bg-gray-800 dark:border-gray-700"
              />
            ))}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={adicionarOpcao}
                className="flex-1 bg-orange-400 text-white text-sm py-2 px-4 rounded-md hover:bg-orange-500"
              >
                Adicionar Opção
              </Button>
              <Button
                onClick={gerarEnquete}
                className="flex-1 bg-blue-400 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-500"
              >
                Gerar Enquete
              </Button>
            </div>
          </>
        )}

        {enqueteAtiva && (
          <>
            <p className="mb-4 text-center font-semibold dark:text-gray-300">
              Enquete ativa! Compartilhe o QR Code para que as pessoas votem:
            </p>
            <div className="flex justify-center mb-6 bg-white p-4 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
              <QRCode value={urlVotacao} size={180} />
            </div>
            <Input
              readOnly
              value={urlVotacao}
              className="mb-4 dark:bg-gray-800 dark:border-gray-700"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(urlVotacao);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="mb-6 w-full"
            >
              {copied ? "Link copiado!" : "Copiar Link"}
            </Button>
            <Button
              variant="destructive"
              onClick={encerrarEnquete}
              className="w-full"
            >
              Encerrar Enquete
            </Button>
          </>
        )}

        <Dialog open={mostrarResultado} onOpenChange={setMostrarResultado}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resultados da Enquete</DialogTitle>
            </DialogHeader>
            {resultados.length > 0 ? (
              <ul className="space-y-2 mt-4">
                {resultados.map((opcao, idx) => (
                  <li key={idx} className="text-lg font-medium">
                    {opcao.texto}: {opcao.votos} votos
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum resultado disponível.</p>
            )}
            <DialogFooter className="flex flex-col gap-2 mt-6">
              <Button onClick={exportarResultadosTxt} className="w-full">
                Exportar Resultados (.txt)
              </Button>
              <Button variant="outline" onClick={criarOutraEnquete} className="w-full">
                Criar Outra Enquete
              </Button>
              <Button variant="secondary" onClick={() => setMostrarResultado(false)} className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-10 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-center">Histórico de Enquetes</h2>
          {historicoEnquetes.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400">Nenhuma enquete encerrada ainda.</p>
          )}
          {historicoEnquetes.map((enquete, idx) => (
            <div
              key={enquete.enqueteId}
              className="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            >
              <p className="font-semibold">{enquete.pergunta}</p>
              <ul className="ml-4 list-disc mt-1">
                {enquete.resultados?.map((opcao, i) => (
                  <li key={i}>
                    {opcao.texto}: {opcao.votos} votos
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {historicoEnquetes.length > 0 && (
            <>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={exportarHistoricoTxt}
                  className="flex-1 bg-blue-400 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-500"
                >
                  Exportar Histórico (.txt)
                </Button>
                <Button
                  onClick={limparHistorico}
                  className="flex-1 bg-orange-400 text-white text-sm py-2 px-4 rounded-md hover:bg-orange-500"
                >
                  Limpar Histórico
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
