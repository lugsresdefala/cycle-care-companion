import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientExams = lazy(() => import("./pages/PatientExams"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const GestationalCalculator = lazy(() => import("./pages/GestationalCalculator"));
const FertilityCalculator = lazy(() => import("./pages/FertilityCalculator"));
const BiometryCalculator = lazy(() => import("./pages/BiometryCalculator"));
const BPDCalculator = lazy(() => import("./pages/BPDCalculator"));
const CRLCalculator = lazy(() => import("./pages/CRLCalculator"));
const EFWCalculator = lazy(() => import("./pages/EFWCalculator"));
const DopplerCalculator = lazy(() => import("./pages/DopplerCalculator"));
const GrowthCurveCalculator = lazy(() => import("./pages/GrowthCurveCalculator"));
const TrisomyRiskCalculator = lazy(() => import("./pages/TrisomyRiskCalculator"));
const PreeclampsiaRiskCalculator = lazy(() => import("./pages/PreeclampsiaRiskCalculator"));
const Admin = lazy(() => import("./pages/Admin"));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
          <h1 className="text-xl font-semibold text-foreground">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">Carregando...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/termos" element={<TermsOfUse />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
              <Route path="/patient/:id/exams" element={<ProtectedRoute><PatientExams /></ProtectedRoute>} />
              <Route path="/gestational" element={<GestationalCalculator />} />
              <Route path="/fertility" element={<FertilityCalculator />} />
              <Route path="/biometry" element={<BiometryCalculator />} />
              <Route path="/bpd" element={<BPDCalculator />} />
              <Route path="/crl" element={<CRLCalculator />} />
              <Route path="/efw" element={<EFWCalculator />} />
              <Route path="/doppler" element={<DopplerCalculator />} />
              <Route path="/growth-curve" element={<GrowthCurveCalculator />} />
              <Route path="/trisomy-risk" element={<TrisomyRiskCalculator />} />
              <Route path="/preeclampsia-risk" element={<PreeclampsiaRiskCalculator />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
