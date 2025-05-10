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

const mockTutoriais = [
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
];

const tipoColors: Record<string, string> = {
  tecnico: "bg-blue-500",
  institucional: "bg-pink-400",
  plataforma: "bg-violet-500",
  administrativos: "bg-green-600",
  outro: "bg-green-500",
};

const Tutoriais = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");

  const tutoriaisFiltrados = mockTutoriais.filter((tutorial) => {
    const matchSearch = tutorial.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoFiltro ? tutorial.tipo === tipoFiltro : true;
    return matchSearch && matchTipo;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Tutoriais</h1>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
    </div>
  );
};

export default Tutoriais;

