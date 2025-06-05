// app/home/layout.tsx
"use client";

import React, { useState } from "react";
import Footer from "@/app/_components//Footer";
import MenuHeader from "@/app/_components/MenuHeader";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {

    return (
    <><div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <MenuHeader />
      {/* Content Container */}
      {children}
    </div><Footer /></>
  );
}