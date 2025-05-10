"use client";

import React, { useState } from "react";
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

const disciplinaColors: Record<string, string> = {
  matematica: "bg-blue-500",
  portugues: "bg-pink-400",
  historia: "bg-yellow-500",
  geografia: "bg-green-600",
  ciencias: "bg-purple-500",
  outra: "bg-gray-500",
};

const PlanoAulas = () => {
  const [planos, setPlanos] = useState([
    { id: 1, titulo: "Equações de 1º grau", disciplina: "matematica" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDisciplina, setNovaDisciplina] = useState("");

  const planosFiltrados = planos.filter((plano) => {
    const matchSearch = plano.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDisciplina = disciplinaFiltro ? plano.disciplina === disciplinaFiltro : true;
    return matchSearch && matchDisciplina;
  });

  const adicionarPlano = () => {
    if (!novoTitulo || !novaDisciplina) return;
    const novoPlano = {
      id: planos.length + 1,
      titulo: novoTitulo,
      disciplina: novaDisciplina,
    };
    setPlanos([...planos, novoPlano]);
    setModalAberto(false);
    setNovoTitulo("");
    setNovaDisciplina("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Planos de Aula</h1>

      {/* Ações de busca e filtro */}
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
            <SelectItem value="matematica">Matemática</SelectItem>
            <SelectItem value="portugues">Português</SelectItem>
            <SelectItem value="historia">História</SelectItem>
            <SelectItem value="geografia">Geografia</SelectItem>
            <SelectItem value="ciencias">Ciências</SelectItem>
            <SelectItem value="outra">Outra</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setModalAberto(true)}>Adicionar Plano</Button>
      </div>

      {/* Lista de planos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {planosFiltrados.map((plano) => (
          <Card key={plano.id}>
            <CardContent className="p-4 bg-white rounded-lg shadow-md space-y-2 dark:bg-dark-card">
              <h2 className="text-md font-semibold">{plano.titulo}</h2>
              <div
                className={`rounded text-white text-sm font-semibold px-2 py-1 text-center ${disciplinaColors[plano.disciplina]}`}
              >
                {plano.disciplina.charAt(0).toUpperCase() + plano.disciplina.slice(1)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para adicionar plano */}
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
            <Select onValueChange={setNovaDisciplina}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matematica">Matemática</SelectItem>
                <SelectItem value="portugues">Português</SelectItem>
                <SelectItem value="historia">História</SelectItem>
                <SelectItem value="geografia">Geografia</SelectItem>
                <SelectItem value="ciencias">Ciências</SelectItem>
                <SelectItem value="outra">Outra</SelectItem>
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



