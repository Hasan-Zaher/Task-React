
import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import i18n from "i18next";
import { ReactNode } from "react";
import { API_BASE_URL, API_ENDPOINTS } from '@/config/constants';

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

class AppStore {
  // Auth
  user: User | null = null;
  token: string | null = null;
  authLoading = false;
  initialized = false;

  // Forms
  forms: Form[] = [];
  selectedForm: Form | null = null;
  formsLoading = false;

  // Theme & Language
  theme: Theme = "dark";
  language: Language = "en";

  constructor() {
 
    this.restoreState();
    makeAutoObservable(this);
  }

 
  private restoreState = () => {
    try {
     
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      if (savedToken) {
        this.token = savedToken;
      }
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch {
          this.user = null;
        }
      }

     
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) {
        this.theme = savedTheme;
        this.applyTheme();  
      } else {
      
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        this.theme = prefersDark ? "dark" : "light";
        this.applyTheme();
      }

      
      const savedLang = localStorage.getItem("language") as Language | null;
      if (savedLang) {
        this.language = savedLang;
        this.applyLanguage();  
        
         
        setTimeout(() => {
          this.safeChangeLanguage(savedLang);
        }, 100);
      } else {
        
        this.language = "en";
        this.applyLanguage();
      }

    } catch (error) {
      console.error('Error restoring state:', error);
    }
  }

  initialize = async (): Promise<void> => {
    if (this.initialized) return;

    try {
     
      this.applyTheme();
      this.applyLanguage();

    
      if (this.language) {
        await this.safeChangeLanguage(this.language);
      }

      runInAction(() => {
        this.initialized = true;
      });

    } catch (error) {
      console.error('Error initializing AppStore:', error);
    }
  }

  checkAuth = (): boolean => {
   
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        runInAction(() => {
          this.token = token;
          this.user = user;
        });
        return true;
      } catch {
        this.logout();
        return false;
      }
    } else {
      
      runInAction(() => {
        this.token = null;
        this.user = null;
      });
      return false;
    }
  }

  safeChangeLanguage = (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      const tryChangeLanguage = () => {
        if (!i18n || typeof i18n.changeLanguage !== 'function') {
          console.warn('i18n not initialized yet, retrying...');
          setTimeout(tryChangeLanguage, 100);
          return;
        }
        
        i18n.changeLanguage(lang).then(() => {
          console.log('Language changed successfully to:', lang);
          resolve();
        }).catch((error) => {
          console.error('Failed to change language:', error);
          resolve();
        });
      };
      tryChangeLanguage();
    });
  }

  applyTheme = () => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    
   
    root.classList.remove("light", "dark");
    
 
    if (this.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
    
    console.log('Theme applied:', this.theme);
  }

  applyLanguage = () => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    const direction = this.language === "ar" ? "rtl" : "ltr";
    
    root.setAttribute("dir", direction);
    root.setAttribute("lang", this.language);
    
    console.log('Language applied:', this.language, 'Direction:', direction);
  }

  // Auth actions
  login = async (username: string, password: string) => {
  runInAction(() => {
    this.authLoading = true;
  });
  
  try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, 
        { username, password }
      );

    console.debug("AppStore.login: api response", response?.data);
    
    
    if (response.data?.statusCode === 0) {
      const token = response.data?.data?.token;
      const user = response.data?.data?.user;
      
      if (token) {
        runInAction(() => {
          this.token = token;
          this.user = user ?? { id: '1', username };
          this.authLoading = false;
        });
        
        localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          localStorage.setItem("user", JSON.stringify({ id: '1', username }));
        }
        
        return { success: true, token, user };
      } else {
        throw new Error("Login successful but no token received");
      }
    } else {
   
      const errorMessage = response.data?.message?.message || 
                          response.data?.message || 
                          "Login failed";
      throw new Error(errorMessage);
    }
    
  } catch (error: any) {
    runInAction(() => {
      this.authLoading = false;
    });
    
    console.error("AppStore.login: error", error);
    
   
    let errorMessage = "Login failed";
    
    if (error.response?.data?.statusCode === 1) {
      //   م ن     (Invalid credentials)
      errorMessage = error.response.data?.message?.message || 
                    error.response.data?.message || 
                    "Invalid credentials";
    } else if (error.response?.data?.message) {
 
      errorMessage = error.response.data.message;
    } else if (error.message) {
 
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}
 
  register = async (username: string, password: string) => {
  runInAction(() => {
    this.authLoading = true;
  });
  
  try {
    const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, 
        { username, password }
      );
    
    console.debug("AppStore.register: api response", response?.data);
    
   
    if (response.data?.statusCode === 0) {
    
      runInAction(() => {
        this.authLoading = false;
      });
      
    
      return {
        success: true,
        message: response.data?.message || "Registration successful",
        data: response.data?.data
      };
    } else {
 
      throw new Error(response.data?.message || "Registration failed");
    }
    
  } catch (error: any) {
    runInAction(() => {
      this.authLoading = false;
    });
    
    console.error("AppStore.register: error", error);
    
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Registration failed";
    
    throw new Error(errorMessage);
  }
}
  

  logout = () => {
    runInAction(() => {
      this.user = null;
      this.token = null;
      this.authLoading = false;
      this.forms = [];
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Forms
  fetchForms = async () => {
    runInAction(() => {
      this.formsLoading = true;
    });
    
    try {
     const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.FORMS}`,
        {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
        }
      );
     
      const apiData = response.data?.data ?? [];
      const transformedForms = Array.isArray(apiData) ? apiData.map(form => ({
        id: form.id,
        title: form.name || 'Untitled Form',
        description: form.description || `Form with ${form.schema?.length || 0} sections`,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        status: form.status || "Active",
        originalData: form.data,
        schema: form.schema,
        name: form.name,
        data: form.data
      })) : [];
      
      runInAction(() => {
        this.forms = transformedForms;
        this.formsLoading = false;
      });
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      runInAction(() => {
        this.forms = [];
        this.formsLoading = false;
      });
    }
  }

  setSelectedForm = (form: Form | null) => {
    this.selectedForm = form;
  }

 
  toggleTheme = () => {
    runInAction(() => {
      this.theme = this.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
      this.applyTheme();  
    });
  }

  setTheme = (theme: Theme) => {
    runInAction(() => {
      this.theme = theme;
      localStorage.setItem("theme", theme);
      this.applyTheme(); 
    });
  }

 
  setLanguage = (lang: Language) => {
    runInAction(() => {
      this.language = lang;
      localStorage.setItem("language", lang);
      this.applyLanguage(); 
      this.safeChangeLanguage(lang);
    });
  }
}

 
const appStore = new AppStore();

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useApp = () => {
  return appStore;
}; 