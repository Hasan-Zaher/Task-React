import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Authentication
      login: "Login",
      register: "Register",
      logout: "Logout",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      signIn: "Sign In",
      signUp: "Sign Up",
      welcomeBack: "Welcome Back",
      createAccount: "Create Account",
      getStarted: "Get started with your account",
      
      // Forms
      forms: "Forms",
      myForms: "My Forms",
      formDetails: "Form Details",
      noForms: "No forms available",
      loadingForms: "Loading forms...",
      
      // Common
      search: "Search",
      filter: "Filter",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      back: "Back",
      
      // Theme & Language
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      language: "Language",
      english: "English",
      arabic: "Arabic",
      
      // Errors
      loginError: "Login failed. Please check your credentials.",
      registerError: "Registration failed. Please try again.",
      fetchError: "Failed to fetch data. Please try again.",
    },
  },
  ar: {
    translation: {
      // Authentication
      login: "تسجيل الدخول",
      register: "التسجيل",
      logout: "تسجيل الخروج",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      alreadyHaveAccount: "هل لديك حساب بالفعل؟",
      dontHaveAccount: "ليس لديك حساب؟",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      welcomeBack: "مرحباً بعودتك",
      createAccount: "إنشاء حساب",
      getStarted: "ابدأ مع حسابك",
      
      // Forms
      forms: "النماذج",
      myForms: "نماذجي",
      formDetails: "تفاصيل النموذج",
      noForms: "لا توجد نماذج متاحة",
      loadingForms: "جاري تحميل النماذج...",
      
      // Common
      search: "بحث",
      filter: "تصفية",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      back: "رجوع",
      
      // Theme & Language
      darkMode: "الوضع الداكن",
      lightMode: "الوضع الفاتح",
      language: "اللغة",
      english: "English",
      arabic: "العربية",
      
      // Errors
      loginError: "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.",
      registerError: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
      fetchError: "فشل جلب البيانات. يرجى المحاولة مرة أخرى.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
