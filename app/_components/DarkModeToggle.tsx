"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const dark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <Switch 
        checked={isDark} 
        onCheckedChange={toggleTheme} 
        className="bg-muted-foreground data-[state=checked]:bg-blue-600 relative w-[60px] h-[32px] rounded-full transition"
      >
        <span className="absolute left-1 top-1 text-yellow-400 dark:text-gray-200">
          <FaSun className="w-4 h-4" />
        </span>
        <span className="absolute right-1 top-1 text-gray-400 dark:text-blue-400">
          <FaMoon className="w-4 h-4" />
        </span>
      </Switch>
    </div>
  );
}
