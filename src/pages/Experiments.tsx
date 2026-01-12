import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { toast } from 'sonner';
import { Loader2, Plus, Play, Pause, CheckCircle, BarChart3, Download, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Navigate } from 'react-router-dom';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: string;
  traffic_percentage: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

interface Variant {
  id: string;
  experiment_id: string;
  name: string;
  weight: number;
  is_control: boolean;
}

interface ExperimentStats {
  variant_id: string;
  variant_name: string;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  revenue_cents: number;
  avg_revenue: number;
}

// Chi-squared calculation for statistical significance
function calculateChiSquared(observed: number[], expected: number[]): number {
  return observed.reduce((sum, obs, i) => {
    const exp = expected[i];
    if (exp === 0) return sum;
    return sum + Math.pow(obs - exp, 2) / exp;
  }, 0);
}

function getSignificanceLevel(chiSquared: number, df: number = 1): string {
  // Critical values for chi-squared distribution with 1 df
  if (chiSquared >= 10.83) return '99.9%';
  if (chiSquared >= 6.63) return '99%';
  if (chiSquared >= 3.84) return '95%';
  if (chiSquared >= 2.71) return '90%';
  return 'Not significant';
}

export default function Experiments() {
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [stats, setStats] = useState<ExperimentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    traffic_percentage: 100,
    variants: [
      { name: 'Control', weight: 50, is_control: true },
      { name: 'Variant A', weight: 50, is_control: false },
    ],
  });

  useEffect(() => {
    if (isAdmin) {
      fetchExperiments();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedExperiment) {
      fetchVariants(selectedExperiment.id);
      fetchStats(selectedExperiment.id);
    }
  }, [selectedExperiment]);

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperiments(data || []);
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
      toast.error('Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (experimentId: string) => {
    const { data, error } = await supabase
      .from('experiment_variants')
      .select('*')
      .eq('experiment_id', experimentId);

    if (!error) setVariants(data || []);
  };

  const fetchStats = async (experimentId: string) => {
    try {
      // Get assignments count per variant
      const { data: assignments } = await supabase
        .from('experiment_assignments')
        .select('variant_id')
        .eq('experiment_id', experimentId);

      // Get events per variant
      const { data: events } = await supabase
        .from('experiment_events')
        .select('variant_id, event_type, revenue_cents')
        .eq('experiment_id', experimentId);

      // Get variants
      const { data: variantsData } = await supabase
        .from('experiment_variants')
        .select('id, name')
        .eq('experiment_id', experimentId);

      if (!variantsData) return;

      const statsMap = new Map<string, ExperimentStats>();
      
      variantsData.forEach(v => {
        statsMap.set(v.id, {
          variant_id: v.id,
          variant_name: v.name,
          visitors: 0,
          conversions: 0,
          conversion_rate: 0,
          revenue_cents: 0,
          avg_revenue: 0,
        });
      });

      // Count visitors
      assignments?.forEach(a => {
        const stat = statsMap.get(a.variant_id);
        if (stat) stat.visitors++;
      });

      // Count conversions and revenue
      events?.forEach(e => {
        const stat = statsMap.get(e.variant_id);
        if (stat) {
          if (e.event_type === 'conversion') {
            stat.conversions++;
            if (e.revenue_cents) {
              stat.revenue_cents += e.revenue_cents;
            }
          }
        }
      });

      // Calculate rates
      statsMap.forEach(stat => {
        stat.conversion_rate = stat.visitors > 0 ? (stat.conversions / stat.visitors) * 100 : 0;
        stat.avg_revenue = stat.conversions > 0 ? stat.revenue_cents / stat.conversions : 0;
      });

      setStats(Array.from(statsMap.values()));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const createExperiment = async () => {
    try {
      const { data: exp, error: expError } = await supabase
        .from('experiments')
        .insert({
          name: newExperiment.name,
          description: newExperiment.description,
          traffic_percentage: newExperiment.traffic_percentage,
          status: 'draft',
        })
        .select()
        .single();

      if (expError) throw expError;

      // Create variants
      const variantsToInsert = newExperiment.variants.map(v => ({
        experiment_id: exp.id,
        name: v.name,
        weight: v.weight,
        is_control: v.is_control,
      }));

      const { error: varError } = await supabase
        .from('experiment_variants')
        .insert(variantsToInsert);

      if (varError) throw varError;

      toast.success('Experiment created successfully');
      setCreateDialogOpen(false);
      fetchExperiments();
      setNewExperiment({
        name: '',
        description: '',
        traffic_percentage: 100,
        variants: [
          { name: 'Control', weight: 50, is_control: true },
          { name: 'Variant A', weight: 50, is_control: false },
        ],
      });
    } catch (err) {
      console.error('Failed to create experiment:', err);
      toast.error('Failed to create experiment');
    }
  };

  const updateExperimentStatus = async (id: string, status: string) => {
    try {
      const updateData: Record<string, unknown> = { status };
      if (status === 'running') updateData.started_at = new Date().toISOString();
      if (status === 'completed') updateData.ended_at = new Date().toISOString();

      const { error } = await supabase
        .from('experiments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      toast.success(`Experiment ${status}`);
      fetchExperiments();
    } catch (err) {
      toast.error('Failed to update experiment');
    }
  };

  const exportCSV = () => {
    if (!stats.length) return;
    
    const headers = ['Variant', 'Visitors', 'Conversions', 'Conversion Rate', 'Revenue', 'Avg Revenue'];
    const rows = stats.map(s => [
      s.variant_name,
      s.visitors,
      s.conversions,
      `${s.conversion_rate.toFixed(2)}%`,
      `$${(s.revenue_cents / 100).toFixed(2)}`,
      `$${(s.avg_revenue / 100).toFixed(2)}`,
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${selectedExperiment?.name}_results.csv`;
    a.click();
  };

  if (adminLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Calculate significance
  const getSignificance = (): string => {
    if (stats.length < 2) return 'Not enough data';
    const totalVisitors = stats.reduce((sum, s) => sum + s.visitors, 0);
    const totalConversions = stats.reduce((sum, s) => sum + s.conversions, 0);
    
    if (totalVisitors === 0) return 'No visitors yet';
    
    const expectedRate = totalConversions / totalVisitors;
    const observed = stats.map(s => s.conversions);
    const expected = stats.map(s => s.visitors * expectedRate);
    
    const chiSquared = calculateChiSquared(observed, expected);
    return getSignificanceLevel(chiSquared, stats.length - 1);
  };

  const chartData = stats.map(s => ({
    name: s.variant_name,
    'Conversion Rate': parseFloat(s.conversion_rate.toFixed(2)),
    'Avg Revenue': parseFloat((s.avg_revenue / 100).toFixed(2)),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">A/B Experiments</h1>
            <p className="text-muted-foreground">Manage and analyze your experiments</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Experiment</DialogTitle>
                <DialogDescription>Set up a new A/B test</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={newExperiment.name}
                    onChange={e => setNewExperiment({...newExperiment, name: e.target.value})}
                    placeholder="e.g., Hero CTA Test"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input 
                    value={newExperiment.description}
                    onChange={e => setNewExperiment({...newExperiment, description: e.target.value})}
                    placeholder="What are you testing?"
                  />
                </div>
                <div>
                  <Label>Traffic %</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={100}
                    value={newExperiment.traffic_percentage}
                    onChange={e => setNewExperiment({...newExperiment, traffic_percentage: parseInt(e.target.value) || 100})}
                  />
                </div>
                <div>
                  <Label>Variants</Label>
                  {newExperiment.variants.map((v, i) => (
                    <div key={i} className="flex gap-2 mt-2">
                      <Input 
                        value={v.name}
                        onChange={e => {
                          const variants = [...newExperiment.variants];
                          variants[i].name = e.target.value;
                          setNewExperiment({...newExperiment, variants});
                        }}
                        placeholder="Variant name"
                      />
                      <Input 
                        type="number"
                        className="w-20"
                        value={v.weight}
                        onChange={e => {
                          const variants = [...newExperiment.variants];
                          variants[i].weight = parseInt(e.target.value) || 0;
                          setNewExperiment({...newExperiment, variants});
                        }}
                        placeholder="Weight"
                      />
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setNewExperiment({
                      ...newExperiment, 
                      variants: [...newExperiment.variants, { name: '', weight: 50, is_control: false }]
                    })}
                  >
                    Add Variant
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={createExperiment} disabled={!newExperiment.name}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Experiments List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : experiments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No experiments yet</p>
              ) : (
                <div className="space-y-2">
                  {experiments.map(exp => (
                    <div
                      key={exp.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedExperiment?.id === exp.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedExperiment(exp)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{exp.name}</span>
                        <Badge variant={
                          exp.status === 'running' ? 'default' :
                          exp.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {exp.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experiment Details */}
          <Card className="lg:col-span-2">
            {selectedExperiment ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedExperiment.name}</CardTitle>
                      <CardDescription>{selectedExperiment.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {selectedExperiment.status === 'draft' && (
                        <Button size="sm" onClick={() => updateExperimentStatus(selectedExperiment.id, 'running')}>
                          <Play className="h-4 w-4 mr-1" /> Start
                        </Button>
                      )}
                      {selectedExperiment.status === 'running' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateExperimentStatus(selectedExperiment.id, 'paused')}>
                            <Pause className="h-4 w-4 mr-1" /> Pause
                          </Button>
                          <Button size="sm" onClick={() => updateExperimentStatus(selectedExperiment.id, 'completed')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Complete
                          </Button>
                        </>
                      )}
                      {selectedExperiment.status === 'paused' && (
                        <Button size="sm" onClick={() => updateExperimentStatus(selectedExperiment.id, 'running')}>
                          <Play className="h-4 w-4 mr-1" /> Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="results">
                    <TabsList>
                      <TabsTrigger value="results">Results</TabsTrigger>
                      <TabsTrigger value="variants">Variants</TabsTrigger>
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    </TabsList>

                    <TabsContent value="results" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Significance: </span>
                            <Badge variant={getSignificance().includes('%') ? 'default' : 'outline'}>
                              {getSignificance()}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportCSV}>
                          <Download className="h-4 w-4 mr-1" /> Export CSV
                        </Button>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead className="text-right">Visitors</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.map(s => (
                            <TableRow key={s.variant_id}>
                              <TableCell className="font-medium">{s.variant_name}</TableCell>
                              <TableCell className="text-right">{s.visitors}</TableCell>
                              <TableCell className="text-right">{s.conversions}</TableCell>
                              <TableCell className="text-right">{s.conversion_rate.toFixed(2)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {chartData.length > 0 && (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Conversion Rate" fill="hsl(var(--primary))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="variants">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Weight</TableHead>
                            <TableHead className="text-right">Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variants.map(v => (
                            <TableRow key={v.id}>
                              <TableCell className="font-medium">{v.name}</TableCell>
                              <TableCell className="text-right">{v.weight}%</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={v.is_control ? 'outline' : 'default'}>
                                  {v.is_control ? 'Control' : 'Test'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="revenue" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {stats.map(s => (
                          <Card key={s.variant_id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{s.variant_name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">
                                  ${(s.revenue_cents / 100).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Avg: ${(s.avg_revenue / 100).toFixed(2)} per conversion
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {chartData.length > 0 && (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Avg Revenue" fill="hsl(var(--chart-2))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select an experiment to view details</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
