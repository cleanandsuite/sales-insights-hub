import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Recordings from "./pages/Recordings";
import RecordingAnalysis from "./pages/RecordingAnalysis";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Schedule from "./pages/Schedule";
import Coaching from "./pages/Coaching";
import Settings from "./pages/Settings";
import SalesforceSettings from "./pages/SalesforceSettings";
import Leads from "./pages/Leads";
import { Navigate } from "react-router-dom";
import Analytics from "./pages/Analytics";
import WinWords from "./pages/WinWords";
import AudioTest from "./pages/AudioTest";
import Manager from "./pages/Manager";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/recordings" element={<ProtectedRoute><Recordings /></ProtectedRoute>} />
            <Route path="/recording/:id" element={<ProtectedRoute><RecordingAnalysis /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/call-history" element={<Navigate to="/recordings" replace />} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/coaching" element={<ProtectedRoute><Coaching /></ProtectedRoute>} />
            <Route path="/winwords" element={<ProtectedRoute><WinWords /></ProtectedRoute>} />
            <Route path="/manager" element={<ProtectedRoute><Manager /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/salesforce" element={<ProtectedRoute><SalesforceSettings /></ProtectedRoute>} />
            <Route path="/audio-test" element={<ProtectedRoute><AudioTest /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
