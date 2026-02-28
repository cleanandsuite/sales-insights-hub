import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Plus, X, Check, AlertCircle } from 'lucide-react';

interface ImportedLead {
  contact_name: string;
  business: string;
  location: string;
  previous_rep: string;
  contact_date: string;
  contact_time: string;
  lead_type: 'hot' | 'warm' | 'cold';
}

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(current.trim());
      if (row.some(c => c.length > 0)) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some(c => c.length > 0)) rows.push(row);
  return rows;
}

const LEAD_TYPE_COLORS: Record<string, string> = {
  hot: 'bg-red-500/15 text-red-700 border-red-200',
  warm: 'bg-orange-500/15 text-orange-700 border-orange-200',
  cold: 'bg-blue-500/15 text-blue-700 border-blue-200',
};

export function ImportLeadsDialog({ open, onOpenChange, onImportComplete }: ImportLeadsDialogProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<string>('csv');
  const [dragOver, setDragOver] = useState(false);
  const [parsedLeads, setParsedLeads] = useState<ImportedLead[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');

  // Manual entry state
  const [manual, setManual] = useState<ImportedLead>({
    contact_name: '',
    business: '',
    location: '',
    previous_rep: '',
    contact_date: '',
    contact_time: '',
    lead_type: 'warm',
  });

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error('CSV file must have a header row and at least one data row');
        return;
      }
      const headers = rows[0].map(h => h.toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const bizIdx = headers.findIndex(h => h.includes('business') || h.includes('company'));
      const locIdx = headers.findIndex(h => h.includes('location') || h.includes('city'));
      const repIdx = headers.findIndex(h => h.includes('rep') || h.includes('representative'));
      const dateIdx = headers.findIndex(h => h.includes('date'));
      const timeIdx = headers.findIndex(h => h.includes('time'));
      const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('lead'));

      const leads: ImportedLead[] = rows.slice(1).map(row => {
        const rawType = (typeIdx >= 0 ? row[typeIdx] : '').toLowerCase().trim();
        const lead_type = (['hot', 'warm', 'cold'].includes(rawType) ? rawType : 'warm') as 'hot' | 'warm' | 'cold';
        return {
          contact_name: nameIdx >= 0 ? row[nameIdx] || '' : row[0] || '',
          business: bizIdx >= 0 ? row[bizIdx] || '' : '',
          location: locIdx >= 0 ? row[locIdx] || '' : '',
          previous_rep: repIdx >= 0 ? row[repIdx] || '' : '',
          contact_date: dateIdx >= 0 ? row[dateIdx] || '' : '',
          contact_time: timeIdx >= 0 ? row[timeIdx] || '' : '',
          lead_type,
        };
      }).filter(l => l.contact_name.length > 0);

      setParsedLeads(leads);
      toast.success(`Parsed ${leads.length} leads from CSV`);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImport = async () => {
    if (!user) return;
    const leadsToImport = tab === 'csv' ? parsedLeads : [manual];
    if (leadsToImport.length === 0 || (tab === 'manual' && !manual.contact_name.trim())) {
      toast.error('Please provide at least one lead with a name');
      return;
    }

    setImporting(true);
    const rows = leadsToImport.map(l => ({
      user_id: user.id,
      contact_name: l.contact_name.trim(),
      business: l.business || null,
      location: l.location || null,
      previous_rep: l.previous_rep || null,
      contact_date: l.contact_date || null,
      contact_time: l.contact_time || null,
      lead_type: l.lead_type,
    }));

    const { error } = await supabase.from('imported_leads' as any).insert(rows as any);
    setImporting(false);

    if (error) {
      toast.error('Import failed: ' + error.message);
    } else {
      toast.success(`${rows.length} lead(s) imported successfully`);
      setParsedLeads([]);
      setManual({ contact_name: '', business: '', location: '', previous_rep: '', contact_date: '', contact_time: '', lead_type: 'warm' });
      setFileName('');
      onImportComplete();
      onOpenChange(false);
    }
  };

  const removeParsedLead = (index: number) => {
    setParsedLeads(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5 text-primary" />
            Import Leads
          </DialogTitle>
          <DialogDescription>Upload a CSV file or add leads manually</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="csv" className="flex-1 gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4 mt-4">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <input id="csv-file-input" type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">Drop your CSV here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Columns: Name, Business, Location, Previous Rep, Date, Time, Lead Type
              </p>
              {fileName && (
                <Badge variant="secondary" className="mt-3">
                  <Check className="h-3 w-3 mr-1" /> {fileName}
                </Badge>
              )}
            </div>

            {/* Preview Table */}
            {parsedLeads.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{parsedLeads.length} leads ready to import</h4>
                  <Button variant="ghost" size="sm" onClick={() => { setParsedLeads([]); setFileName(''); }}>
                    Clear All
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedLeads.map((lead, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{lead.contact_name}</TableCell>
                          <TableCell>{lead.business || '—'}</TableCell>
                          <TableCell>{lead.location || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={LEAD_TYPE_COLORS[lead.lead_type]}>
                              {lead.lead_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeParsedLead(i)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="m-name">Contact Name *</Label>
                <Input id="m-name" value={manual.contact_name} onChange={e => setManual(p => ({ ...p, contact_name: e.target.value }))} placeholder="John Smith" />
              </div>
              <div>
                <Label htmlFor="m-biz">Business</Label>
                <Input id="m-biz" value={manual.business} onChange={e => setManual(p => ({ ...p, business: e.target.value }))} placeholder="Acme Corp" />
              </div>
              <div>
                <Label htmlFor="m-loc">Location</Label>
                <Input id="m-loc" value={manual.location} onChange={e => setManual(p => ({ ...p, location: e.target.value }))} placeholder="New York, NY" />
              </div>
              <div>
                <Label htmlFor="m-rep">Previous Rep</Label>
                <Input id="m-rep" value={manual.previous_rep} onChange={e => setManual(p => ({ ...p, previous_rep: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Lead Type</Label>
                <Select value={manual.lead_type} onValueChange={(v: any) => setManual(p => ({ ...p, lead_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">🔥 Hot</SelectItem>
                    <SelectItem value="warm">🟠 Warm</SelectItem>
                    <SelectItem value="cold">🔵 Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="m-date">Contact Date</Label>
                <Input id="m-date" type="date" value={manual.contact_date} onChange={e => setManual(p => ({ ...p, contact_date: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="m-time">Contact Time</Label>
                <Input id="m-time" type="time" value={manual.contact_time} onChange={e => setManual(p => ({ ...p, contact_time: e.target.value }))} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={importing || (tab === 'csv' && parsedLeads.length === 0) || (tab === 'manual' && !manual.contact_name.trim())}
            className="gap-2"
          >
            {importing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {importing ? 'Importing...' : `Import ${tab === 'csv' ? parsedLeads.length : 1} Lead(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
