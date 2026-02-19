import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CallDialog } from '@/components/calling/CallDialog';
import { CallInterface } from '@/components/calling/CallInterface';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DealPriorityCard } from '@/components/dashboard/DealPriorityCard';
import { RevenueTrendChart } from '@/components/dashboard/RevenueTrendChart';
import { AIStatusBar } from '@/components/dashboard/AIStatusBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { mockDeals, calculatePipelineSummary } from '@/data/mockDeals';
import { 
  Phone, DollarSign, Target, TrendingUp, BarChart3, ArrowRight, Mic, Clock, Star,
  Search, ChevronLeft, ChevronRight, Quote
} from 'lucide-react';

// 1000 inspiring sales / life quotes picked at random each day
const QUOTES = [
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Sales are contingent upon the attitude of the salesman, not the attitude of the prospect.", author: "W. Clement Stone" },
  { text: "It's not about having the right opportunities. It's about handling the opportunities right.", author: "Mark Hunter" },
  { text: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.", author: "Vince Lombardi" },
  { text: "Every strike brings me closer to the next home run.", author: "Babe Ruth" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The harder the conflict, the greater the triumph.", author: "George Washington" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "There are no limits to what you can accomplish, except the limits you place on your own thinking.", author: "Brian Tracy" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "No masterpiece was ever created by a lazy artist.", author: "Salvador Dali" },
  { text: "Hustle until your haters ask if you're hiring.", author: "Steve Harvey" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { text: "If you want to achieve greatness stop asking for permission.", author: "Anonymous" },
  { text: "Things work out best for those who make the best of how things work out.", author: "John Wooden" },
  { text: "To live a creative life, we must lose our fear of being wrong.", author: "Anonymous" },
  { text: "If you are not willing to risk the usual, you will have to settle for the ordinary.", author: "Jim Rohn" },
  { text: "Too many of us are not living our dreams because we are living our fears.", author: "Les Brown" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Definiteness of purpose is the starting point of all achievement.", author: "W. Clement Stone" },
  { text: "I never dreamed about success, I worked for it.", author: "Estée Lauder" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.", author: "David Brinkley" },
  { text: "What you lack in talent can be made up with desire, hustle and giving 110% all the time.", author: "Don Zimmer" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "If you want to conquer fear, don't sit home and think about it. Go out and get busy.", author: "Dale Carnegie" },
  { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
  { text: "The first step toward success is taken when you refuse to be a captive of the environment in which you first find yourself.", author: "Mark Caine" },
  { text: "People who succeed have momentum. The more they succeed, the more they want to succeed, and the more they find a way to succeed.", author: "Tony Robbins" },
  { text: "When I dare to be powerful, to use my strength in the service of my vision, then it becomes less and less important whether I am afraid.", author: "Audre Lorde" },
  { text: "Whenever you see a successful person, you only see the public glories, never the private sacrifices to reach them.", author: "Vaibhav Shah" },
  { text: "The real test is not whether you avoid this failure, because you won't. It's whether you let it harden or shame you into inaction.", author: "Barack Obama" },
  { text: "You know, you don't have to act with me. You don't have to say anything and you don't have to do anything. Not a thing. Oh, maybe just whistle.", author: "Lauren Bacall" },
  { text: "In order to succeed, we must first believe that we can.", author: "Nikos Kazantzakis" },
  { text: "I can't imagine a person becoming a success who doesn't give this game of life everything he's got.", author: "Walter Cronkite" },
  { text: "A man can be as great as he wants to be. If you believe in yourself and have the courage, the determination, the dedication, the competitive drive and if you are willing to sacrifice the little things in life and pay the price for the things that are worthwhile, it can be done.", author: "Vince Lombardi" },
  { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
  { text: "If you take responsibility for yourself you will develop a hunger to accomplish your dreams.", author: "Les Brown" },
  { text: "Do what you do so well that they will want to see it again and bring their friends.", author: "Walt Disney" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "The successful man will profit from his mistakes and try again in a different way.", author: "Dale Carnegie" },
  { text: "It is our choices, that show what we truly are, far more than our abilities.", author: "J.K. Rowling" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
  { text: "You miss 100 percent of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "You can't build a reputation on what you are going to do.", author: "Henry Ford" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Don't go around saying the world owes you a living. The world owes you nothing. It was here first.", author: "Mark Twain" },
  { text: "You become what you believe.", author: "Oprah Winfrey" },
  { text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.", author: "Maya Angelou" },
  { text: "Definiteness of purpose is the starting point of all achievement.", author: "W. Clement Stone" },
  { text: "We must believe that we are gifted for something, and that this thing, at whatever cost, must be attained.", author: "Marie Curie" },
  { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart" },
  { text: "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.", author: "Martin Luther King Jr." },
  { text: "We must accept finite disappointment, but never lose infinite hope.", author: "Martin Luther King Jr." },
  { text: "For every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson" },
  { text: "Certain things catch your eye, but pursue only those that capture the heart.", author: "Ancient Indian Proverb" },
  { text: "Believe and act as if it were impossible to fail.", author: "Charles F. Kettering" },
  { text: "I cannot give you the formula for success, but I can give you the formula for failure, which is: Try to please everybody.", author: "Herbert Bayard Swope" },
  { text: "Courage is what it takes to stand up and speak; courage is also what it takes to sit down and listen.", author: "Winston Churchill" },
  { text: "We know what we are, but know not what we may be.", author: "William Shakespeare" },
  { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt" },
  { text: "Just when the caterpillar thought the world was ending, he turned into a butterfly.", author: "Anonymous" },
  { text: "At the end of the day, we can endure much more than we think we can.", author: "Frida Kahlo" },
  { text: "Two roads diverged in a wood and I – I took the one less traveled by, and that has made all the difference.", author: "Robert Frost" },
  { text: "Imperfect action is better than perfect inaction.", author: "Harry Truman" },
  { text: "Only those who dare to fail greatly can ever achieve greatly.", author: "Robert F. Kennedy" },
  { text: "Ask not what your country can do for you, ask what you can do for your country.", author: "John F. Kennedy" },
  { text: "Remember that not getting what you want is sometimes a wonderful stroke of luck.", author: "Dalai Lama" },
  { text: "You can never plan the future by the past.", author: "Edmund Burke" },
  { text: "Live and learn.", author: "Anonymous" },
  { text: "Life is short and it is here to be lived.", author: "Kate Winslet" },
  { text: "Every day is a chance to do better.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Your limitation—it's only your imagination.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Sometimes later becomes never. Do it now.", author: "Anonymous" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Anonymous" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
  { text: "Do something today that your future self will thank you for.", author: "Anonymous" },
  { text: "Little things make big days.", author: "Anonymous" },
  { text: "It's going to be hard, but hard is not impossible.", author: "Anonymous" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
  { text: "Wake up. Be awesome. Repeat.", author: "Anonymous" },
  { text: "Be the hardest working person in the room.", author: "Anonymous" },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// Real Recordings Table Component
function RecordingsTable() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;
  const VISIBLE = 8;

  const fetchRecordings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('call_recordings')
      .select('id, name, file_name, status, sentiment_score, duration_seconds, created_at, summary, key_topics')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);
    setRecordings(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    const pct = score * 100;
    if (pct >= 70) return 'text-green-600';
    if (pct >= 40) return 'text-yellow-600';
    return 'text-red-500';
  };

  const filtered = recordings.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = (r.name || r.file_name || '').toLowerCase();
    const summary = (r.summary || '').toLowerCase();
    const topics = (r.key_topics || []).join(' ').toLowerCase();
    return name.includes(q) || summary.includes(q) || topics.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const visible = paginated.slice(0, VISIBLE);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  if (recordings.length === 0) return (
    <div className="text-center py-12 text-muted-foreground">
      <Mic className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No calls recorded yet</p>
      <p className="text-sm mt-1">Your call recordings will appear here after your first call.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search calls by name, summary, or topic..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Call Name</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Duration</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Score</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">When</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Summary</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rec, i) => {
              const score = rec.sentiment_score ? Math.round(rec.sentiment_score * 100) : null;
              const displayName = rec.name || rec.file_name;
              return (
                <tr
                  key={rec.id}
                  className="border-b border-border/30 hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/recordings`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[160px]">{displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(rec.duration_seconds)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {score !== null ? (
                      <span className={`flex items-center gap-1 font-semibold ${getScoreColor(rec.sentiment_score)}`}>
                        <Star className="h-3 w-3" />
                        {score}/100
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        rec.status === 'analyzed'
                          ? 'border-green-500/30 text-green-600 bg-green-50'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      {rec.status === 'analyzed' ? 'AI Analyzed' : rec.status || 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {formatTime(rec.created_at)}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <p className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">
                      {rec.summary || '—'}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No calls match your search.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages} · {filtered.length} calls
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Real KPI data from Supabase
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
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const { user } = useAuth();
  const kpis = useRealKPIs();
  const quote = getDailyQuote();

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <>
      {activeCall && (
        <CallInterface phoneNumber={activeCall} onClose={() => setActiveCall(null)} />
      )}
      <CallDialog
        open={showCallDialog}
        onOpenChange={setShowCallDialog}
        onStartCall={(phone) => setActiveCall(phone)}
      />
      <DashboardLayout>
        <div className="bg-dashboard-gradient -m-3 sm:-m-4 lg:-m-8 p-3 sm:p-4 lg:p-8 min-h-screen space-y-4 sm:space-y-6">
          {/* Header */}
          <DashboardHeader
            userName={userName}
            subtitle="Your daily performance hub — let's make calls and close deals"
            onStartCall={() => setShowCallDialog(true)}
          />

          {/* Quote of the Day */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
            <Quote className="h-5 w-5 text-primary/60 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm italic text-foreground/80">"{quote.text}"</p>
              <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
            </div>
          </div>

          {/* AI Status */}
          <AIStatusBar
            isActive={true}
            todayLeads={kpis.callsToday}
            weekLeads={kpis.callsWeek}
            conversionRate={kpis.avgScore}
            avgResponseTime="2.4 min"
          />

          {/* Dashboard Tabs */}
          <Tabs defaultValue="calls" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-muted/50 h-10 w-full sm:w-auto">
              <TabsTrigger value="calls" className="gap-1.5 flex-1 sm:flex-none">
                <Phone className="h-4 w-4" />
                <span className="hidden xs:inline">Calls &amp; </span>Activity
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-1.5 flex-1 sm:flex-none">
                <DollarSign className="h-4 w-4" />
                <span className="hidden xs:inline">Revenue &amp; </span>Pipeline
              </TabsTrigger>
            </TabsList>

            {/* === CALLS TAB === */}
            <TabsContent value="calls" className="space-y-4 sm:space-y-6 mt-0">
              {/* Real Call KPIs */}
              <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Calls Today"
                  value={String(kpis.callsToday)}
                  icon={Phone}
                  iconColor="text-primary"
                  action={{ label: 'View Queue', onClick: () => navigate('/leads') }}
                />
                <MetricCard
                  label="Avg Call Score"
                  value={kpis.avgScore > 0 ? String(kpis.avgScore) : '—'}
                  icon={Star}
                  iconColor="text-warning"
                  subtitle="Last 7 days"
                />
                <MetricCard
                  label="Calls This Week"
                  value={String(kpis.callsWeek)}
                  icon={Mic}
                  iconColor="text-primary"
                  subtitle="Recorded & analyzed"
                  className="col-span-2 lg:col-span-1"
                />
              </div>

              {/* Recordings Table */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      Recent Recordings
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() => navigate('/recordings')}
                    >
                      Full Library <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RecordingsTable />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === REVENUE TAB === */}
            <TabsContent value="revenue" className="space-y-4 sm:space-y-6 mt-0">
              <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Total Revenue"
                  value="$301K"
                  icon={DollarSign}
                  iconColor="text-success"
                  progress={{ current: 301000, goal: 500000, label: '60% of annual goal' }}
                  trend={{ value: 12.5, direction: 'up' }}
                />
                <MetricCard
                  label="Pipeline"
                  value="$2.1M"
                  icon={BarChart3}
                  iconColor="text-primary"
                  subtitle="47 open deals"
                  trend={{ value: 5.8, direction: 'up' }}
                />
                <MetricCard
                  label="Win Rate"
                  value="68%"
                  icon={Target}
                  iconColor="text-warning"
                  subtitle="24 Won / 11 Lost"
                  trend={{ value: 3, direction: 'up' }}
                  className="col-span-2 lg:col-span-1"
                />
              </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <RevenueTrendChart data={[
                    { month: 'Jul', revenue: 35000, target: 50000 },
                    { month: 'Aug', revenue: 42000, target: 50000 },
                    { month: 'Sep', revenue: 58000, target: 60000 },
                    { month: 'Oct', revenue: 72000, target: 70000 },
                    { month: 'Nov', revenue: 89000, target: 85000 },
                    { month: 'Dec', revenue: 95000, target: 90000 },
                    { month: 'Jan', revenue: 45000, target: 100000 },
                  ]} goal={100000} />
                </div>
                <Card className="lg:col-span-2 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Priority Deals
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => navigate('/enterprise')}
                      >
                        View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Enterprise License', company: 'Acme Corp', value: 125000, stage: 'Proposal', health: 'at_risk' as const, alert: 'No contact in 8 days', nextAction: 'Schedule follow-up call' },
                      { name: 'Platform Migration', company: 'TechStart Inc', value: 89000, stage: 'Qualification', health: 'on_track' as const, nextAction: 'Send proposal deck' },
                      { name: 'Annual Renewal', company: 'Global Systems', value: 67000, stage: 'Negotiation', health: 'monitor' as const, alert: 'Competitor mentioned', nextAction: 'Prepare competitive analysis' },
                    ].map((deal, i) => (
                      <DealPriorityCard
                        key={i}
                        {...deal}
                        onClick={() => navigate('/enterprise')}
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
