import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CharacterProvider } from "@/contexts/CharacterContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeamProtectedRoute } from "@/components/TeamProtectedRoute";
import { Loader2 } from "lucide-react";

// Eagerly load the landing page for best initial load performance
import Index from "./pages/Index";

// Lazy load all other pages to reduce initial bundle size
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Recordings = lazy(() => import("./pages/Recordings"));
const RecordingAnalysis = lazy(() => import("./pages/RecordingAnalysis"));
const Upload = lazy(() => import("./pages/Upload"));
const Profile = lazy(() => import("./pages/Profile"));
const Team = lazy(() => import("./pages/Team"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Coaching = lazy(() => import("./pages/Coaching"));
const Settings = lazy(() => import("./pages/Settings"));
const SalesforceSettings = lazy(() => import("./pages/SalesforceSettings"));
const Leads = lazy(() => import("./pages/Leads"));
const Analytics = lazy(() => import("./pages/Analytics"));
const WinWords = lazy(() => import("./pages/WinWords"));
const AudioTest = lazy(() => import("./pages/AudioTest"));
const Manager = lazy(() => import("./pages/Manager"));
const RevenueIntelligence = lazy(() => import("./pages/RevenueIntelligence"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Support = lazy(() => import("./pages/Support"));
const AccountBlocked = lazy(() => import("./pages/AccountBlocked"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PaymentComplete = lazy(() => import("./pages/PaymentComplete"));
const UpgradePlan = lazy(() => import("./pages/UpgradePlan"));
const Success = lazy(() => import("./pages/Success"));
// A/B Testing disabled - always show landing page as-is
// const Experiments = lazy(() => import("./pages/Experiments"));
const Admin = lazy(() => import("./pages/Admin"));
const Enterprise = lazy(() => import("./pages/Enterprise"));
const GameStyleGuide = lazy(() => import("./pages/GameStyleGuide"));
const Integrations = lazy(() => import("./pages/Integrations"));
const StationaryCharacterDemo = lazy(() => import("./pages/StationaryCharacterDemo"));

const queryClient = new QueryClient();

// Minimal loading fallback that matches the app's style
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <AuthProvider>
            <CharacterProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Index />} />

                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/upgrade" element={<ProtectedRoute><UpgradePlan /></ProtectedRoute>} />
                <Route path="/account-blocked" element={<AccountBlocked />} />
                <Route path="/success" element={<Success />} />
                <Route path="/payment-complete" element={<PaymentComplete />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/recordings" element={<ProtectedRoute><Recordings /></ProtectedRoute>} />
                <Route path="/recording/:id" element={<ProtectedRoute><RecordingAnalysis /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
                <Route path="/call-history" element={<Navigate to="/recordings" replace />} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/team" element={<TeamProtectedRoute><Team /></TeamProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
                <Route path="/coaching" element={<ProtectedRoute><Coaching /></ProtectedRoute>} />
                <Route path="/winwords" element={<ProtectedRoute><WinWords /></ProtectedRoute>} />
                <Route path="/manager" element={<ProtectedRoute><Manager /></ProtectedRoute>} />
                <Route path="/revenue-intelligence" element={<ProtectedRoute><RevenueIntelligence /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/settings/salesforce" element={<ProtectedRoute><SalesforceSettings /></ProtectedRoute>} />
                <Route path="/audio-test" element={<ProtectedRoute><AudioTest /></ProtectedRoute>} />
                {/* A/B Testing disabled - Experiments route hidden */}
                {/* <Route path="/experiments" element={<ProtectedRoute><Experiments /></ProtectedRoute>} /> */}
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/enterprise" element={<ProtectedRoute><Enterprise /></ProtectedRoute>} />
                <Route path="/game-style" element={<ProtectedRoute><GameStyleGuide /></ProtectedRoute>} />
                <Route path="/agency-profile" element={<Navigate to="/dashboard" replace />} />
                <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                <Route path="/stationary-demo" element={<StationaryCharacterDemo />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/support" element={<Support />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </CharacterProvider>
          </AuthProvider>
        </BrowserRouter>
        </ThemeProvider>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
