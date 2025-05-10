"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";
import Offcanvas from "./Offcanvas"

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Digite que deseja..." 
}) => {
  return (
    <div className="flex gap-x-2">
      <div className="relative w-full lg:w-1/2 self-start">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5A9BF6] dark:text-dark-accent" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-[#E2EAF8] dark:bg-dark-card text-[#5A9BF6] dark:text-dark-text placeholder-[#5A9BF6] dark:placeholder-dark-muted focus:outline-none"
          value={searchQuery}
          onChange={onSearchChange}
          />
      </div>
      <div className="md:hidden flex items-center">
        <Offcanvas/>
      </div>
    </div>
  );
};

export default SearchBar;