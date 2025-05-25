'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/utils/supabase/client";
import { deletarDisciplina } from "@/app/actions";
import { Loader2, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Disciplina {
  id: string;
  nome: string;
}

interface Props {
  userId: string;
}

export default function DisciplinaLista({ userId }: Props) {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [abrirModal, setAbrirModal] = useState(false);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const carregarDisciplinas = async () => {
      const { data, error } = await supabase
        .from("Disciplina")
        .select("id, nome")
        .eq("user_id", userId);

      if (data) setDisciplinas(data);
      if (error) console.error("Erro ao carregar disciplinas:", error.message);

      setCarregando(false);
    };

    carregarDisciplinas();
  }, [userId]);

  const handleDelete = async (id: string) => {
    setRemovendoId(id);
    const result = await deletarDisciplina(id);

    if (result.success) {
      setDisciplinas((prev) => prev.filter((d) => d.id !== id));
    } else {
      console.error("Erro ao deletar:", result.error);
    }

    setRemovendoId(null);
  };

  const handleNovaDisciplina = async () => {
    if (!nome.trim()) return;

    setSalvando(true);
    const { data, error } = await supabase
      .from("Disciplina")
      .insert({ nome, user_id: userId })
      .select("id, nome")
      .single();

    if (error) {
      console.error("Erro ao criar disciplina:", error.message);
    } else if (data) {
      setDisciplinas((prev) => [...prev, data]);
      setNome("");
      setAbrirModal(false);
    }

    setSalvando(false);
  };

  return (
    <div className="space-y-4 text-[var(--foreground)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Minhas Disciplinas</h2>
        <Button
          variant="default"
          className="gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)] transition-colors"
          onClick={() => setAbrirModal(true)}
        >
          <Plus className="h-4 w-4" /> Nova Disciplina
        </Button>
      </div>

      {carregando ? (
        <p className="text-[var(--muted-foreground)]">Carregando disciplinas...</p>
      ) : disciplinas.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">Nenhuma disciplina cadastrada.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {disciplinas.map((disciplina) => (
              <motion.div
                key={disciplina.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="shadow-sm bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-semibold">{disciplina.nome}</span>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(disciplina.id)}
                      disabled={removendoId === disciplina.id}
                      className="bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-red-700"
                    >
                      {removendoId === disciplina.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Nova Disciplina */}
      <Dialog open={abrirModal} onOpenChange={setAbrirModal}>
        <DialogContent className="bg-white dark:bg-[var(--card)] text-black dark:text-[var(--card-foreground)]">
          <DialogHeader>
            <DialogTitle>Nova Disciplina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-black dark:text-[var(--foreground)]">
                Nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Matemática"
                className="bg-white dark:bg-[var(--input)] text-black dark:text-[var(--foreground)] border border-[var(--border)]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-[var(--border)] text-black dark:text-[var(--foreground)] hover:bg-[var(--secondary)]"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleNovaDisciplina}
              disabled={salvando || !nome.trim()}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110"
            >
              {salvando ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




