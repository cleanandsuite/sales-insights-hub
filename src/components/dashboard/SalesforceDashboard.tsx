import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, TrendingUp, Target, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SalesforceStats {
  totalLeads: number;
  syncedRecordings: number;
  recentConversions: number;
  averageScore: number;
}

interface Lead {
  id: string;
  contact_name: string;
  company: string | null;
  title: string | null;
  lead_status: string;
  ai_confidence: number | null;
  primary_pain_point: string | null;
  salesforce_lead_id?: string;
}

export function SalesforceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SalesforceStats>({
    totalLeads: 0,
    syncedRecordings: 0,
    recentConversions: 0,
    averageScore: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Get leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Get synced recordings
      const { data: recordings } = await supabase
        .from('call_recordings')
        .select('*')
        .eq('user_id', user.id)
        .eq('crm_sync_status', 'synced');

      const leadsList = leads || [];
      
      setStats({
        totalLeads: leadsList.length,
        syncedRecordings: recordings?.length || 0,
        recentConversions: leadsList.filter(l => l.lead_status === 'converted').length,
        averageScore: leadsList.length > 0 
          ? leadsList.reduce((acc, l) => acc + (l.ai_confidence || 0), 0) / leadsList.length
          : 0
      });

      setRecentLeads(leadsList.slice(0, 5) as Lead[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSalesforce = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('salesforce-sync', {
        body: { action: 'sync_contacts', userId: user?.id }
      });

      if (error) throw error;

      toast({
        title: 'Sync initiated',
        description: 'Salesforce sync has been started.',
      });

      setTimeout(loadDashboardData, 2000);
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const getLeadStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'qualified':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Salesforce Dashboard</h2>
          <p className="text-muted-foreground">
            AI-generated leads synchronized with your Salesforce CRM
          </p>
        </div>
        <Button onClick={handleSyncSalesforce} disabled={syncing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync with Salesforce
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">AI-generated from calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Synced to CRM</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.syncedRecordings}</div>
            <p className="text-xs text-muted-foreground">Recordings with Salesforce links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">AI lead quality score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentConversions}</div>
            <p className="text-xs text-muted-foreground">Leads converted to opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI-Generated Leads</CardTitle>
          <CardDescription>Leads detected from your recent sales calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.contact_name}</span>
                    <Badge variant={getLeadStatusVariant(lead.lead_status)}>
                      {lead.lead_status}
                    </Badge>
                    {lead.ai_confidence && (
                      <Badge variant="outline">
                        {lead.ai_confidence.toFixed(0)}% Confidence
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lead.company} • {lead.title || 'No title'}
                  </p>
                  {lead.primary_pain_point && (
                    <p className="text-sm text-muted-foreground">{lead.primary_pain_point}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {lead.salesforce_lead_id && (
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View in Salesforce
                    </Button>
                  )}
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No leads generated yet. Start recording calls to generate leads automatically.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Salesforce Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="font-medium">Auto-sync</p>
                <p className="text-sm text-muted-foreground">
                  Automatically sync qualified leads to Salesforce
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="font-medium">Last Sync</p>
                <p className="text-sm text-muted-foreground">15 minutes ago</p>
              </div>
              <Button variant="ghost" size="sm">View Sync Logs</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
