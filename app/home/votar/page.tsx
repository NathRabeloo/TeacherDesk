"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VotarPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<{ texto: string; votos: number }[]>([]);
  const [votado, setVotado] = useState(false);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem(`enquete-${id}`);
    if (data) {
      const { pergunta, opcoes } = JSON.parse(data);
      setPergunta(pergunta);
      setOpcoes(opcoes);
    }
  }, [id]);

  const votar = (index: number) => {
    const novasOpcoes = [...opcoes];
    novasOpcoes[index].votos += 1;
    setOpcoes(novasOpcoes);
    localStorage.setItem(`enquete-${id}`, JSON.stringify({ pergunta, opcoes: novasOpcoes }));
    setVotado(true);
  };

  if (!id) return <p className="p-6">Enquete não encontrada.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{pergunta}</h1>

      {opcoes.map((opcao, index) => (
        <Card key={index} className="mb-2">
          <CardContent className="p-4 flex justify-between items-center">
            <span>{opcao.texto}</span>
            <Button disabled={votado} onClick={() => votar(index)}>
              Votar
            </Button>
          </CardContent>
        </Card>
      ))}

      {votado && <p className="mt-4 text-green-600 font-semibold">Obrigado pelo seu voto!</p>}
    </div>
  );
}
