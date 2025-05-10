"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { listarDisciplinas, criarPlanoAula } from "@/app/actions";

const disciplinaColors: Record<string, string> = {
  matematica: "bg-blue-500",
  portugues: "bg-pink-400",
  historia: "bg-yellow-500",
  geografia: "bg-green-600",
  ciencias: "bg-purple-500",
  outra: "bg-gray-500",
};

type Plano = {
  id: string;
  titulo: string;
  disciplina: string; // This is the ID, not the name
  [key: string]: any;
};

const PlanoAulas = () => {
  type Disciplina = { id: string; nome: string };
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDisciplinaId, setNovaDisciplinaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedDisciplinas = await listarDisciplinas();
        setDisciplinas(fetchedDisciplinas);
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
      }
    };

    fetchData();
  }, []);

  const planosFiltrados = planos.filter((plano) => {
    const matchSearch = plano.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDisciplina = disciplinaFiltro ? plano.disciplina === disciplinaFiltro : true;
    return matchSearch && matchDisciplina;
  });

  const adicionarPlano = async () => {
    if (!novoTitulo || !novaDisciplinaId) return;

    const novoPlanoFormData = new FormData();
    novoPlanoFormData.append("titulo", novoTitulo);
    novoPlanoFormData.append("disciplina_id", novaDisciplinaId);

    const { success, data } = await criarPlanoAula(novoPlanoFormData);

    if (success && Array.isArray(data) && data.length > 0) {
      const novoPlano: Plano = {
        id: data[0].id,
        titulo: data[0].titulo,
        disciplina: data[0].disciplina, // Use the ID
        ...data[0],
      };
      setPlanos((prev) => [...prev, novoPlano]);
      setModalAberto(false);
      setNovoTitulo("");
      setNovaDisciplinaId(null);
    } else {
      console.error("Erro ao criar plano de aula:", data);
    }
  };

  // Function to get the name of the discipline based on its ID
  const getDisciplinaNome = (id: string) => {
    const disciplina = disciplinas.find((d) => d.id === id);
    return disciplina ? disciplina.nome : "Desconhecida";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Planos de Aula</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Buscar planos de aula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/2"
        />
        <Select onValueChange={setDisciplinaFiltro}>
          <SelectTrigger className="w-full md:w-1/4">
            <SelectValue placeholder="Filtrar por disciplina" />
          </SelectTrigger>
          <SelectContent>
            {disciplinas.map((disciplina) => (
              <SelectItem key={disciplina.id} value={disciplina.id}>
                {disciplina.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setModalAberto(true)}>Adicionar Plano</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {planosFiltrados.map((plano) => (
          <Card key={plano.id}>
            <CardContent className="p-4 bg-white rounded-lg shadow-md space-y-2 dark:bg-dark-card">
              <h2 className="text-md font-semibold">{plano.titulo}</h2>
              <div
                className={`rounded text-white text-sm font-semibold px-2 py-1 text-center ${disciplinaColors[getDisciplinaNome(plano.disciplina).toLowerCase()] || "bg-gray-500"}`}
              >
                {getDisciplinaNome(plano.disciplina)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Plano de Aula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título do plano de aula"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
            <Select onValueChange={setNovaDisciplinaId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                {disciplinas.map((disciplina) => (
                  <SelectItem key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={adicionarPlano}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanoAulas;
