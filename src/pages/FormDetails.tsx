import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ArrowLeft, FileText } from "lucide-react";

const FormDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedForm, setSelectedForm, forms, fetchForms } = useApp();

  useEffect(() => {
    if (!selectedForm && id) {
      // Try to find form in existing forms
      const form = forms.find((f) => f.id === id);
      if (form) {
        setSelectedForm(form);
      } else if (forms.length === 0) {
        // If forms list is empty, fetch it
        fetchForms();
      }
    }
  }, [id, selectedForm, forms, setSelectedForm, fetchForms]);

  useEffect(() => {
    // Once forms are loaded, find the specific form
    if (forms.length > 0 && !selectedForm && id) {
      const form = forms.find((f) => f.id === id);
      if (form) {
        setSelectedForm(form);
      }
    }
  }, [forms, selectedForm, id, setSelectedForm]);

  if (!selectedForm) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t("loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/forms")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("formDetails")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-elegant animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl">{selectedForm.title}</CardTitle>
            {selectedForm.description && (
              <CardDescription className="text-base mt-2">
                {selectedForm.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            {selectedForm.status && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Status</h3>
                <span className="px-3 py-1.5 bg-accent/20 rounded-full text-accent-foreground">
                  {selectedForm.status}
                </span>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedForm.createdAt && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Created At</h3>
                  <p className="text-foreground">
                    {new Date(selectedForm.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedForm.updatedAt && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Updated At</h3>
                  <p className="text-foreground">
                    {new Date(selectedForm.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Fields */}
            {Object.keys(selectedForm).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  Additional Information
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedForm)
                    .filter(
                      ([key]) =>
                        !["id", "title", "description", "status", "createdAt", "updatedAt"].includes(
                          key
                        )
                    )
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-foreground">
                          {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/forms")}
                className="flex-1"
              >
                {t("back")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FormDetails;
