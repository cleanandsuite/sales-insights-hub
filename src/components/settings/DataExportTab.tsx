import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileJson, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const EXPORTABLE_TABLES = [
  { id: 'call_recordings', label: 'Call Recordings', description: 'Your recorded calls and transcripts' },
  { id: 'leads', label: 'Leads', description: 'Lead information and AI insights' },
  { id: 'coaching_sessions', label: 'Coaching Sessions', description: 'AI coaching analysis results' },
  { id: 'call_summaries', label: 'Call Summaries', description: 'Generated call summaries' },
  { id: 'scheduled_calls', label: 'Scheduled Calls', description: 'Your scheduled meetings' },
  { id: 'profiles', label: 'Profile', description: 'Your profile information' },
  { id: 'user_settings', label: 'Settings', description: 'Your app settings' },
] as const;

type TableId = typeof EXPORTABLE_TABLES[number]['id'];

export function DataExportTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTables, setSelectedTables] = useState<TableId[]>([]);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);
  const [exportedTables, setExportedTables] = useState<TableId[]>([]);

  const toggleTable = (tableId: TableId) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(t => t !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAll = () => {
    if (selectedTables.length === EXPORTABLE_TABLES.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(EXPORTABLE_TABLES.map(t => t.id));
    }
  };

  const fetchTableData = async (tableId: TableId) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from(tableId)
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error fetching ${tableId}:`, error);
      return null;
    }

    return data;
  };

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return String(value);
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!user || selectedTables.length === 0) return;

    setExporting(true);
    setExportedTables([]);

    try {
      const exportData: Record<string, unknown[]> = {};
      
      for (const tableId of selectedTables) {
        const data = await fetchTableData(tableId);
        if (data) {
          exportData[tableId] = data;
          setExportedTables(prev => [...prev, tableId]);
        }
      }

      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        const content = JSON.stringify(exportData, null, 2);
        downloadFile(content, `backup-${timestamp}.json`, 'application/json');
      } else {
        // For CSV, create a zip-like approach by downloading each table separately
        // or combine into one file with table markers
        let combinedCSV = '';
        for (const [tableId, data] of Object.entries(exportData)) {
          if (data.length > 0) {
            combinedCSV += `\n--- ${tableId.toUpperCase()} ---\n`;
            combinedCSV += convertToCSV(data as Record<string, unknown>[]);
            combinedCSV += '\n';
          }
        }
        downloadFile(combinedCSV, `backup-${timestamp}.csv`, 'text/csv');
      }

      toast({
        title: 'Export complete',
        description: `${selectedTables.length} table(s) exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'There was an error exporting your data'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="card-gradient rounded-xl border border-border/50 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Data Export</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Download your data as JSON or CSV files for manual backups
        </p>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <Label>Export Format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as 'json' | 'csv')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                JSON
              </div>
            </SelectItem>
            <SelectItem value="csv">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Select Tables to Export</Label>
          <Button variant="ghost" size="sm" onClick={selectAll}>
            {selectedTables.length === EXPORTABLE_TABLES.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXPORTABLE_TABLES.map((table) => (
            <div
              key={table.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedTables.includes(table.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleTable(table.id)}
            >
              <Checkbox
                checked={selectedTables.includes(table.id)}
                onCheckedChange={() => toggleTable(table.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{table.label}</span>
                  {exportedTables.includes(table.id) && exporting && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{table.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="pt-4 border-t border-border/50">
        <Button
          onClick={handleExport}
          disabled={selectedTables.length === 0 || exporting}
          className="gap-2"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export {selectedTables.length > 0 ? `${selectedTables.length} Table(s)` : 'Data'}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Your data will be downloaded to your device. Store backups securely.
        </p>
      </div>
    </div>
  );
}
