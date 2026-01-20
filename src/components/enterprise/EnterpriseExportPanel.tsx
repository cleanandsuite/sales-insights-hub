import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { 
  Download, FileSpreadsheet, FileText, Calendar, Users, TrendingUp, AlertTriangle
} from 'lucide-react';

interface ExportOptions {
  includeKpis: boolean;
  includeRepPerformance: boolean;
  includeAlerts: boolean;
  includeCoachingHistory: boolean;
  includePredictions: boolean;
  dateRange: '7d' | '30d' | '90d' | 'all';
  format: 'csv' | 'json';
}

interface EnterpriseExportPanelProps {
  teamId: string;
  kpis: any;
}

export function EnterpriseExportPanel({ teamId, kpis }: EnterpriseExportPanelProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeKpis: true,
    includeRepPerformance: true,
    includeAlerts: true,
    includeCoachingHistory: true,
    includePredictions: true,
    dateRange: '30d',
    format: 'csv'
  });
  const [exporting, setExporting] = useState(false);

  const getDateFilter = () => {
    const now = new Date();
    switch (options.dateRange) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default: return null;
    }
  };

  const convertToCSV = (data: any[], headers?: string[]) => {
    if (!data.length) return '';
    
    const keys = headers || Object.keys(data[0]);
    const headerRow = keys.join(',');
    const rows = data.map(item => 
      keys.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    );
    
    return [headerRow, ...rows].join('\n');
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      const dateFilter = getDateFilter();
      const isCSV = options.format === 'csv';

      // Export KPIs
      if (options.includeKpis && kpis) {
        const kpiData = {
          exportedAt: new Date().toISOString(),
          teamId,
          dateRange: options.dateRange,
          metrics: {
            teamWinRate: kpis.teamWinRate,
            avgCallsPerRep: kpis.avgCallsPerRep,
            coachingCoverage: kpis.coachingCoveragePct,
            avgDiscoveryScore: kpis.avgDiscoveryScore,
            avgCloserScore: kpis.avgCloserScore,
            forecastRisk: kpis.forecastRiskPct,
            totalReps: kpis.totalReps
          }
        };

        if (isCSV) {
          const csvContent = `Team KPIs Report\nExported: ${timestamp}\n\nMetric,Value\nTeam Win Rate,${kpis.teamWinRate}%\nCalls/Rep/Week,${kpis.avgCallsPerRep}\nCoaching Coverage,${kpis.coachingCoveragePct}%\nAvg Discovery Score,${kpis.avgDiscoveryScore}\nAvg Closer Score,${kpis.avgCloserScore}\nForecast Risk,${kpis.forecastRiskPct}%\nTotal Reps,${kpis.totalReps}`;
          zip.file('kpis.csv', '\uFEFF' + csvContent);
        } else {
          zip.file('kpis.json', JSON.stringify(kpiData, null, 2));
        }
      }

      // Export Rep Performance
      if (options.includeRepPerformance) {
        const { data: repData } = await supabase
          .from('manager_team_stats')
          .select('*')
          .eq('team_id', teamId);

        if (repData && repData.length > 0) {
          if (isCSV) {
            const headers = ['full_name', 'total_calls', 'avg_overall_score', 'avg_closing_score', 'avg_discovery_score', 'win_rate', 'active_leads'];
            zip.file('rep_performance.csv', '\uFEFF' + convertToCSV(repData, headers));
          } else {
            zip.file('rep_performance.json', JSON.stringify(repData, null, 2));
          }
        }
      }

      // Export Alerts
      if (options.includeAlerts) {
        let alertsQuery = supabase
          .from('risk_alerts')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });

        if (dateFilter) {
          alertsQuery = alertsQuery.gte('created_at', dateFilter);
        }

        const { data: alertsData } = await alertsQuery;

        if (alertsData && alertsData.length > 0) {
          if (isCSV) {
            const headers = ['title', 'alert_type', 'severity', 'description', 'is_resolved', 'created_at'];
            zip.file('risk_alerts.csv', '\uFEFF' + convertToCSV(alertsData, headers));
          } else {
            zip.file('risk_alerts.json', JSON.stringify(alertsData, null, 2));
          }
        }
      }

      // Export Coaching History
      if (options.includeCoachingHistory) {
        let coachingQuery = supabase
          .from('coaching_assignments')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });

        if (dateFilter) {
          coachingQuery = coachingQuery.gte('created_at', dateFilter);
        }

        const { data: coachingData } = await coachingQuery;

        if (coachingData && coachingData.length > 0) {
          if (isCSV) {
            const headers = ['coaching_type', 'priority', 'status', 'reason', 'notes', 'created_at', 'completed_at'];
            zip.file('coaching_history.csv', '\uFEFF' + convertToCSV(coachingData, headers));
          } else {
            zip.file('coaching_history.json', JSON.stringify(coachingData, null, 2));
          }
        }
      }

      // Export Predictions summary
      if (options.includePredictions) {
        const predictionsData = {
          exportedAt: new Date().toISOString(),
          teamId,
          note: 'Predictions are generated in real-time based on historical trends',
          baseMetrics: kpis ? {
            currentWinRate: kpis.teamWinRate,
            currentCoachingCoverage: kpis.coachingCoveragePct,
            currentForecastRisk: kpis.forecastRiskPct
          } : null
        };

        if (isCSV) {
          const csvContent = `AI Predictions Summary\nExported: ${timestamp}\n\nNote: Predictions are generated in real-time based on historical trends\n\nBase Metrics\nCurrent Win Rate,${kpis?.teamWinRate || 0}%\nCurrent Coaching Coverage,${kpis?.coachingCoveragePct || 0}%\nCurrent Forecast Risk,${kpis?.forecastRiskPct || 0}%`;
          zip.file('predictions_summary.csv', '\uFEFF' + csvContent);
        } else {
          zip.file('predictions_summary.json', JSON.stringify(predictionsData, null, 2));
        }
      }

      // Generate and download zip
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-intelligence-export-${timestamp}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Export complete');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="card-enterprise">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Export Data</CardTitle>
        </div>
        <CardDescription>Download comprehensive reports for your team</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Include in Export</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="kpis" 
                checked={options.includeKpis}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeKpis: !!checked }))}
              />
              <Label htmlFor="kpis" className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Team KPIs
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rep-performance" 
                checked={options.includeRepPerformance}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeRepPerformance: !!checked }))}
              />
              <Label htmlFor="rep-performance" className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Rep Performance
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="alerts" 
                checked={options.includeAlerts}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeAlerts: !!checked }))}
              />
              <Label htmlFor="alerts" className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Risk Alerts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="coaching" 
                checked={options.includeCoachingHistory}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeCoachingHistory: !!checked }))}
              />
              <Label htmlFor="coaching" className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Coaching History
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="predictions" 
                checked={options.includePredictions}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includePredictions: !!checked }))}
              />
              <Label htmlFor="predictions" className="text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                AI Predictions
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Options */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-sm">Date Range</Label>
            <Select 
              value={options.dateRange}
              onValueChange={(v: any) => setOptions(prev => ({ ...prev, dateRange: v }))}
            >
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label className="text-sm">Format</Label>
            <Select 
              value={options.format}
              onValueChange={(v: any) => setOptions(prev => ({ ...prev, format: v }))}
            >
              <SelectTrigger>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={exporting || (!options.includeKpis && !options.includeRepPerformance && !options.includeAlerts && !options.includeCoachingHistory && !options.includePredictions)}
          className="w-full gap-2"
        >
          {exporting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Export
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
