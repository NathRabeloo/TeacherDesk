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

const tipoColors: Record<string, string> = {
  tecnico: "bg-blue-500",
  institucional: "bg-pink-400",
  plataforma: "bg-violet-500",
  administrativos: "bg-green-600",
  outro: "bg-green-500",
};

const Tutoriais = () => {
  const [tutoriais, setTutoriais] = useState([
    { id: 1, titulo: "Criando atribuições no Teams", tipo: "plataforma" },
    { id: 2, titulo: "Criando Conta no Teams", tipo: "plataforma" },
    { id: 3, titulo: "Utilizando TeacherDesk", tipo: "plataforma" },
    { id: 4, titulo: "Criando Quizzes", tipo: "plataforma" },
    { id: 5, titulo: "Criando Enquetes", tipo: "plataforma" },
    { id: 6, titulo: "Acesso ao E-mail Institucional", tipo: "institucional" },
    { id: 7, titulo: "Utilizando o SIGA", tipo: "plataforma" },
    { id: 8, titulo: "Lançando notas no SIGA", tipo: "plataforma" },
    { id: 9, titulo: "Preenchendo formulários academicos", tipo: "administrativos" },
    { id: 10, titulo: "Preencher e enviar Diário de Classe", tipo: "administrativos" },
    { id: 11, titulo: "Solicitação de Instalação de Software", tipo: "tecnico" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoTipo, setNovoTipo] = useState("");

  const tutoriaisFiltrados = tutoriais.filter((tutorial) => {
    const matchSearch = tutorial.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoFiltro ? tutorial.tipo === tipoFiltro : true;
    return matchSearch && matchTipo;
  });

  const adicionarTutorial = () => {
    if (!novoTitulo || !novoTipo) return;
    const novoTutorial = {
      id: tutoriais.length + 1,
      titulo: novoTitulo,
      tipo: novoTipo,
    };
    setTutoriais([...tutoriais, novoTutorial]);
    setModalAberto(false);
    setNovoTitulo("");
    setNovoTipo("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Tutoriais</h1>

      {/* Ações de add*/}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Buscar tutoriais..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/2"
        />
        <Select onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-full md:w-1/4">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tecnico">Técnico</SelectItem>
            <SelectItem value="institucional">Institucional</SelectItem>
            <SelectItem value="administrativos">Administrativos</SelectItem>
            <SelectItem value="plataforma">Plataforma</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setModalAberto(true)}>Adicionar Tutorial</Button>
      </div>

      {/* Tutoriais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tutoriaisFiltrados.map((tutorial) => (
          <Card key={tutorial.id}>
            <CardContent className="p-4 bg-white rounded-lg shadow-md space-y-2 dark:bg-dark-card">
              <h2 className="text-md font-semibold">{tutorial.titulo}</h2>
              <div
                className={`rounded text-white text-sm font-semibold px-2 py-1 text-center ${tipoColors[tutorial.tipo]}`}
              >
                {tutorial.tipo.charAt(0).toUpperCase() + tutorial.tipo.slice(1)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para add turorial*/}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Tutorial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título do tutorial"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
            <Select onValueChange={setNovoTipo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="institucional">Institucional</SelectItem>
                <SelectItem value="administrativos">Administrativos</SelectItem>
                <SelectItem value="plataforma">Plataforma</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={adicionarTutorial}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tutoriais;

