"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import CalendarioVisual from "../../_components/CalendarioVisual";

const Calendario = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-dark-primary">
      <div className="">
        <CalendarioVisual />
      </div>
    </div>
  );
};

export default Calendario;