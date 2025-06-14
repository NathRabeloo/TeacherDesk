"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

interface EnqueteCriadorProps {
  onCriar: (pergunta: string, opcoes: string[]) => void;
  linkVotacao: string;
}

const EnqueteCriador: React.FC<EnqueteCriadorProps> = ({ onCriar, linkVotacao }) => {
  const [pergunta, setPergunta] = useState("");
  const [novaOpcao, setNovaOpcao] = useState("");
  const [opcoes, setOpcoes] = useState<string[]>([]);
  const [enqueteCriada, setEnqueteCriada] = useState(false);

  const adicionarOpcao = () => {
    if (novaOpcao.trim()) {
      setOpcoes([...opcoes, novaOpcao.trim()]);
      setNovaOpcao("");
    }
  };

  const criarEnquete = () => {
    if (pergunta && opcoes.length >= 2) {
      onCriar(pergunta, opcoes);
      setEnqueteCriada(true);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Digite a pergunta da enquete"
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />
      <div className="flex gap-2">
        <Input
          placeholder="Nova opção"
          value={novaOpcao}
          onChange={(e) => setNovaOpcao(e.target.value)}
        />
        <Button onClick={adicionarOpcao}>Adicionar</Button>
      </div>
      <ul className="list-disc ml-6">
        {opcoes.map((opcao, idx) => (
          <li key={idx}>{opcao}</li>
        ))}
      </ul>
      <Button onClick={criarEnquete} disabled={opcoes.length < 2 || !pergunta}>
        Criar Enquete
      </Button>

      {enqueteCriada && (
        <div className="mt-6 text-center">
          <h2 className="font-semibold mb-2">Escaneie para votar</h2>
          <QRCode value={linkVotacao} size={128} />
          <p className="text-sm mt-2">{linkVotacao}</p>
        </div>
      )}
    </div>
  );
};

export default EnqueteCriador;