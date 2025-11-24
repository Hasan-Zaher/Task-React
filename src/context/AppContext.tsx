import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface User {
  id: string;
  username: string;
}

interface Form {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  [key: string]: any;
}

type Theme = "light" | "dark";
type Language = "en" | "ar";

interface AppContextType {
  // Auth
  user: User | null;
  token: string | null;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  
  // Forms
  forms: Form[];
  selectedForm: Form | null;
  formsLoading: boolean;
  fetchForms: () => Promise<void>;
  setSelectedForm: (form: Form | null) => void;
  
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Forms state
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formsLoading, setFormsLoading] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<Theme>("light");
  
  // Language state
  const [language, setLanguageState] = useState<Language>("en");
  
  // Load persisted state on mount
  useEffect(() => {
    // Load auth
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    // Load theme
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    
    // Load language
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang) {
      setLanguageState(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  
  // Apply theme whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
  
  // Apply language direction whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
    root.setAttribute("lang", language);
  }, [language]);
  
  // Auth actions
  const login = async (username: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await axios.post(
        "https://dynamic-test.s-apps.net/api/user/login",
        { username, password }
      );
      
      if (response.data.token && response.data.user) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } finally {
      setAuthLoading(false);
    }
  };
  
  const register = async (username: string, password: string) => {
    setAuthLoading(true);
    try {
      const response = await axios.post(
        "https://dynamic-test.s-apps.net/api/user/register",
        { username, password }
      );
      
      if (response.data.token && response.data.user) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } finally {
      setAuthLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };
  
  // Forms actions
  const fetchForms = async () => {
    setFormsLoading(true);
    try {
      const response = await axios.get(
        "https://dynamic-test.s-apps.net/api/form",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      setForms(response.data.forms || response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      setForms([]);
    } finally {
      setFormsLoading(false);
    }
  };
  
  // Theme actions
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  
  // Language actions
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };
  
  const value: AppContextType = {
    user,
    token,
    authLoading,
    login,
    register,
    logout,
    forms,
    selectedForm,
    formsLoading,
    fetchForms,
    setSelectedForm,
    theme,
    toggleTheme,
    language,
    setLanguage,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
