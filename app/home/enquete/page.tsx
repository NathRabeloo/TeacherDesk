"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";

type Opcao = { texto: string; votos: number };

export default function EnquetePage() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([{ texto: "", votos: 0 }]);
  const [enqueteAtiva, setEnqueteAtiva] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [urlVotacao, setUrlVotacao] = useState("");

  const adicionarOpcao = () => {
    setOpcoes([...opcoes, { texto: "", votos: 0 }]);
  };

  const atualizarTextoOpcao = (index: number, novoTexto: string) => {
    const novasOpcoes = [...opcoes];
    novasOpcoes[index].texto = novoTexto;
    setOpcoes(novasOpcoes);
  };

  const gerarEnquete = () => {
    const id = Date.now().toString(); // ID simples temporário
    localStorage.setItem(`enquete-${id}`, JSON.stringify({ pergunta, opcoes }));
    const url = `${window.location.origin}/home/votar?id=${id}`;
    setUrlVotacao(url);
    setEnqueteAtiva(true);
  };

  const encerrarEnquete = () => {
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
            {opcoes.map((opcao, index) => (
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
