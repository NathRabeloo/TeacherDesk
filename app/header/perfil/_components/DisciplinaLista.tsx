"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
// Update the path below to the correct relative location of your actions file, for example:
import { criarDisciplina, listarDisciplinas } from "@/app/actions";
import { useFormState } from "react-dom";

export default function DisciplinaLista() {
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [nome, setNome] = useState("");

  const carregar = async () => {
    const data = await listarDisciplinas(); // Server action
    setDisciplinas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nome", nome);
    const res = await criarDisciplina(formData);
    if (res.success) {
      setNome("");
      carregar();
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h2 className="text-lg font-semibold">Minhas Disciplinas</h2>

        <ul className="list-disc list-inside space-y-1">
          {disciplinas.length > 0 ? (
            disciplinas.map((d) => <li key={d.id}>{d.nome}</li>)
          ) : (
            <p className="text-sm text-gray-500">Nenhuma disciplina cadastrada.</p>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="nome">Nova Disciplina</Label>
          <Input
            id="nome"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Matemática"
          />
          <Button type="submit">Adicionar</Button>
        </form>
      </CardContent>
    </Card>
  );
}
