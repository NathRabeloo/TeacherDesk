'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/utils/supabase/client";
import { deletarDisciplina } from "@/app/actions";
import { Loader2, Trash2, Plus, BookOpen, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
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

  useEffect(() => {
    const supabase = createClient();
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
    const supabase = createClient();
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cabeçalho do Conteúdo */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <BookOpen className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Minhas Disciplinas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
                Gerencie suas disciplinas de forma organizada e eficiente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-8">
        {/* Botão de Nova Disciplina */}
        <div className="mb-8">
          <Button
            onClick={() => setAbrirModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Disciplina
          </Button>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando disciplinas...</p>
            </div>
          </div>
        ) : disciplinas.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="text-gray-500 dark:text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma disciplina cadastrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Comece criando sua primeira disciplina para organizar seus estudos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {disciplinas.map((disciplina, index) => (
                <motion.div
                  key={disciplina.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-800 group">
                    <CardContent className="flex flex-col items-center p-6 text-center space-y-4">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                        <BookOpen className="text-3xl text-white" />
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {disciplina.nome}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Disciplina ativa
                        </p>
                      </div>
                      
                      <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(disciplina.id)}
                          disabled={removendoId === disciplina.id}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {removendoId === disciplina.id ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Removendo...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Nova Disciplina */}
      <Dialog open={abrirModal} onOpenChange={setAbrirModal}>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 -mx-6 -mt-6 mb-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                <Plus className="text-white text-xl" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nova Disciplina
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Adicione uma nova disciplina ao seu perfil
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="nome" className="text-lg font-semibold text-gray-900 dark:text-white">
                Nome da Disciplina
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Matemática, História, Ciências..."
                className="text-lg py-3 px-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600 mt-6">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="px-6 py-2 text-lg font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleNovaDisciplina}
              disabled={salvando || !nome.trim()}
              className="px-8 py-2 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {salvando ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Disciplina
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}