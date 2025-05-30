import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/utils/supabase/client";

export interface Evento {
  id?: number;
  nome: string;
  descricao: string;
  data: string;
  prioridade: "alta" | "media" | "baixa";
}

interface ModalAddEventoProps {
  evento?: Evento | null;
  onAdd: (evento: Evento) => void;
  onClose: () => void;
  onDelete: (id: number) => void;
}

const ModalAddEvento: React.FC<ModalAddEventoProps> = ({ evento, onAdd, onClose, onDelete }) => {
  const [nome, setNome] = useState(evento?.nome || "");
  const [descricao, setDescricao] = useState(evento?.descricao || "");
  const [data, setData] = useState(evento?.data || "");
  const [prioridade, setPrioridade] = useState<"alta" | "media" | "baixa">(evento?.prioridade || "baixa");
  const supabase = createClient();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (evento) {
      setNome(evento.nome);
      setDescricao(evento.descricao);
      setPrioridade(evento.prioridade);
      const dateOnly = evento.data.split("T")[0];
      setData(dateOnly);
    } else {
      setNome("");
      setDescricao("");
      setData("");
      setPrioridade("baixa");
    }
  }, [evento]);

  const DeletarEvento = async () => {
    if (!evento || !evento.id) return;

    try {
      const { data, error } = await supabase
        .from("Evento")
        .update({ deletedAt: new Date().toISOString() })
        .eq("id", evento.id);

      if (error) {
        console.error("Erro ao excluir evento:", error.message);
        alert("Erro ao excluir evento.");
        return;
      }

      // Notifica o componente pai para remover o evento da lista
      onDelete(evento.id);
      onClose();
    } catch (err) {
      console.error("Erro inesperado ao excluir evento:", err);
      alert("Erro ao excluir evento.");
    }
  };

const GerenciarEvento = async () => {
  if (!nome || !descricao || !data) {
    alert("Todos os campos devem ser preenchidos.");
    return;
  }

  const dataSelecionada = new Date(data);
  const hoje = new Date();

  // Zera horas, minutos, segundos e milissegundos para comparar apenas a data.
  dataSelecionada.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  if (dataSelecionada < hoje) {
    alert("Não é possível selecionar uma data anterior à data atual.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Usuário não autenticado.");
    return;
  }

  if (evento) {
    // Editar evento
    const { data: updatedData, error } = await supabase
      .from("Evento")
      .update({ nome, descricao, data, prioridade })
      .eq("id", evento.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao editar evento:", error.message);
      alert("Erro ao salvar evento.");
      return;
    }

    onAdd(updatedData);
    onClose();
  } else {
    // Criar novo evento
    const { data: insertedData, error } = await supabase
      .from("Evento")
      .insert({
        nome,
        descricao,
        data,
        prioridade,
        usuarioId: user.id,
        deletedAt: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir evento:", error.message);
      alert("Erro ao salvar evento.");
      return;
    }

    onAdd(insertedData);
    onClose();
  }
};

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">{evento ? "Editar Evento" : "Adicionar Evento"}</h2>

        <div className="mb-4">
          <label htmlFor="nome" className="block text-sm font-semibold">Nome</label>
          <input
            id="nome"
            type="text"
            className="w-full p-2 border rounded-lg mt-1"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="descricao" className="block text-sm font-semibold">Descrição</label>
          <textarea
            id="descricao"
            className="w-full p-2 border rounded-lg mt-1"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="data" className="block text-sm font-semibold">Data</label>
          <input
            id="data"
            type="date"
            className="w-full p-2 border rounded-lg mt-1"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="prioridade" className="block text-sm font-semibold">Prioridade</label>
          <select
            id="prioridade"
            className="w-full p-2 border rounded-lg mt-1"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as "alta" | "media" | "baixa")}
          >
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>

          {evento && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Excluir
            </button>
          )}

          <button
            onClick={GerenciarEvento}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            {evento ? "Salvar" : "Adicionar"}
          </button>
        </div>

        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
              <h3 className="text-lg font-semibold mb-4">Tem certeza que deseja excluir?</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={DeletarEvento}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalAddEvento;
