import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { CommandBar } from '@/components/dashboard/CommandBar';
import { SpotlightCard } from '@/components/dashboard/SpotlightCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { BentoGrid } from '@/components/dashboard/BentoGrid';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Daily quote rotation
const QUOTES = [
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "Sales are contingent upon the attitude of the salesman, not the attitude of the prospect.", author: "W. Clement Stone" },
  { text: "Every strike brings me closer to the next home run.", author: "Babe Ruth" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "You miss 100 percent of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

function useRealKPIs() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState({ callsToday: 0, callsWeek: 0, avgScore: 0 });

  useEffect(() => {
    if (!user) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

    Promise.all([
      supabase.from('call_recordings').select('id', { count: 'exact' }).eq('user_id', user.id).is('deleted_at', null).gte('created_at', today.toISOString()),
      supabase.from('call_recordings').select('id', { count: 'exact' }).eq('user_id', user.id).is('deleted_at', null).gte('created_at', weekAgo.toISOString()),
      supabase.from('call_scores').select('overall_score').gte('created_at', weekAgo.toISOString()),
    ]).then(([todayRes, weekRes, scoreRes]) => {
      const scores = (scoreRes.data || []).map(s => s.overall_score).filter(Boolean);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      setKpis({
        callsToday: todayRes.count || 0,
        callsWeek: weekRes.count || 0,
        avgScore,
      });
    });
  }, [user]);

  return kpis;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [activeCallName, setActiveCallName] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const kpis = useRealKPIs();
  const quote = getDailyQuote();

  // Auto-open dialer when navigated from WinWords with script
  useEffect(() => {
    if ((location.state as any)?.openDialer) {
      setShowCallDialog(true);
      // Clear the state so it doesn't re-trigger on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} callName={activeCallName} onClose={() => { setActiveCall(null); setActiveCallName(undefined); }} />
      )}
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={(phone, name) => {
          setShowCallDialog(false);
          setActiveCall(phone);
          setActiveCallName(name);
        }}
      />
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-5 max-w-[1400px] mx-auto">
          {/* Command Bar */}
          <CommandBar
            userName={userName}
            kpis={kpis}
            quote={quote}
            onStartCall={() => setShowCallDialog(true)}
          />

          {/* Onboarding Checklist */}
          <OnboardingChecklist />

          {/* Spotlight */}
          <SpotlightCard
            onStartCall={() => setShowCallDialog(true)}
            onNavigate={navigate}
            avgScore={kpis.avgScore}
          />

          {/* Main Content: Feed + Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
            <div className="lg:col-span-3">
              <ActivityFeed />
            </div>
            <div className="lg:col-span-2">
              <BentoGrid kpis={kpis} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
