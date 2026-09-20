import { useEffect, useState, type ReactNode } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { motion } from "framer-motion";
import { ThemeContext, useTheme, type Theme } from "./themeContext";

const STORAGE_KEY = "musiccloud-theme";

const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    return "dark";
  }
  return "dark";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center gap-2 rounded-full border border-[var(--mc-pill-border)] bg-[var(--mc-pill-bg)] px-4 py-2 text-sm font-semibold text-[var(--mc-pill-text)] transition hover:bg-[var(--mc-hover)]"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center"
      >
        {isDark ? <FiSun className="text-[#8E82FF]" /> : <FiMoon className="text-[#6C5CFF]" />}
      </motion.span>
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
};