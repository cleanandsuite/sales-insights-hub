import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, ArrowUpDown, Users, Trash2 } from 'lucide-react';
import { LeadDetailPopup } from './LeadDetailPopup';
import { format } from 'date-fns';

export interface ImportedLead {
  id: string;
  user_id: string;
  contact_name: string;
  business: string | null;
  location: string | null;
  previous_rep: string | null;
  contact_date: string | null;
  contact_time: string | null;
  lead_type: string | null;
  pain_point: string | null;
  notes: string | null;
  created_at: string;
}

const TYPE_STYLES: Record<string, string> = {
  hot: 'bg-red-500/15 text-red-700 border-red-200',
  warm: 'bg-orange-500/15 text-orange-700 border-orange-200',
  cold: 'bg-blue-500/15 text-blue-700 border-blue-200',
};

type SortKey = 'contact_name' | 'business' | 'contact_date' | 'created_at';

interface ImportedLeadsTableProps {
  refreshKey: number;
}

export function ImportedLeadsTable({ refreshKey }: ImportedLeadsTableProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<ImportedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ImportedLead | null>(null);

  const fetchLeads = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('imported_leads' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load imported leads');
    } else {
      setLeads((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [user, refreshKey]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('imported_leads' as any).delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete lead');
    } else {
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead deleted');
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = leads
    .filter(l => {
      const matchSearch = l.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        (l.business?.toLowerCase().includes(search.toLowerCase()));
      const matchType = typeFilter === 'all' || l.lead_type === typeFilter;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      const valA = (a as any)[sortKey] || '';
      const valB = (b as any)[sortKey] || '';
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <Button variant="ghost" size="sm" className="gap-1 -ml-2 h-auto p-1 font-medium" onClick={() => toggleSort(field)}>
      {label}
      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search imported leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Lead Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hot">🔥 Hot</SelectItem>
            <SelectItem value="warm">🟠 Warm</SelectItem>
            <SelectItem value="cold">🔵 Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No imported leads</h3>
          <p className="text-sm text-muted-foreground">
            {leads.length === 0 ? 'Import leads using the Import button above' : 'No leads match your filters'}
          </p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead><SortHeader label="Name" field="contact_name" /></TableHead>
                <TableHead><SortHeader label="Business" field="business" /></TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Previous Rep</TableHead>
                <TableHead><SortHeader label="Date" field="contact_date" /></TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lead => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell className="font-semibold">{lead.contact_name}</TableCell>
                  <TableCell>{lead.business || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{lead.location || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.previous_rep || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.contact_date ? format(new Date(lead.contact_date), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.contact_time || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TYPE_STYLES[lead.lead_type || 'warm']}>
                      {lead.lead_type || 'warm'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(lead.id, e)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedLead && (
        <LeadDetailPopup
          lead={selectedLead}
          open={!!selectedLead}
          onOpenChange={(open) => { if (!open) setSelectedLead(null); }}
          onLeadUpdated={fetchLeads}
        />
      )}
    </div>
  );
}
