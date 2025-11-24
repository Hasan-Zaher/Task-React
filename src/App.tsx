 
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import {  QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "@/routes/AppRoutes";
import "@/lib/i18n";
import { queryClient } from "@/config/query-client";

 


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppContent = () => (
  <>
    <Toaster />
    <Sonner />
    <AppRoutes />
  </>
);

export default App;