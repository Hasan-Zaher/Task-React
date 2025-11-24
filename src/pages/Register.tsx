import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { observer } from "mobx-react-lite";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Loader2 } from "lucide-react";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, authLoading, token } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  console.log(authLoading)
  useEffect(() => {
    if (token) {
      navigate("/forms", { replace: true });
    }
  }, [token, navigate]);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username || !password || !confirmPassword) {
    toast.error(t("error"), { description: "Please fill in all fields" });
    return;
  }

  if (password !== confirmPassword) {
    toast.error(t("error"), { description: "Passwords do not match" });
    return;
  }

  if (password.length < 6) {
    toast.error(t("error"), { description: "Password must be at least 6 characters" });
    return;
  }

  console.debug("Register.handleSubmit: invoking register", { username, password });
  
  try {
    const result = await register(username, password);
    
   
    toast.success(t("success"), { 
      description: result.message || "Account created successfully! Please login." 
    });
    
 
    navigate("/login", { replace: true });
    
  } catch (error: any) {
    console.error("Register.handleSubmit: error", error);
    
    toast.error(t("error"), { 
      description: error.message || t("registerError") 
    });
  }
};
 
  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md shadow-elegant animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("createAccount")}
          </CardTitle>
          <CardDescription>{t("getStarted")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={authLoading}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={authLoading}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading")}
                </>
              ) : (
                t("signUp")
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t("login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default observer(Register);
