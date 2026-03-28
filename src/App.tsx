// @ts-ignore - QueryClient export may not be found by TS but works at runtime
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientExams = lazy(() => import("./pages/PatientExams"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const GestationalCalculator = lazy(() => import("./pages/GestationalCalculator"));
const FertilityCalculator = lazy(() => import("./pages/FertilityCalculator"));
const BiometryCalculator = lazy(() => import("./pages/BiometryCalculator"));
const BPDCalculator = lazy(() => import("./pages/BPDCalculator"));
const CRLCalculator = lazy(() => import("./pages/CRLCalculator"));
const EFWCalculator = lazy(() => import("./pages/EFWCalculator"));
const DopplerCalculator = lazy(() => import("./pages/DopplerCalculator"));
const GrowthCurveCalculator = lazy(() => import("./pages/GrowthCurveCalculator"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">Carregando...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
              <Route path="/gestational" element={<GestationalCalculator />} />
              <Route path="/fertility" element={<FertilityCalculator />} />
              <Route path="/biometry" element={<BiometryCalculator />} />
              <Route path="/bpd" element={<BPDCalculator />} />
              <Route path="/crl" element={<CRLCalculator />} />
              <Route path="/efw" element={<EFWCalculator />} />
              <Route path="/doppler" element={<DopplerCalculator />} />
              <Route path="/growth-curve" element={<GrowthCurveCalculator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
