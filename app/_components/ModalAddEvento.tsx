import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { FaCalendarPlus, FaEdit, FaTrash, FaTimes, FaSave, FaExclamationTriangle } from "react-icons/fa";

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

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-500 text-white";
      case "media":
        return "bg-yellow-500 text-white";
      case "baixa":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${evento ? "bg-orange-500" : "bg-green-500"}`}>
                {evento ? (
                  <FaEdit className="text-white text-lg" />
                ) : (
                  <FaCalendarPlus className="text-white text-lg" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {evento ? "Editar Evento" : "Novo Evento"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {evento ? "Modifique as informações do evento" : "Adicione um novo evento ao calendário"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Nome do Evento */}
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nome do Evento
            </label>
            <input
              id="nome"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              placeholder="Digite o nome do evento"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all"
              placeholder="Descreva os detalhes do evento"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Data e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="data" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <input
                id="data"
                type="date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="prioridade" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                id="prioridade"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as "alta" | "media" | "baixa")}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Preview da Prioridade */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadeColor(prioridade)}`}>
              {prioridade.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FaTimes className="text-sm" />
            Cancelar
          </button>

          <div className="flex gap-3">
            {evento && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FaTrash className="text-sm" />
                Excluir
              </button>
            )}

            <button
              onClick={GerenciarEvento}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FaSave className="text-sm" />
              {evento ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>

        {/* Confirmation Delete Modal */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 px-6 py-4 border-b border-red-200 dark:border-red-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500 rounded-xl">
                    <FaExclamationTriangle className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                      Confirmar Exclusão
                    </h3>
                    <p className="text-red-600 dark:text-red-300 text-sm">
                      Esta ação não pode ser desfeita
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
                  Tem certeza que deseja excluir o evento "<strong>{nome}</strong>"?
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={DeletarEvento}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAddEvento;