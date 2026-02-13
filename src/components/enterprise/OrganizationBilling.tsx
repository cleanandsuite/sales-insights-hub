import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, FileText, TrendingUp, Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  pdfUrl: string;
}

interface BillingData {
  contractedSeats: number;
  usedSeats: number;
  customRate: number;
  defaultRate: number;
  nextBillingDate: string;
  paymentMethod: string;
  paymentLast4: string;
}

const mockInvoices: Invoice[] = [
  { id: 'INV-2026-001', date: '2026-01-01', amount: 3555, status: 'paid', pdfUrl: '#' },
  { id: 'INV-2025-012', date: '2025-12-01', amount: 3555, status: 'paid', pdfUrl: '#' },
  { id: 'INV-2025-011', date: '2025-11-01', amount: 3476, status: 'paid', pdfUrl: '#' },
  { id: 'INV-2025-010', date: '2025-10-01', amount: 3318, status: 'paid', pdfUrl: '#' },
  { id: 'INV-2025-009', date: '2025-09-01', amount: 3160, status: 'paid', pdfUrl: '#' },
];

const mockBilling: BillingData = {
  contractedSeats: 50,
  usedSeats: 45,
  customRate: 79,
  defaultRate: 99,
  nextBillingDate: '2026-02-01',
  paymentMethod: 'Visa',
  paymentLast4: '4242',
};

export function OrganizationBilling() {
  const [billing] = useState(mockBilling);
  const [invoices] = useState(mockInvoices);
  
  const seatUsagePercent = (billing.usedSeats / billing.contractedSeats) * 100;
  const monthlyEstimate = billing.usedSeats * billing.customRate;
  const savings = (billing.defaultRate - billing.customRate) * billing.usedSeats;

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Overdue</Badge>;
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-white/[0.08] shadow-2xl overflow-hidden group hover:bg-card/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
            <CreditCard className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground">Billing & Invoices</CardTitle>
            <CardDescription>Manage your subscription and view billing history</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Seat Usage Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Users className="h-3.5 w-3.5" />
              Contracted Seats
            </div>
            <p className="text-2xl font-bold text-foreground">{billing.contractedSeats}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Active Seats
            </div>
            <p className="text-2xl font-bold text-cyan-400">{billing.usedSeats}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08]">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <DollarSign className="h-3.5 w-3.5" />
              Per Seat Rate
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">${billing.customRate}</p>
              <span className="text-sm text-muted-foreground line-through">${billing.defaultRate}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 text-xs mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Monthly Savings
            </div>
            <p className="text-2xl font-bold text-emerald-400">${savings}</p>
          </div>
        </div>
        
        {/* Seat Usage Progress */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Seat Utilization</span>
            <span className="text-sm font-medium text-foreground">{billing.usedSeats} / {billing.contractedSeats} seats</span>
          </div>
          <div className="relative">
            <Progress 
              value={seatUsagePercent} 
              className="h-3 bg-muted/30"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${seatUsagePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{billing.contractedSeats - billing.usedSeats} seats remaining</span>
            <span className="text-xs text-cyan-400">{seatUsagePercent.toFixed(0)}% utilized</span>
          </div>
        </div>
        
        {/* Monthly Estimate */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-white/[0.05]">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Monthly Estimate</p>
              <p className="text-xs text-muted-foreground">Next billing: {new Date(billing.nextBillingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">${monthlyEstimate.toLocaleString()}</p>
        </div>
        
        {/* Payment Method */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{billing.paymentMethod} •••• {billing.paymentLast4}</p>
              <p className="text-xs text-muted-foreground">Primary payment method</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-white/[0.1] hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400">
            Update
          </Button>
        </div>
        
        {/* Invoice History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Invoice History
            </h4>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-cyan-400">
              View All
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="rounded-xl border border-white/[0.08] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.08] hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Invoice</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Amount</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 5).map((invoice) => (
                  <TableRow key={invoice.id} className="border-white/[0.05] hover:bg-white/[0.02]">
                    <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-sm font-medium">${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-cyan-400">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Contact Sales */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div>
            <p className="text-sm font-medium text-foreground">Need to adjust your contract?</p>
            <p className="text-xs text-muted-foreground">Contact your account executive for seat changes or renewals</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium shadow-lg shadow-purple-500/25">
            Contact Sales
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
