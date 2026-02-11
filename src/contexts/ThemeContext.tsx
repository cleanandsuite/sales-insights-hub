import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'default' | 'minecraft';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isMinecraft: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('default');

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sellSig-theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'default' || savedTheme === 'minecraft')) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme when it changes
  useEffect(() => {
    localStorage.setItem('sellSig-theme', theme);
    
    // Apply theme class to body
    if (theme === 'minecraft') {
      document.body.classList.add('theme-minecraft');
      document.body.classList.remove('theme-default');
    } else {
      document.body.classList.add('theme-default');
      document.body.classList.remove('theme-minecraft');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme: (t: ThemeMode) => setTheme(t),
        isMinecraft: theme === 'minecraft'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
