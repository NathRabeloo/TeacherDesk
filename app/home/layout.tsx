// app/home/layout.tsx
"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen font-sans bg-gray-100 dark:bg-dark-primary">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex flex-col flex-1">
          <div className="flex flex-col h-full p-2 md:p-4">
            <div className="w-full mb-2">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 mb-2">{children}</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}