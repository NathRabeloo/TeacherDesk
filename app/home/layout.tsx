// app/home/layout.tsx
"use client";

import React, { useState } from "react";
import Footer from "../_components/Footer";
import MenuHeader from "../_components/MenuHeader";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen font-sans bg-gray-100 dark:bg-dark-primary">
      <MenuHeader />
      <div className="flex flex-1">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col h-full p-2 md:p-4">
            <div className="w-full mb-2">
            <div className="flex-1 mb-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
      <Footer />
    </div>
    
  );
}