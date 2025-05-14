import React, { useState } from "react";

// Definição da interface do evento
export interface Evento {
  nome: string;
  descricao: string;
  data: string;
}

interface ModalAddEventoProps {
  onAdd: (evento: Evento) => void;
  onClose: () => void;
}

const ModalAddEvento: React.FC<ModalAddEventoProps> = ({ onAdd, onClose }) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");

  const handleSubmit = () => {
    // Validação simples
    if (!nome || !descricao || !data) {
      alert("Todos os campos devem ser preenchidos.");
      return;
    }

    const novoEvento: Evento = {
      nome,
      descricao,
      data,
    };

    onAdd(novoEvento);
    onClose(); // Fecha o modal após adicionar
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Adicionar Evento</h2>
        
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

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAddEvento;

