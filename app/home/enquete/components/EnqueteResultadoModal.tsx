"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EnqueteResultadoModalProps {
  aberto: boolean;
  onFechar: () => void;
  pergunta: string;
  resultados: { texto: string; votos: number }[];
}

const EnqueteResultadoModal: React.FC<EnqueteResultadoModalProps> = ({ aberto, onFechar, pergunta, resultados }) => {
  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resultado da Enquete</DialogTitle>
        </DialogHeader>
        <h2 className="font-bold mb-2">{pergunta}</h2>
        <ul className="space-y-1">
          {resultados.map((res, idx) => (
            <li key={idx}>
              {res.texto}: <strong>{res.votos} votos</strong>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default EnqueteResultadoModal;