import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ai-notes-theme');
    return (saved as Theme) || 'system';
  });
  
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('ai-notes-accent') || '#0d9488';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ai-notes-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ai-notes-accent', accentColor);
    
    // Convert hex to HSL and apply as CSS variable
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const hsl = hexToHsl(accentColor);
    const root = document.documentElement;
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    
    // Also set accent color variations
    const hslParts = hsl.split(' ');
    const h = hslParts[0];
    root.style.setProperty('--accent', `${h} 50% 95%`);
    root.style.setProperty('--accent-foreground', `${h} 76% 30%`);
    
    // Set sidebar accent colors
    root.style.setProperty('--sidebar-primary', hsl);
    root.style.setProperty('--sidebar-accent', `${h} 50% 95%`);
    root.style.setProperty('--sidebar-accent-foreground', `${h} 76% 30%`);
    root.style.setProperty('--sidebar-ring', hsl);
    
    // Update dark mode accent if currently dark
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--accent', `${h} 40% 15%`);
      root.style.setProperty('--accent-foreground', `${h} 70% 60%`);
      root.style.setProperty('--sidebar-accent', `${h} 40% 15%`);
      root.style.setProperty('--sidebar-accent-foreground', `${h} 70% 60%`);
    }
  }, [accentColor, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
