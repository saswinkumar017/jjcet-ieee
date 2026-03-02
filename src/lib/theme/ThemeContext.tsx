"use client";

import { createContext, useContext, ReactNode } from "react";

type Theme = "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme: Theme = "light";

  const setTheme = (_theme: Theme) => {
    // No-op - only light theme
  };

  const toggleTheme = () => {
    // No-op - only light theme
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return { 
    theme: "light" as Theme, 
    toggleTheme: () => {}, 
    setTheme: () => {},
    mounted: true
  };
}
