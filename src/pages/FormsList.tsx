import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { observer } from "mobx-react-lite";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Loader2, LogOut, Search, FileText, RefreshCw, Layout, Database } from "lucide-react";

const FormsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fetchForms, forms, formsLoading, logout, setSelectedForm } = useApp();
  const [searchQuery, setSearchQuery] = useState("");


  

  useEffect(() => {
    loadForms();
  }, []);
 
  useEffect(() => {
    if (forms.length > 0) {
      console.log("Forms_data", forms);
      console.log("First form details:", forms[0]);
    }
  }, [forms]);

  const loadForms = async () => {
    try {
      await fetchForms();
    } catch (error) {
      toast.error(t("error"), { description: t("fetchError") });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(t("success"), { description: "Logged out successfully" });
    navigate("/login");
  };

  const handleFormClick = (form: any) => {
    setSelectedForm(form);
    navigate(`/forms/${form.id}`);
  };

  const filteredForms = forms.filter((form) =>
    form.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.name?.toLowerCase().includes(searchQuery.toLowerCase())  
  );

  // Helper function to get form status badge
  const getStatusBadge = (form: any) => {
    if (form.status) return form.status;
    if (form.data && form.data.length > 0) return "Has Data";
    return "Draft";
  };

  // Helper function to get form description
  const getFormDescription = (form: any) => {
    if (form.description) return form.description;
    
    const sectionCount = form.schema?.length || 0;
    const dataCount = form.data?.length || 0;
    
    if (sectionCount > 0 && dataCount > 0) {
      return `${sectionCount} sections, ${dataCount} data entries`;
    } else if (sectionCount > 0) {
      return `${sectionCount} sections, no data yet`;
    } else {
      return "No sections defined";
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("myForms")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8 animate-fade-in">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Loading State */}
        {formsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">{t("loadingForms")}</span>
          </div>
        )}

        {/* Forms Grid */}
        {!formsLoading && filteredForms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover:scale-105 group"
                onClick={() => handleFormClick(form)}
              >
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">
                    {form.title || form.name || 'Untitled Form'}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {getFormDescription(form)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded-full ${
                      getStatusBadge(form) === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : getStatusBadge(form) === 'Has Data'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {getStatusBadge(form)}
                    </span>
                    {form.createdAt && (
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  {/* Additional form info */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    {form.schema && (
                      <span className="flex items-center gap-1">
                        <Layout className="h-3 w-3" />
                        {form.schema.length} sections
                      </span>
                    )}
                    {form.data && (
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {form.data.length} entries
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!formsLoading && filteredForms.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <FileText className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No forms match your search" : t("noForms")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start by creating your first form"
              }
            </p>
            {!searchQuery && (
              <Button onClick={loadForms} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Forms
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default observer(FormsList);
