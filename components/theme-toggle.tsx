"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/icons";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("pharmalens-theme-change", callback);
  return () => window.removeEventListener("pharmalens-theme-change", callback);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("pharmalens-theme", next);
    window.dispatchEvent(new Event("pharmalens-theme-change"));
  }

  const dark = theme === "dark";
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"} title={dark ? "Use light mode" : "Use dark mode"}>
    {dark ? <Sun size={18}/> : <Moon size={18}/>}
    <span>{dark ? "Light" : "Dark"}</span>
  </button>;
}
