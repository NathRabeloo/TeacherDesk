"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";

type Opcao = { texto: string; votos: number };

export default function EnquetePage() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([{ texto: "", votos: 0 }]);
  const [enqueteAtiva, setEnqueteAtiva] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [urlVotacao, setUrlVotacao] = useState("");
  const [enqueteId, setEnqueteId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Opcao[]>([]);

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

    // Enviar opções como JSON string dentro do FormData
    formData.append("opcoes", JSON.stringify(opcoes.map(({ texto }) => ({ texto }))));

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
    const url = `${window.location.origin}/home/votar?id=${encodeURIComponent(data.enqueteId)}`; // <-- aqui passe `id`
    setUrlVotacao(url);
    setEnqueteAtiva(true);
  };

  const encerrarEnquete = async () => {
    if (!enqueteId) return;

    // Usar parâmetro `id` (igual ao backend espera)
    const response = await fetch(`/api/enquete/resultados?id=${enqueteId}`);
    const data = await response.json();

    if (data.error) {
      alert("Erro ao buscar resultados: " + data.error);
      return;
    }

    setResultados(data.resultados);
    setMostrarResultado(true);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar Enquete</h1>

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
          <p className="text-lg font-semibold">Compartilhe o QR Code:</p>
          <div className="bg-white p-4 inline-block">
            <QRCode value={urlVotacao} size={180} />
          </div>
          <p className="break-all">{urlVotacao}</p>
          <Button variant="destructive" onClick={encerrarEnquete}>
            Encerrar Enquete
          </Button>
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
          <DialogFooter>
            <Button onClick={() => setMostrarResultado(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
