"use client";

import React, { useState } from "react";
import SpinningWheel from "./SpinningWheel"; // seu componente de roleta

interface ListFormProps {
  initialData?: { list?: string[] };
  onSubmit: (data: any) => void;
}

const ListForm: React.FC<ListFormProps> = ({ initialData, onSubmit }) => {
  const [list, setList] = useState<string[]>(initialData?.list || [""]);
  const [removeAfterDraw, setRemoveAfterDraw] = useState(false);
  const [selectedResult, setSelectedResult] = useState("");

  const handleListChange = (index: number, value: string) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = () => setList([...list, ""]);

  const removeListItem = (index: number) => {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  };

  const removeItem = (item: string) => {
    setList((prev) => prev.filter((i) => i !== item));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full bg-[#5A9BF6] dark:bg-dark-primary text-white p-4 md:p-6 rounded-2xl shadow-lg flex flex-col gap-4">

      <div className="flex">
        <div className="w-1/2">
          <label className="text-md font-semibold block mb-2">Lista de Itens:</label>
          <div className="overflow-y-auto h-[200px]">
            <div className="h-fit w-full flex flex-wrap gap-2 justify-start">
              {list.map((item, index) => (
                <div key={index} className="flex items-center bg-white rounded-lg w-[32%]">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-black"
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(index)}
                    className="text-black hover:bg-red-600 rounded-lg px-2 py-1 text-sm mx-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addListItem}
            className="bg-[#4A86E8] hover:bg-[#3B76D4] px-4 py-2 rounded-lg text-white text-sm mt-4"
          >
            + Adicionar item
          </button>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={removeAfterDraw}
              onChange={(e) => setRemoveAfterDraw(e.target.checked)}
              id="removeAfterDraw"
            />
            <label htmlFor="removeAfterDraw" className="text-sm">
              Remover item sorteado da lista
            </label>
          </div>
        </div>

        <div className="w-1/2">
          {list.filter((i) => i.trim()).length >= 2 && (
            <div className="mt-4">
              <SpinningWheel
                items={list.filter((item) => item.trim() !== "")}
                onFinish={(winner) => {
                  setSelectedResult(winner);
                  onSubmit(winner);
                  if (removeAfterDraw) {
                    removeItem(winner);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {selectedResult && (
        <div className="mt-3 text-center text-7xl font-bold text-azulteacherdesk-900 animate-bounce uppercase">
          🎉 {selectedResult} 🎉
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => {
            setList([""]);
            setSelectedResult("");
            setRemoveAfterDraw(false);
          }}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Limpar tudo
        </button>
      </div>

    </form>
  );
};

export default ListForm;
