"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Importando os componentes
//import CalendarioVisual from "../../components/CalendarioVisual";

const PlanoDeAula = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");


  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-dark-primary">
      <div className="">
        
      </div>
    </div>
  );
};

export default PlanoDeAula;
