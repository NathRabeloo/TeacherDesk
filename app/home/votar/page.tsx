"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Opcao = {
  id: string;
  texto: string;
  votos: number;
};

export default function VotarPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [votado, setVotado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEnquete, setLoadingEnquete] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) {
      setErro("Enquete não encontrada.");
      setLoadingEnquete(false);
      return;
    }

    setLoadingEnquete(true);
    fetch(`/api/enquete?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar enquete");
        return res.json();
      })
      .then((data) => {
        setPergunta(data.pergunta);
        setOpcoes(data.opcoes);
        setErro("");
      })
      .catch(() => {
        setErro("Enquete não encontrada ou erro ao carregar");
        setPergunta("");
        setOpcoes([]);
      })
      .finally(() => setLoadingEnquete(false));
  }, [id]);

  const votar = async (opcaoId: string) => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await fetch("/api/enquete/votar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enqueteId: id, opcaoId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao registrar voto");

      // Atualiza votos localmente para dar feedback imediato
      setOpcoes((oldOpcoes) =>
        oldOpcoes.map((opcao) =>
          opcao.id === opcaoId ? { ...opcao, votos: opcao.votos + 1 } : opcao
        )
      );

      setVotado(true);
    } catch (error: any) {
      alert(error.message || "Falha ao registrar voto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingEnquete) {
    return <p className="p-6 text-center">Carregando enquete...</p>;
  }

  if (erro) {
    return <p className="p-6 text-center text-red-600">{erro}</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{pergunta}</h1>

      {opcoes.length === 0 && <p>Nenhuma opção disponível.</p>}

      {opcoes.map((opcao) => (
        <Card key={opcao.id} className="mb-2">
          <CardContent className="p-4 flex justify-between items-center">
            <span>{opcao.texto}</span>
            <Button disabled={votado || loading} onClick={() => votar(opcao.id)}>
              Votar
            </Button>
          </CardContent>
        </Card>
      ))}

      {votado && (
        <p className="mt-4 text-green-600 font-semibold">Obrigado pelo seu voto!</p>
      )}
    </div>
  );
}
