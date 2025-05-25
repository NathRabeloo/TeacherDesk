"use client";

import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  criarTutorial,
  listarTutoriais,
  editarTutorial,
  deletarTutorial,
} from "../../actions";

const tipoColors: Record<string, string> = {
  tecnico: "bg-blue-500",
  institucional: "bg-pink-400",
  plataforma: "bg-violet-500",
  administrativos: "bg-green-600",
  outro: "bg-green-500",
};

const Tutoriais = () => {
  const [tutoriais, setTutoriais] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");

  const [modalCriar, setModalCriar] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const [tutorialSelecionado, setTutorialSelecionado] = useState<any>(null);

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    carregarTutoriais();
  }, []);

  const carregarTutoriais = async () => {
    const data = await listarTutoriais();
    setTutoriais(data);
  };

  const handleCriar = async () => {
    const form = new FormData();
    form.append("titulo", titulo);
    form.append("tipo", tipo);
    form.append("descricao", descricao);
    const result = await criarTutorial(form);
    if (result.success) {
      setModalCriar(false);
      setTitulo("");
      setTipo("");
      setDescricao("");
      carregarTutoriais();
    }
  };

  const handleEditar = async () => {
    if (!tutorialSelecionado) return;
    const form = new FormData();
    form.append("id", tutorialSelecionado.id);
    form.append("titulo", titulo);
    form.append("tipo", tipo);
    form.append("descricao", descricao);
    const result = await editarTutorial(form);
    if (result.success) {
      setModalEditar(false);
      setTutorialSelecionado(null);
      carregarTutoriais();
    }
  };

  const tutoriaisFiltrados = tutoriais.filter((t) => {
    const matchSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTipo = tipoFiltro ? t.tipo === tipoFiltro : true;
    return matchSearch && matchTipo;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-dark-primary">
      <h1 className="text-2xl font-bold mb-4">Tutoriais</h1>

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
        <Button onClick={() => setModalCriar(true)}>Adicionar Tutorial</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tutoriaisFiltrados.map((tutorial) => (
          <Card key={tutorial.id} className="relative">
            <CardContent className="p-4 bg-white rounded-lg shadow-md space-y-2 dark:bg-dark-card">
              <h2 className="text-md font-semibold">{tutorial.titulo}</h2>
              <div className={`rounded text-white text-sm font-semibold px-2 py-1 text-center ${tipoColors[tutorial.tipo]}`}>
                {tutorial.tipo.charAt(0).toUpperCase() + tutorial.tipo.slice(1)}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => { setTutorialSelecionado(tutorial); setModalVisualizar(true); }}>Visualizar</Button>
                <Button size="sm" variant="outline" onClick={() => { setTutorialSelecionado(tutorial); setTitulo(tutorial.titulo); setTipo(tutorial.tipo); setDescricao(tutorial.descricao); setModalEditar(true); }}>Editar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Criar */}
      <Dialog open={modalCriar} onOpenChange={setModalCriar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Tutorial</DialogTitle>
          </DialogHeader>
          <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <Textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnico">Técnico</SelectItem>
              <SelectItem value="institucional">Institucional</SelectItem>
              <SelectItem value="administrativos">Administrativos</SelectItem>
              <SelectItem value="plataforma">Plataforma</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleCriar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Visualizar */}
      <Dialog open={modalVisualizar} onOpenChange={setModalVisualizar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tutorialSelecionado?.titulo}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {tutorialSelecionado?.descricao || "Sem descrição."}
          </p>
          <DialogFooter>
            <Button onClick={() => setModalVisualizar(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tutorial</DialogTitle>
          </DialogHeader>
          <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <Textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tecnico">Técnico</SelectItem>
              <SelectItem value="institucional">Institucional</SelectItem>
              <SelectItem value="administrativos">Administrativos</SelectItem>
              <SelectItem value="plataforma">Plataforma</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleEditar}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tutoriais;
