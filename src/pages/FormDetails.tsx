import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
 
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";

import { AlignLeft, ArrowLeft, Badge, BadgeCheck, Calendar, CheckSquare, CircleCheck, Database, FileText, Filter, Folder, FolderOpen, Hash, Info, Layout, Loader2, Search, X } from "lucide-react";
 

import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import i18n from "@/lib/i18n";

const FormDetails = () => {
  const { t } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedForm, setSelectedForm, forms, fetchForms, formsLoading } = useApp();
  const [activeTab, setActiveTab] = useState('schema');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
 
  const formData = selectedForm ? toJS(selectedForm) : null;

  useEffect(() => {
    const loadFormData = async () => {
      if (!id) {
        navigate("/forms");
        return;
      }

      if (selectedForm && selectedForm.id === id) {
        return;
      }

      const existingForm = forms.find((f) => f.id === id);
      if (existingForm) {
        setSelectedForm(existingForm);
        return;
      }

      if (forms.length === 0) {
        try {
          await fetchForms();
          const formAfterFetch = forms.find((f) => f.id === id);
          if (formAfterFetch) {
            setSelectedForm(formAfterFetch);
          }
        } catch (error) {
          console.error('Failed to fetch forms:', error);
        }
      }
    };

    loadFormData();
  }, [id, forms, selectedForm, setSelectedForm, fetchForms, navigate]);

  const sections = useMemo(() => {
    if (!formData?.schema) return [];
    return formData.schema.map(section => section.name);
  }, [formData]);


  //     // =============================================
  //     // COMMENT: Client-side data filtering implementation
  //     // 
  //     // ⚠️  ARCHITECTURAL CONCERN - FRONTEND FILTERING ANTIPATTERN
  //     // 
  //     // CURRENT IMPLEMENTATION ISSUES:
  //     // ❌ INEFFICIENT: Processes entire dataset on every keystroke
  //     // ❌ POOR PERFORMANCE: Slow with large forms or many entries
  //     // ❌ HIGH MEMORY USAGE: Loads all data even when filtered
  //     // ❌ POOR SCALABILITY: Performance degrades with data growth
  //     // 
  //     // WHY THIS IS PROBLEMATIC:
  //     // 1. User searches for "email" → filters 1000+ fields locally
  //     // 2. Each keystroke re-processes the entire form data
  //     // 3. Mobile devices suffer from JavaScript overhead
  //     // 4. No pagination support for filtered results
  //     // 
  //     // BACKEND API IMPROVEMENTS REQUIRED:
  //     // ✅ GET /forms/:id/schema?search=query&section=name
  //     // ✅ GET /forms/:id/data?search=query&section=name&page=1
  //     // ✅ POST /forms/:id/search { query: "text", sections: ["all"], filters: {} }
  //     // 
  //     // EXAMPLE BACKEND FILTERING ENDPOINTS:
  //     // Search schema fields:   GET /forms/123/schema?search=email&section=contact
  //     // Filter form data:       GET /forms/123/data?search=john&page=1&limit=20
  //     // Advanced search:        POST /forms/123/search 
  //     //   { query: "completed", sections: ["status"], dateRange: {from: "...", to: "..."} }
  //     // 
  //     // TEMPORARY WORKAROUND (Current Implementation):
  //     // This client-side filtering is a temporary solution until backend
  //     // implements proper search and filtering APIs.
  //     // =============================================

  const filteredData = useMemo(() => {
    if (!formData) return { schema: [], data: [] };

    const filterFields = (fields, containerName = '') => {
      return fields.filter(field => {
        const matchesSearch = searchTerm === '' || 
          field.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSection = selectedSection === 'all' || 
          containerName === selectedSection;

        return matchesSearch && matchesSection;
      });
    };

    const filteredSchema = formData.schema?.map(section => ({
      ...section,
      items: filterFields(section.items, section.name)
    })).filter(section => section.items.length > 0) || [];

    const filteredFormData = formData.data?.map(entry => ({
      ...entry,
      data: entry.data?.map(container => ({
        ...container,
        items: filterFields(container.items, container.name)
      })).filter(container => container.items.length > 0)
    })).filter(entry => entry.data?.length > 0) || [];

    return {
      schema: filteredSchema,
      data: filteredFormData
    };
  }, [formData, searchTerm, selectedSection]);

  const getFieldTypeColor = (type: string) => {
    const colors = {
      string: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      date: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      "text-area": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
      checklist: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      container: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
      default: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const getFieldIcon = (type: string) => {
    const icons = {
      string: <FileText className="h-4 w-4" />,
      date: <Calendar className="h-4 w-4" />,
      "text-area": <AlignLeft className="h-4 w-4" />,
      checklist: <CheckSquare className="h-4 w-4" />,
      container: <Folder className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const renderField = (field: any, depth = 0) => {
    const hasValue = field.value !== undefined && field.value !== "" && field.value !== null;
    const hasItems = field.items && Array.isArray(field.items) && field.items.length > 0;

    return (
      <div
        className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getFieldTypeColor(field.type)} ${
          depth > 0 ? 'ml-4 border-l-2' : ''
        }`}
        style={{ marginLeft: `${depth * 1}rem` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getFieldTypeColor(field.type)}`}>
              {getFieldIcon(field.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">{field.name}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFieldTypeColor(field.type)}`}>
                  {field.type}
                </span>             
              </div>
            </div>
          </div>
        </div>
        
        {hasValue && (
          <div className="mt-3 p-3 bg-white/50 dark:bg-black/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CircleCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">{t("enteredValue")}</span>
            </div>
            <p className="text-foreground font-mono text-sm bg-white dark:bg-gray-900 p-2 rounded border">
              {Array.isArray(field.value) ? field.value.join(", ") : field.value}
            </p>
          </div>
        )}
        
        {hasItems && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-sm">{t("subItems")} ({field.items.length})</span>
            </div>
            <div className="space-y-3">
              {field.items.map((item: any, index: number) => (
                <div key={index}>
                  {renderField(item, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormData = () => {
    if (!filteredData.data || filteredData.data.length === 0) {
      return (
        <div className="text-center py-12">
          <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("noDataEntries")}</h3>
          <p className="text-muted-foreground">{t("noDataEntriesMatch")}</p>
        </div>
      );
    }

    return filteredData.data.map((entry: any, entryIndex: number) => (
      <Card key={entry.id || entryIndex} className="mb-6 hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div>{t("dataEntry")} {entryIndex + 1}</div>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
                {entry.id && (
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {t("id")}: {entry.id}
                  </span>
                )}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {entry.data && entry.data.map((container: any, containerIndex: number) => (
              <div key={containerIndex} className="border-2 rounded-xl p-5 bg-card">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                  <Folder className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold text-primary">{container.name}</h3>
                  <Badge className="ml-auto">
                    {container.items?.length || 0} {t("fields")}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {container.items && container.items.map((field: any, fieldIndex: number) => (
                    <div key={fieldIndex}>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderFormSchema = () => {
    if (!filteredData.schema || filteredData.schema.length === 0) {
      return (
        <div className="text-center py-12">
          <Layout className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("noSchemaFound")}</h3>
          <p className="text-muted-foreground">{t("noSchemaMatch")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredData.schema.map((container: any, containerIndex: number) => (
          <Card key={containerIndex} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Layout className="h-5 w-5 text-white" />
                </div>
                <div>
                  {container.name}
                  <CardDescription className="mt-1">
                    {container.items?.length || 0} {t("fieldsInSection")}
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {container.items && container.items.map((field: any, fieldIndex: number) => (
                  <div key={fieldIndex}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6 max-w-6xl mx-auto">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
         
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative"> 
              <Search className={`absolute  ${ isRTL ?"right-3":"left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t("searchFieldsAndValues")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`  ${ isRTL ?"pr-10":"pl-10"}  w-full lg:w-80`}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Label htmlFor="section-filter" className="text-sm font-medium whitespace-nowrap">
              {t("filterBySection")}:
            </Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSections")}</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeTab === 'schema' ? 'default' : 'outline'}
              onClick={() => setActiveTab('schema')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              {t("schema")}
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'outline'}
              onClick={() => setActiveTab('data')}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {t("data")} ({formData?.data?.length || 0})
            </Button>
          </div>
        </div>

        {(searchTerm || selectedSection !== 'all') && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>
                  {t("showing")} {activeTab === 'schema' ? filteredData.schema.length : filteredData.data.length} 
                  {activeTab === 'schema' ? ` ${t("sections")}` : ` ${t("entries")}`}
                </span>
              </div>
              {searchTerm && (
                <div className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  <span>{t("search")}: "{searchTerm}"</span>
                </div>
              )}
              {selectedSection !== 'all' && (
                <div className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  <span>{t("section")}: {selectedSection}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSection('all');
                }}
                className="ml-auto h-6 text-xs"
              >
                {t("clearFilters")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (formsLoading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("loadingFormData")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("formNotFound")}</h3>
            <p className="text-muted-foreground mb-4">{t("formCouldNotBeLoaded")}</p>
            <Button onClick={() => navigate("/forms")}>
              {t("backToForms")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/forms")}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formData.title || formData.name}
                </h1>
                {formData.description && (
                  <p className="text-muted-foreground text-sm mt-1">{formData.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-elegant animate-fade-in mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              {t("formOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">{t("sections")}</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formData.schema?.length || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-300">{t("dataEntries")}</span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formData.data?.length || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-700 dark:text-purple-300">{t("created")}</span>
                </div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-700 dark:text-orange-300">{t("status")}</span>
                </div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  {formData.status || t("active")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {renderFilters()}

        <div className="max-w-6xl mx-auto">
          {activeTab === 'schema' ? renderFormSchema() : renderFormData()}
        </div>

        <div className="max-w-6xl mx-auto mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/forms")}
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToFormsList")}
          </Button>
        </div>
      </main>
    </div>
  );
}; 
export default observer(FormDetails);
