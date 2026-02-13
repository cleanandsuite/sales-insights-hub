import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const EXPORTABLE_TABLES = [
  { id: 'profiles', label: 'Profiles', description: 'Your profile information' },
  { id: 'call_recordings', label: 'Call Recordings', description: 'Your recorded calls and transcripts' },
  { id: 'leads', label: 'Leads', description: 'Lead information and AI insights' },
  { id: 'coaching_sessions', label: 'Coaching Sessions', description: 'AI coaching analysis results' },
  { id: 'call_summaries', label: 'Call Summaries', description: 'Generated call summaries' },
  { id: 'scheduled_calls', label: 'Scheduled Calls', description: 'Your scheduled meetings' },
  { id: 'teams', label: 'Teams', description: 'Your teams' },
  { id: 'team_members', label: 'Team Members', description: 'Team membership data' },
  { id: 'user_settings', label: 'Settings', description: 'Your app settings' },
  { id: 'crm_connections', label: 'CRM Connections', description: 'Your CRM integrations' },
  { id: 'crm_contacts', label: 'CRM Contacts', description: 'Synced CRM contacts' },
] as const;

type TableId = typeof EXPORTABLE_TABLES[number]['id'];

export function DataExportTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTables, setSelectedTables] = useState<TableId[]>([]);
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

  const fetchTableData = async (tableId: string) => {
    if (!user) return null;

    // Use type assertion to handle dynamic table names
    const { data, error } = await supabase
      .from(tableId as 'profiles')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error fetching ${tableId}:`, error);
      return null;
    }

    return data as Record<string, unknown>[] | null;
  };

  // Format date/timestamp columns as YYYY-MM-DD HH:MM:SS
  const formatDateValue = (value: string): string => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return value;
    }
  };

  // Check if value looks like a date/timestamp
  const isDateValue = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    // ISO date pattern or common timestamp patterns
    return /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/.test(value);
  };

  // Format a single cell value for CSV
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    
    // Handle dates/timestamps - format as YYYY-MM-DD HH:MM:SS
    if (isDateValue(value)) {
      return formatDateValue(value as string);
    }
    
    // Handle objects/arrays - stringify without formatting
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // UUIDs and other strings - return as plain text
    return String(value);
  };

  // Escape CSV value properly
  const escapeCSVValue = (value: string): string => {
    // If contains comma, newline, or double quote, wrap in quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Convert data array to CSV string with UTF-8 encoding
  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Add header row
    csvRows.push(headers.map(h => escapeCSVValue(h)).join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const rawValue = row[header];
        const formattedValue = formatCellValue(rawValue);
        return escapeCSVValue(formattedValue);
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  // Download ZIP file
  const downloadZip = async (zip: JSZip, filename: string) => {
    const content = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    const url = URL.createObjectURL(content);
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
      const zip = new JSZip();
      let filesAdded = 0;
      
      for (const tableId of selectedTables) {
        const data = await fetchTableData(tableId);
        
        if (data && data.length > 0) {
          // Add UTF-8 BOM for proper encoding in Excel
          const bom = '\uFEFF';
          const csvContent = bom + convertToCSV(data);
          zip.file(`${tableId}.csv`, csvContent);
          filesAdded++;
        } else {
          // Create empty CSV with just headers if no data
          // For empty tables, we'll skip or add an empty file
          zip.file(`${tableId}.csv`, '\uFEFF');
        }
        
        setExportedTables(prev => [...prev, tableId]);
      }

      if (filesAdded === 0) {
        toast({
          variant: 'destructive',
          title: 'No data to export',
          description: 'The selected tables have no data'
        });
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      await downloadZip(zip, `data-backup-${timestamp}.zip`);

      toast({
        title: 'Export complete',
        description: `${filesAdded} CSV file(s) exported in ZIP archive`
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
          Download your data as CSV files in a ZIP archive for manual backups
        </p>
      </div>

      {/* Export Format Info */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Export format:</strong> One CSV file per table • UTF-8 encoded • 
          Dates formatted as YYYY-MM-DD HH:MM:SS • Pure data only
        </p>
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
              Export {selectedTables.length > 0 ? `${selectedTables.length} Table(s) as ZIP` : 'Data'}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Your data will be downloaded as a ZIP file containing individual CSV files.
        </p>
      </div>
    </div>
  );
}
