"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { buscarPlanoAula, editarPlanoAula, deletarPlanoAula } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

type Plano = {
  id: string;
  titulo: string;
  disciplina_id: string;
};

type Anotacao = {
  id: string;
  titulo: string;
  data: string;
  conteudo: string;
  material: string;
};

export default function PlanoAulaDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const [plano, setPlano] = useState<Plano | null>(null);
  const [titulo, setTitulo] = useState("");
  const [editando, setEditando] = useState(false);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState({
    titulo: "",
    conteudo: "",
    material: ""
  });
  const [modalAberto, setModalAberto] = useState(false); // Estado do modal adicionado

  useEffect(() => {
    const carregarPlano = async () => {
      const { data, error } = await buscarPlanoAula(id as string);
      if (data) {
        setPlano(data);
        setTitulo(data.titulo);
       
      } else {
        console.error("Erro ao carregar plano", error);
      }
    };
    carregarPlano();
  }, [id]);

  const salvar = async () => {
    const formData = new FormData();
    formData.append("id", id as string);
    formData.append("titulo", titulo);

    const { error } = await editarPlanoAula(formData);
    if (error) {
      alert("Erro ao salvar: " + error);
    } else {
      setEditando(false);
    }
  };

  const adicionarAnotacao = () => {
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR') + ', ' + 
                         dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const novaAnotacaoCompleta = {
      id: Date.now().toString(),
      titulo: novaAnotacao.titulo,
      data: dataFormatada,
      conteudo: novaAnotacao.conteudo,
      material: novaAnotacao.material
    };
    
    setAnotacoes([...anotacoes, novaAnotacaoCompleta]);
    setNovaAnotacao({ titulo: "", conteudo: "", material: "" });
    setModalAberto(false);
  };

  const excluir = async () => {
    if (confirm("Deseja excluir este plano de aula?")) {
      const { error } = await deletarPlanoAula(id as string);
      if (!error) {
        router.push("/plano-aulas");
      } else {
        alert("Erro ao excluir: " + error);
      }
    }
  };

  if (!plano) {
    return <div className="p-6 bg-blue-50 min-h-screen">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <Link href="/home/plano-aulas">
          <Button variant="outline" className="bg-white hover:bg-gray-100">
            Voltar
          </Button>
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-800">{plano.titulo}</h1>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                ADICIONAR NOVO REGISTRO
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Título de Aula</label>
                <Input
                  value={novaAnotacao.titulo}
                  onChange={(e) => setNovaAnotacao({...novaAnotacao, titulo: e.target.value})}
                  placeholder="Digite o título da aula"
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
                <Textarea
                  value={novaAnotacao.conteudo}
                  onChange={(e) => setNovaAnotacao({...novaAnotacao, conteudo: e.target.value})}
                  placeholder="Descreva o conteúdo da aula"
                  rows={4}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Material Utilizado</label>
                <Textarea
                  value={novaAnotacao.material}
                  onChange={(e) => setNovaAnotacao({...novaAnotacao, material: e.target.value})}
                  placeholder="Liste os materiais utilizados"
                  rows={2}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setModalAberto(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  CANCELAR
                </Button>
                <Button 
                  onClick={adicionarAnotacao}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  CONFIRMAR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {editando && (
        <div className="space-y-4 p-4 border rounded-lg bg-white">
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="bg-white"
          />
          <div className="flex gap-2">
            <Button onClick={salvar}>Salvar</Button>
            <Button variant="outline" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {anotacoes.map((anotacao) => (
          <div key={anotacao.id} className="border rounded-lg p-4 space-y-2 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">{anotacao.titulo}</h2>
              <span className="text-sm text-gray-500">{anotacao.data}</span>
            </div>
            <div className="border-t pt-2">
              <p className="text-gray-700 mb-2">{anotacao.conteudo}</p>
              {anotacao.material && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Material:</span> {anotacao.material}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}