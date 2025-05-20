"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Opcao = {
  id: string;
  texto: string;
  correta: boolean;
};

type Pergunta = {
  id: string;
  texto: string;
  opcoes: Opcao[];
  respostaSelecionada?: string | null;
};

type Quiz = {
  titulo: string;
  perguntas: Pergunta[];
};

export default function ResponderQuizPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [votado, setVotado] = useState(false);
  const [acertos, setAcertos] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    // Verifica se o quiz já foi respondido no localStorage
    const saved = localStorage.getItem(`quiz-${id}`);
    if (saved) {
      const savedQuiz: Quiz = JSON.parse(saved);
      setQuiz(savedQuiz);
      setVotado(true);

      // Calcula acertos do quiz salvo
      let correctCount = 0;
      savedQuiz.perguntas.forEach((p) => {
        const opcaoCorreta = p.opcoes.find((o) => o.correta);
        if (opcaoCorreta && opcaoCorreta.id === p.respostaSelecionada) {
          correctCount++;
        }
      });
      setAcertos(correctCount);
      return;
    }

    async function fetchQuiz() {
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .select("titulo")
        .eq("id", id)
        .single();

      if (quizError || !quizData) {
        alert("Quiz não encontrado.");
        return;
      }

      const { data: perguntasData, error: perguntasError } = await supabase
        .from("Pergunta")
        .select("id, texto")
        .eq("quiz_id", id);

      if (perguntasError) {
        alert("Erro ao carregar perguntas.");
        return;
      }

      const perguntasComOpcoes: Pergunta[] = await Promise.all(
        perguntasData.map(async (pergunta) => {
          const { data: opcoesData, error: opcoesError } = await supabase
            .from("OpcaoPergunta")
            .select("id, texto, correta")
            .eq("pergunta_id", pergunta.id);

          if (opcoesError) {
            alert("Erro ao carregar opções.");
            return { ...pergunta, opcoes: [] };
          }

          return { ...pergunta, opcoes: opcoesData || [], respostaSelecionada: null };
        })
      );

      setQuiz({ titulo: quizData.titulo, perguntas: perguntasComOpcoes });
    }

    fetchQuiz();
  }, [id]);

  const selecionarResposta = (perguntaIndex: number, opcaoId: string) => {
    if (!quiz || votado) return;

    const novasPerguntas = [...quiz.perguntas];
    novasPerguntas[perguntaIndex].respostaSelecionada = opcaoId;

    setQuiz({ ...quiz, perguntas: novasPerguntas });
  };

  const enviarRespostas = () => {
    if (!quiz) return;

    if (quiz.perguntas.some((p) => !p.respostaSelecionada)) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    let correctCount = 0;
    quiz.perguntas.forEach((p) => {
      const opcaoCorreta = p.opcoes.find((o) => o.correta);
      if (opcaoCorreta && opcaoCorreta.id === p.respostaSelecionada) {
        correctCount++;
      }
    });

    localStorage.setItem(`quiz-${id}`, JSON.stringify(quiz));

    setAcertos(correctCount);
    setVotado(true);
  };

  if (!id) return <p className="p-6">Quiz não encontrado.</p>;
  if (!quiz) return <p className="p-6">Carregando quiz...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6">{quiz.titulo}</h1>

      {quiz.perguntas.map((pergunta, pIndex) => (
        <div key={pergunta.id} className="mb-8">
          <p className="mb-3 font-semibold">{pergunta.texto}</p>
          <RadioGroup
            value={pergunta.respostaSelecionada || ""}
            onValueChange={(val) => selecionarResposta(pIndex, val)}
            disabled={votado}
            className="flex flex-col space-y-2"
          >
            {pergunta.opcoes.map((opcao) => {
              const isSelected = pergunta.respostaSelecionada === opcao.id;
              const isCorrect = opcao.correta;
              const showFeedback = votado;
              const isWrongSelected = isSelected && !isCorrect;

              return (
                <div
                  key={opcao.id}
                  className={`flex items-center gap-3 p-3 rounded-md border
                    ${
                      showFeedback
                        ? isCorrect
                          ? "border-green-600 bg-green-50"
                          : isWrongSelected
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200"
                        : "border-gray-200"
                    }
                  `}
                >
                  <RadioGroupItem
                    id={`${pergunta.id}-${opcao.id}`}
                    value={opcao.id}
                    className="ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
                  />
                  <Label
                    htmlFor={`${pergunta.id}-${opcao.id}`}
                    className="flex-1 cursor-pointer select-none"
                  >
                    {opcao.texto}
                  </Label>

                  {showFeedback && isCorrect && (
                    <CheckCircle className="text-green-600" size={20} />
                  )}
                  {showFeedback && isWrongSelected && (
                    <XCircle className="text-red-600" size={20} />
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </div>
      ))}

      {!votado && (
        <Button onClick={enviarRespostas} className="mt-4 w-full">
          Enviar Respostas
        </Button>
      )}

      {votado && acertos !== null && (
        <p className="mt-6 text-center text-green-700 font-semibold text-lg">
          Você acertou {acertos} de {quiz.perguntas.length} perguntas!
        </p>
      )}
    </div>
  );
}
