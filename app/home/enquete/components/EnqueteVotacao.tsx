"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface EnqueteVotacaoProps {
  pergunta: string;
  opcoes: string[];
  onVotar: (index: number) => void;
  votado: boolean;
}

const EnqueteVotacao: React.FC<EnqueteVotacaoProps> = ({ pergunta, opcoes, onVotar, votado }) => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-xl font-bold">{pergunta}</h1>
      {!votado ? (
        <div className="space-y-2">
          {opcoes.map((opcao, idx) => (
            <Button key={idx} className="w-full" onClick={() => onVotar(idx)}>
              {opcao}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-green-600 font-medium">Obrigado por votar!</p>
      )}
    </div>
  );
};

export default EnqueteVotacao;




