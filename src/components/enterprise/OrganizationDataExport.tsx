import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Users, BarChart3, Shield, Calendar as CalendarIcon, FileJson, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ExportType = 'users' | 'analytics' | 'audit';
type ExportFormat = 'csv' | 'json';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function OrganizationDataExport() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [completed, setCompleted] = useState<ExportType | null>(null);

  const handleExport = async (type: ExportType) => {
    setExporting(type);
    setCompleted(null);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setExporting(null);
    setCompleted(type);
    
    toast({
      title: "Export Complete",
      description: `Your ${type} data has been exported successfully.`,
    });
    
    // Reset completed state after 3 seconds
    setTimeout(() => setCompleted(null), 3000);
  };

  const exportOptions = [
    {
      type: 'users' as ExportType,
      icon: Users,
      title: 'Export Users',
      description: 'All team members, roles, and status',
      color: 'cyan',
    },
    {
      type: 'analytics' as ExportType,
      icon: BarChart3,
      title: 'Export Call Analytics',
      description: 'Call metrics, scores, and trends',
      color: 'purple',
    },
    {
      type: 'audit' as ExportType,
      icon: Shield,
      title: 'Export Audit Logs',
      description: 'Security and compliance events',
      color: 'amber',
    },
  ];

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-2xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
            <Download className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Data Export</CardTitle>
            <CardDescription>Export your organization's data for reporting and compliance</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Date Range & Format Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              Date Range
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-muted/30 border-white/[0.08] hover:bg-muted/50",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-xl border-white/[0.1]" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              {exportFormat === 'csv' ? <FileSpreadsheet className="h-3.5 w-3.5" /> : <FileJson className="h-3.5 w-3.5" />}
              Export Format
            </Label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
              <SelectTrigger className="bg-muted/30 border-white/[0.08]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-white/[0.1]">
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON (API Compatible)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportOptions.map((option) => {
            const isExporting = exporting === option.type;
            const isCompleted = completed === option.type;
            const Icon = option.icon;
            
            return (
              <button
                key={option.type}
                onClick={() => handleExport(option.type)}
                disabled={isExporting}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all duration-300 group/export",
                  "bg-gradient-to-br from-white/[0.03] to-transparent",
                  "hover:from-white/[0.06] hover:to-transparent",
                  "hover:scale-[1.02] hover:shadow-lg",
                  option.color === 'cyan' && "border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/10",
                  option.color === 'purple' && "border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/10",
                  option.color === 'amber' && "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/10",
                  isExporting && "opacity-75 cursor-wait",
                  isCompleted && "border-emerald-500/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    option.color === 'cyan' && "bg-cyan-500/10 text-cyan-400 group-hover/export:bg-cyan-500/20",
                    option.color === 'purple' && "bg-purple-500/10 text-purple-400 group-hover/export:bg-purple-500/20",
                    option.color === 'amber' && "bg-amber-500/10 text-amber-400 group-hover/export:bg-amber-500/20",
                    isCompleted && "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {isExporting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{option.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                  <Download className={cn(
                    "h-4 w-4 text-muted-foreground opacity-0 group-hover/export:opacity-100 transition-opacity",
                    isExporting && "opacity-0"
                  )} />
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Info Note */}
        <div className="p-3 rounded-lg bg-muted/20 border border-white/[0.05]">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Large exports may take a few minutes. 
            You'll receive an email notification when your export is ready for download.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
