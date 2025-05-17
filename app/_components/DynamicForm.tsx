"use client";

import React from "react";
import RangeForm from "./RangeForm";
import ListForm from "./ListForm";
import ArquivoForm from "./ArchiveForm";

type FormType = "range" | "list" | "arquivo";

interface DynamicFormProps {
  formType: FormType;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formType, onSubmit, initialData }) => {
  return (
    <div className="w-full bg-[#5A9BF6] dark:bg-dark-primary text-white p-4 md:p-6 rounded-2xl shadow-lg flex flex-col gap-4">
      {formType === "range" && <RangeForm onSubmit={onSubmit} initialData={initialData} />}
      {formType === "list" && <ListForm onSubmit={onSubmit} initialData={initialData} />}
      {formType === "arquivo" && <ArquivoForm onSubmit={onSubmit} initialData={initialData} />}
    </div>
  );
};

export default DynamicForm;
