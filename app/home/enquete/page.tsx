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

  // Salva enquete ativa no localStorage
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

  // Salva histórico atualizado no localStorage
  const atualizarHistorico = (enquete: EnqueteSalva) => {
    const novoHistorico = [enquete, ...historicoEnquetes.filter(e => e.enqueteId !== enquete.enqueteId)];
    setHistoricoEnquetes(novoHistorico);
    localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(novoHistorico));
  };

  const adicionarOpcao = () => {
    setOpcoes([...opcoes, { texto: "", votos: 0 }]);
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

    // Atualiza histórico com resultados
    atualizarHistorico({
      enqueteId,
      pergunta,
      opcoes,
      resultados: data.resultados,
      urlVotacao,
    });

    // Enquete encerrada, remove ativa
    setEnqueteAtiva(false);
    setPergunta("");
    setOpcoes([{ texto: "", votos: 0 }]);
    setEnqueteId(null);
    setUrlVotacao("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const voltarPaginaFuncionalidades = () => {
    window.location.href = "/home/funcionalidades";
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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Criar Enquete</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">Como criar uma enquete:</h2>
        <ul className="list-disc list-inside text-gray-700">
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
            className="mb-4"
          />
          {opcoes.map((opcao, index) => (
            <Input
              key={index}
              placeholder={`Opção ${index + 1}`}
              value={opcao.texto}
              onChange={(e) => atualizarTextoOpcao(index, e.target.value)}
              className="mb-2"
            />
          ))}
          <Button variant="outline" onClick={adicionarOpcao} className="mb-4">
            Adicionar Opção
          </Button>
          <Button onClick={gerarEnquete}>Gerar Enquete</Button>
        </>
      )}

      {enqueteAtiva && (
        <div className="space-y-4">
          <p className="text-lg font-semibold">Compartilhe o QR Code para votação:</p>
          <div className="bg-white p-4 inline-block rounded border">
            <QRCode value={urlVotacao} size={180} />
          </div>
          <p className="break-all">{urlVotacao}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button variant="destructive" onClick={encerrarEnquete}>
              Encerrar Enquete
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Resultados */}
      <Dialog open={mostrarResultado} onOpenChange={setMostrarResultado}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado da Enquete</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="font-semibold">{pergunta}</p>
            {(resultados.length > 0 ? resultados : opcoes).map((opcao, index) => (
              <div key={index} className="flex justify-between">
                <span>{opcao.texto}</span>
                <span>{opcao.votos} votos</span>
              </div>
            ))}
          </div>
          <DialogFooter className="flex justify-between">
            <Button onClick={() => setMostrarResultado(false)}>Fechar</Button>
            <Button onClick={exportarResultadosTxt} variant="outline">
              Exportar Resultados (.txt)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico de Enquetes */}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">Histórico de Enquetes</h2>
        {historicoEnquetes.length === 0 && (
          <p className="text-gray-600">Nenhuma enquete encerrada ainda.</p>
        )}
        {historicoEnquetes.length > 0 && (
          <>
            <ul className="max-h-48 overflow-auto mb-4 space-y-3">
              {historicoEnquetes.map((enq, idx) => (
                <li key={enq.enqueteId} className="border rounded p-3 bg-gray-50">
                  <p className="font-semibold">{idx + 1}. {enq.pergunta}</p>
                  <ul className="pl-4 list-disc text-sm">
                    {enq.resultados?.map((opt, i) => (
                      <li key={i}>
                        {opt.texto}: {opt.votos} votos
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <Button onClick={exportarHistoricoTxt} variant="outline">
              Exportar Histórico Completo (.txt)
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
